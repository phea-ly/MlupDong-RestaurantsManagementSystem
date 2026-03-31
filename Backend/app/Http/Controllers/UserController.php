<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('role')->get();

        return response()->json($users->map(function ($user) {
            return [
                'user_id'    => $user->user_id,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'email'      => $user->email,
                'role_id'    => $user->role_id,
                'role_name'  => $user->getRelation('role')?->role_name ?? null,
                'status'     => $user->status,
                'avatar'     => $user->avatar_url,
                'created_at' => $user->created_at,
            ];
        }));
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
        $user->load(['role', 'staff']);
        $this->syncStaffRecord($user);

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
        $user->load(['role', 'staff']);
        $this->syncStaffRecord($user);

        return response()->json($user->load(['role', 'restaurant', 'staff']));
    }

    public function destroy(string $id)
    {
        $user = User::query()->findOrFail($id);

        $authId = auth('api')->id();
        if ($authId && (int) $authId === (int) $user->user_id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 403);
        }

        // Delete related staff record first to avoid foreign key constraint
        $user->staff()->delete();

        $user->delete();

        return response()->noContent();
    }

    private function syncStaffRecord(User $user): void
    {
        $roleName = strtolower((string) ($user->role?->role_name ?? $user->role ?? ''));

        // Roles that automatically get a staff record
        $staffRoles = ['staff', 'waiter', 'cashier', 'chef', 'cheff'];
        // Roles that never get a staff record
        $excludedRoles = ['admin', 'administrator'];

        // Remove staff record if role changed to admin
        if (in_array($roleName, $excludedRoles, true)) {
            $user->staff()->delete();
            return;
        }

        // Auto-create staff record only for staff roles
        if (in_array($roleName, $staffRoles, true) && !$user->staff) {
            Staff::create([
                'user_id'   => $user->user_id,
                'position'  => ucfirst($roleName),
                'is_active' => (bool) $user->status,
            ]);
        }

        // Client/other roles: don't auto-create, but don't delete existing either
    }
}
