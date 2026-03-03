<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        return response()->json(Role::query()->latest('role_id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'role_name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ]);

        $role = Role::create($validated);

        return response()->json($role, 201);
    }

    public function show(string $id)
    {
        return response()->json(Role::query()->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $role = Role::query()->findOrFail($id);

        $validated = $request->validate([
            'role_name' => ['sometimes', 'required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ]);

        $role->update($validated);

        return response()->json($role);
    }

    public function destroy(string $id)
    {
        $role = Role::query()->findOrFail($id);
        $role->delete();

        return response()->noContent();
    }
}
