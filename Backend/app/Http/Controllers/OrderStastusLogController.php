<?php

namespace App\Http\Controllers;

use App\Models\OrderStatusLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderStastusLogController extends Controller
{
    public function index()
    {
        return response()->json(OrderStatusLog::query()->with('order')->latest('log_id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => ['required', 'exists:orders,order_id'],
            'status' => ['required', Rule::in(['new', 'preparing', 'completed', 'cancelled'])],
            'changed_at' => ['nullable', 'date'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $orderStatusLog = OrderStatusLog::query()->create($validated);

        return response()->json($orderStatusLog->load('order'), 201);
    }

    public function show(string $id)
    {
        return response()->json(OrderStatusLog::query()->with('order')->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $orderStatusLog = OrderStatusLog::query()->findOrFail($id);

        $validated = $request->validate([
            'order_id' => ['sometimes', 'required', 'exists:orders,order_id'],
            'status' => ['sometimes', 'required', Rule::in(['new', 'preparing', 'completed', 'cancelled'])],
            'changed_at' => ['nullable', 'date'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $orderStatusLog->update($validated);

        return response()->json($orderStatusLog->load('order'));
    }

    public function destroy(string $id)
    {
        $orderStatusLog = OrderStatusLog::query()->findOrFail($id);
        $orderStatusLog->delete();

        return response()->noContent();
    }
}
