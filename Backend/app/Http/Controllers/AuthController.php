<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
// use App\Http\Requests\LoginRequest;
// use App\Http\Resources\UserResource;
// use Illuminate\Database\Eloquent\Attributes\UseResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // Check if email exists first
        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Email not found.',
            ], 401);
        }

        // Email exists but password wrong
        if (!$token = JWTAuth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Incorrect password.',
            ], 401);
        }

        return response()->json([
            'token'      => $token,
            'expires_in' => config('jwt.ttl') * 60,
            'user'       => [
                'id'         => $user->user_id,
                'email'      => $user->email,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'role_id'    => $user->role_id,
            ],
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
            return response()->json($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to fetch user profile'], 500);
        }
    }

    public function updateUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . auth('api')->id() . ',user_id',
        ]);

        try {
            $user = auth('api')->user();

            if (isset($validated['name'])) {
                $name = trim($validated['name']);
                $firstName = Str::of($name)->before(' ')->value();
                $lastName = trim(Str::of($name)->after(' ')->value());
                $validated['first_name'] = $firstName;
                $validated['last_name'] = $lastName !== '' ? $lastName : $firstName;
                unset($validated['name']);
            }

            $user->update($validated);

            return response()->json($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to update user'], 500);
        }
    }
}
