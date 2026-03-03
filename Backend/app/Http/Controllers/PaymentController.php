<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentController extends Controller
{
    public function index()
    {
        return response()->json(Payment::query()->with('order')->latest('payment_id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => ['required', 'exists:orders,order_id'],
            'payment_method' => ['required', Rule::in(['cash', 'card', 'aba', 'wing'])],
            'amount_paid' => ['nullable', 'numeric', 'min:0'],
            'change_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_status' => ['required', Rule::in(['pending', 'completed', 'failed'])],
            'payment_date' => ['nullable', 'date'],
        ]);

        $payment = Payment::query()->create($validated);

        return response()->json($payment->load('order'), 201);
    }

    public function show(string $id)
    {
        return response()->json(Payment::query()->with('order')->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $payment = Payment::query()->findOrFail($id);

        $validated = $request->validate([
            'order_id' => ['sometimes', 'required', 'exists:orders,order_id'],
            'payment_method' => ['sometimes', 'required', Rule::in(['cash', 'card', 'aba', 'wing'])],
            'amount_paid' => ['nullable', 'numeric', 'min:0'],
            'change_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_status' => ['sometimes', 'required', Rule::in(['pending', 'completed', 'failed'])],
            'payment_date' => ['nullable', 'date'],
        ]);

        $payment->update($validated);

        return response()->json($payment->load('order'));
    }

    public function destroy(string $id)
    {
        $payment = Payment::query()->findOrFail($id);
        $payment->delete();

        return response()->noContent();
    }
}
