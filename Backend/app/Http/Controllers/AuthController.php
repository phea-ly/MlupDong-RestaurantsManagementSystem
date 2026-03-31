<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    use LogsActivity;

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            ActivityLog::create([
                'user_id'     => null,
                'event_type'  => 'user',
                'action'      => 'login_failed',
                'description' => "Failed login — email \"{$request->email}\" not found.",
                'ip_address'  => $request->ip(),
                'user_agent'  => $request->userAgent(),
            ]);
            return response()->json(['message' => 'Email not found.'], 401);
        }

        if (!$token = JWTAuth::attempt($request->only('email', 'password'))) {
            ActivityLog::create([
                'user_id'     => $user->user_id,
                'event_type'  => 'user',
                'action'      => 'login_failed',
                'description' => "Failed login — incorrect password for \"{$request->email}\".",
                'ip_address'  => $request->ip(),
                'user_agent'  => $request->userAgent(),
            ]);
            return response()->json(['message' => 'Incorrect password.'], 401);
        }

        $this->logActivity('user', 'login', "User \"{$user->email}\" logged in.");

        // Eager-load role so role_name is always present in the response.
        // The Vue router uses role_name to decide which dashboard to land on.
        $user->load('role');

        $cookieName     = config('jwt.cookie.name', 'auth_token');
        $cookieTtl      = (int) config('jwt.ttl', 60);
        $cookiePath     = config('jwt.cookie.path', '/');
        $cookieDomain   = config('jwt.cookie.domain');
        $cookieSecure   = (bool) config('jwt.cookie.secure', false);
        $cookieSameSite = config('jwt.cookie.same_site', 'lax');

        return response()->json([
            'user'       => $this->formatUser($user),
            'expires_in' => $cookieTtl * 60,
        ])->cookie(
            $cookieName,
            $token,
            $cookieTtl,
            $cookiePath,
            $cookieDomain,
            $cookieSecure,
            true,   // httpOnly — JS can never read the raw token
            false,
            $cookieSameSite
        );
    }

    public function logout()
    {
        try {
            $user = auth('api')->user();
            $this->logActivity('user', 'logout', "User \"{$user?->email}\" logged out.");
            $cookieName = config('jwt.cookie.name', 'auth_token');
            $token = request()->bearerToken() ?: request()->cookie($cookieName);
            if ($token) {
                JWTAuth::setToken($token)->invalidate();
            }
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to logout, please try again'], 500);
        }

        $cookieName     = config('jwt.cookie.name', 'auth_token');
        $cookiePath     = config('jwt.cookie.path', '/');
        $cookieDomain   = config('jwt.cookie.domain');
        $cookieSecure   = (bool) config('jwt.cookie.secure', false);
        $cookieSameSite = config('jwt.cookie.same_site', 'lax');

        // Set TTL to -1 so the browser expires the cookie immediately
        return response()->json(['message' => 'Successfully logged out'])->cookie(
            $cookieName,
            '',
            -1,
            $cookiePath,
            $cookieDomain,
            $cookieSecure,
            true,
            false,
            $cookieSameSite
        );
    }

    public function getUser()
    {
        try {
            if (config('app.debug')) {
                $cookieName = config('jwt.cookie.name', 'auth_token');
                $raw = request()->cookie($cookieName);
                Log::info('Auth cookie debug', [
                    'cookie_name' => $cookieName,
                    'present'     => (bool) $raw,
                    'length'      => $raw ? strlen($raw) : 0,
                    'origin'      => request()->headers->get('origin'),
                ]);
            }

            $user = auth('api')->user();
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            // Reload role on every /user call so a role change takes effect immediately
            $user->load('role');

            return response()->json(['user' => $this->formatUser($user)]);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to fetch user profile'], 500);
        }
    }

    public function updateUser(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'first_name'       => 'sometimes|string|max:100',
            'last_name'        => 'sometimes|string|max:100',
            'current_password' => 'sometimes|string',
            'password'         => 'sometimes|string|min:6|confirmed',
            'avatar'           => 'sometimes|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $data = $request->only('first_name', 'last_name');

        if ($request->hasFile('avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        if ($request->filled('password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['message' => 'Current password is incorrect.'], 422);
            }
            $data['password'] = Hash::make($request->password);
            $this->logActivity('user', 'password_changed', "User \"{$user->email}\" changed their password.");
        }

        $user->update($data);
        $user->refresh()->load('role');

        return response()->json([
            'success' => true,
            'user'    => $this->formatUser($user),
        ]);
    }

    /**
     * Serialize a User for API responses.
     *
     * role_name (from the roles table via the eager-loaded relation) is now
     * included at the top level. The frontend auth store reads this field to
     * determine which dashboard to redirect to after login / on refresh.
     *
     * Routing matrix (matched case-insensitively in utils/auth.js):
     *   admin            → /home          (full admin dashboard)
     *   chef             → /chef          (KDS / kitchen display)
     *   waiter           → /waiter        (service station)
     *   cashier          → /waiter
     *   staff            → /waiter        (default; may also visit /chef)
     */
    // AuthController.php — find this method and replace it

    private function formatUser(User $user): array
    {
        $role = $user->getRelation('role'); // ← add this line

        return [
            'id'         => $user->user_id,
            'email'      => $user->email,
            'first_name' => $user->first_name,
            'last_name'  => $user->last_name,
            'role_id'    => $user->role_id,
            'role_name'  => $role?->role_name ?? null, // ← changed from $user->role?->role_name
            'avatar'     => $user->avatar_url
                ? $user->avatar_url . '?t=' . time()
                : null,
        ];
    }
}
