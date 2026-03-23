<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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

        // User not found
        if (!$user) {
            // Log without Auth::id() — user doesn't exist
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
            // User exists but wrong password
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

        // Successful login
        $this->logActivity('user', 'login', "User \"{$user->email}\" logged in.");

        return response()->json([
            'token'      => $token,
            'expires_in' => config('jwt.ttl') * 60,
            'user'       => $this->formatUser($user),
        ]);
    }

    public function logout()
    {
        try {
            $user = auth('api')->user();
            $this->logActivity('user', 'logout', "User \"{$user?->email}\" logged out.");
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to logout, please try again'], 500);
        }

        return response()->json(['message' => 'Successfully logged out']);
    }

    public function getUser()
    {
        try {
            $user = auth('api')->user();
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }
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