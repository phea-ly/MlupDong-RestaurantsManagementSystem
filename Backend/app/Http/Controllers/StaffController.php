<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index()
    {
        $staffs = Staff::with(['user.role'])->get();

        return response()->json($staffs->map(function ($staff) {
            $user = $staff->user;
            return [
                'staff_id'   => $staff->staff_id,
                'user_id'    => $staff->user_id,
                'position'   => $staff->position,
                'hire_date'  => $staff->hire_date,
                'salary'     => $staff->salary,
                'is_active'  => $staff->is_active,
                'created_at' => $staff->created_at,
                'user' => $user ? [
                    'user_id'    => $user->user_id,
                    'first_name' => $user->first_name,
                    'last_name'  => $user->last_name,
                    'email'      => $user->email,
                    'role_name'  => $user->getRelation('role')?->role_name ?? null,
                ] : null,
            ];
        }));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'   => ['required', 'exists:users,user_id'],
            'position'  => ['nullable', 'string', 'max:100'],
            'salary'    => ['nullable', 'numeric', 'min:0'],
            'hire_date' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $staff = Staff::create($validated);
        $staff->load(['user.role']);

        $user = $staff->user;

        return response()->json([
            'staff_id'   => $staff->staff_id,
            'user_id'    => $staff->user_id,
            'position'   => $staff->position,
            'hire_date'  => $staff->hire_date,
            'salary'     => $staff->salary,
            'is_active'  => $staff->is_active,
            'created_at' => $staff->created_at,
            'user' => $user ? [
                'user_id'    => $user->user_id,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'email'      => $user->email,
                'role_name'  => $user->getRelation('role')?->role_name ?? null,
            ] : null,
        ], 201);
    }

    public function show(string $id)
    {
        return response()->json(Staff::query()->with('user')->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $staff = Staff::findOrFail($id);

        $validated = $request->validate([
            'user_id'   => ['sometimes', 'required', 'exists:users,user_id'],
            'position'  => ['nullable', 'string', 'max:100'],
            'salary'    => ['nullable', 'numeric', 'min:0'],
            'hire_date' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $staff->update($validated);
        $staff->load(['user.role']);

        $user = $staff->user;

        return response()->json([
            'staff_id'   => $staff->staff_id,
            'user_id'    => $staff->user_id,
            'position'   => $staff->position,
            'hire_date'  => $staff->hire_date,
            'salary'     => $staff->salary,
            'is_active'  => $staff->is_active,
            'created_at' => $staff->created_at,
            'user' => $user ? [
                'user_id'    => $user->user_id,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'email'      => $user->email,
                'role_name'  => $user->getRelation('role')?->role_name ?? null,
            ] : null,
        ]);
    }

    public function destroy(string $id)
    {
        $staff = Staff::query()->findOrFail($id);
        $staff->delete();

        return response()->noContent();
    }
}
