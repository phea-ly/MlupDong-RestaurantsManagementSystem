<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(
            User::query()
                ->with(['role', 'restaurant', 'staff'])
                ->latest('user_id')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:20'],
            'profile' => ['nullable', 'BLOB', 'max:255'],
            'status' => ['nullable', 'boolean'],
            'role_id' => ['nullable', 'exists:roles,role_id'],
            'restaurant_id' => ['nullable', 'exists:restaurants,restaurant_id'],
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $user = User::query()->create($validated);

        return response()->json($user->load(['role', 'restaurant', 'staff']), 201);
    }

    public function show(string $id)
    {
        $user = User::query()->with(['role', 'restaurant', 'staff'])->findOrFail($id);

        return response()->json($user);
    }

    public function update(Request $request, string $id)
    {
        $user = User::query()->findOrFail($id);

        $validated = $request->validate([
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:150',
                Rule::unique('users', 'email')->ignore($id, 'user_id'),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:20'],
            'status' => ['nullable', 'boolean'],
            'role_id' => ['nullable', 'exists:roles,role_id'],
            'restaurant_id' => ['nullable', 'exists:restaurants,restaurant_id'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($validated);

        return response()->json($user->load(['role', 'restaurant', 'staff']));
    }

    public function destroy(string $id)
    {
        $user = User::query()->findOrFail($id);
        $user->delete();

        return response()->noContent();
    }
}
