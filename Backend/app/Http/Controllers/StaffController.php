<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index()
    {
        return response()->json(Staff::query()->with('user')->latest('staff_id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,user_id'],
            'position' => ['nullable', 'string', 'max:100'],
            'profile_image' => ['nullable', 'string', 'max:255'],
            'salary' => ['nullable', 'numeric', 'min:0'],
            'hire_date' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $staff = Staff::query()->create($validated);

        return response()->json($staff->load('user'), 201);
    }

    public function show(string $id)
    {
        return response()->json(Staff::query()->with('user')->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $staff = Staff::query()->findOrFail($id);

        $validated = $request->validate([
            'user_id' => ['sometimes', 'required', 'exists:users,user_id'],
            'position' => ['nullable', 'string', 'max:100'],
            'profile_image' => ['nullable', 'string', 'max:255'],
            'salary' => ['nullable', 'numeric', 'min:0'],
            'hire_date' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $staff->update($validated);

        return response()->json($staff->load('user'));
    }

    public function destroy(string $id)
    {
        $staff = Staff::query()->findOrFail($id);
        $staff->delete();

        return response()->noContent();
    }
}
