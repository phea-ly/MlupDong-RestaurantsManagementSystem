<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;   
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
<<<<<<< HEAD
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'sometimes|string|in:admin,client',
        ]);

        $name = trim($request->name);
        $firstName = Str::of($name)->before(' ')->value();
        $lastName = trim(Str::of($name)->after(' ')->value());

        $user = User::create([
            'first_name' => $firstName,
            'last_name' => $lastName !== '' ? $lastName : $firstName,
            'email' => $request->email,
            'role' => $request->input('role', 'client'),
            'password' => Hash::make($request->password),
        ]);

        try {
            $token = JWTAuth::fromUser($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 500);
        }

        return response()->json([
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|string|email',
=======
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
>>>>>>> c4255a11263de64539af4715253de56ebbc217b2
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email not found.'], 401);
        }

        if (!$token = JWTAuth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Incorrect password.'], 401);
        }

        return response()->json([
            'token'      => $token,
            'expires_in' => config('jwt.ttl') * 60,
            'user'       => $this->formatUser($user), // ✅ now includes avatar_url
        ]);
    }

    public function logout()
    {
        try {
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