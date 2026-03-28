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
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

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

        // ── User not found ────────────────────────────────────────────────────────
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

        // ── Wrong password ────────────────────────────────────────────────────────
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

        // ── Success ───────────────────────────────────────────────────────────────
        $this->logActivity('user', 'login', "User \"{$user->email}\" logged in.");

        $cookieName     = config('jwt.cookie.name',      'auth_token');
        $cookieTtl      = (int) config('jwt.ttl',         60);          // minutes
        $cookiePath     = config('jwt.cookie.path',       '/');
        $cookieDomain   = config('jwt.cookie.domain');
        $cookieSecure   = (bool) config('jwt.cookie.secure',    false);
        $cookieSameSite = config('jwt.cookie.same_site',  'lax');

        return response()->json([
            'token'      => $token,                  // ← Bearer token for frontend
            'token_type' => 'bearer',
            'expires_in' => $cookieTtl * 60,         // seconds, easier for JS
            'user'       => $this->formatUser($user),
        ])->cookie(
            $cookieName,
            $token,
            $cookieTtl,
            $cookiePath,
            $cookieDomain,
            $cookieSecure,
            true,          // HttpOnly — protects against XSS
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

        $cookieName = config('jwt.cookie.name', 'auth_token');
        $cookiePath = config('jwt.cookie.path', '/');
        $cookieDomain = config('jwt.cookie.domain');
        $cookieSecure = (bool) config('jwt.cookie.secure', false);
        $cookieSameSite = config('jwt.cookie.same_site', 'lax');

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

    public function getMe()
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            return response()->json([
                'user' => $user,
            ]);
        } catch (TokenExpiredException $e) {
            return response()->json(['error' => 'Token has expired'], 401);
        } catch (TokenInvalidException $e) {
            return response()->json(['error' => 'Token is invalid'], 401);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Token not provided'], 401);
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
            // Log password change explicitly (observer shows 'updated' but not what changed)
            $this->logActivity('user', 'password_changed', "User \"{$user->email}\" changed their password.");
        }

        $user->update($data);
        $user->refresh();

        return response()->json([
            'success' => true,
            'user'    => $this->formatUser($user),
        ]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id'         => $user->user_id,
            'email'      => $user->email,
            'first_name' => $user->first_name,
            'last_name'  => $user->last_name,
            'role_id'    => $user->role_id,
            'avatar'     => $user->avatar_url
                ? $user->avatar_url . '?t=' . time()
                : null,
        ];
    }
}
