<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class SalesReportController extends Controller
{
    private const COMPLETED = ['completed'];
    private const PAID      = ['paid'];

    public function summary(Request $request)
    {
        $request->validate([
            'period'    => ['nullable', 'in:today,yesterday,last7days,custom'],
            'date_from' => ['nullable', 'date'],
            'date_to'   => ['nullable', 'date'],
        ]);

        [$from, $to]         = $this->resolvePeriod($request);
        [$prevFrom, $prevTo] = $this->previousPeriod($from, $to);

        $current  = $this->periodStats($from, $to);
        $previous = $this->periodStats($prevFrom, $prevTo);

        $prevRevenue = (float) $previous['revenue'];
        $prevOrders  = (int)   $previous['orders'];
        $prevAvg     = $prevOrders > 0 ? $prevRevenue / $prevOrders : 0;
        $prevProfit  = $prevRevenue * 0.64;

        $revenue   = (float) $current['revenue'];
        $orders    = (int)   $current['orders'];
        $avgOrder  = $orders > 0 ? $revenue / $orders : 0;
        $netProfit = $revenue * 0.64;

        return response()->json([
            'period' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'stats'  => [
                [
                    'label' => 'Total Revenue',
                    'value' => '$' . number_format($revenue,   2),
                    'raw'   => $revenue,
                    'trend' => $this->trend($revenue,   $prevRevenue),
                    'sub'   => 'vs previous period',
                    'up'    => $revenue  >= $prevRevenue,
                    'icon'  => 'mdi-cash-multiple',
                    'color' => 'success',
                ],
                [
                    'label' => 'Total Orders',
                    'value' => (string) $orders,
                    'raw'   => $orders,
                    'trend' => $this->trend($orders,    $prevOrders),
                    'sub'   => 'vs previous period',
                    'up'    => $orders   >= $prevOrders,
                    'icon'  => 'mdi-receipt-text-outline',
                    'color' => 'blue',
                ],
                [
                    'label' => 'Avg. Order',
                    'value' => '$' . number_format($avgOrder,  2),
                    'raw'   => $avgOrder,
                    'trend' => $this->trend($avgOrder,  $prevAvg),
                    'sub'   => 'vs previous period',
                    'up'    => $avgOrder >= $prevAvg,
                    'icon'  => 'mdi-clipboard-list-outline',
                    'color' => 'orange',
                ],
                [
                    'label' => 'Net Profit',
                    'value' => '$' . number_format($netProfit, 2),
                    'raw'   => $netProfit,
                    'trend' => $this->trend($netProfit, $prevProfit),
                    'sub'   => 'vs previous period',
                    'up'    => $netProfit >= $prevProfit,
                    'icon'  => 'mdi-trending-up',
                    'color' => 'purple',
                ],
            ],
        ]);
    }

    public function chart(Request $request)
    {
        $request->validate([
            'period'    => ['nullable', 'in:today,yesterday,last7days,custom'],
            'date_from' => ['nullable', 'date'],
            'date_to'   => ['nullable', 'date'],
        ]);

        [$from, $to] = $this->resolvePeriod($request);

        $rows = Order::query()
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders')
            ->whereBetween('created_at', [$from->startOfDay(), $to->copy()->endOfDay()])
            // ✅ Fix: use order_status (matches OrderController enum)
            ->whereIn('order_status', self::COMPLETED)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'labels'  => $rows->pluck('date'),
            'revenue' => $rows->pluck('revenue')->map(fn ($v) => round((float) $v, 2)),
            'orders'  => $rows->pluck('orders'),
        ]);
    }

    public function categories(Request $request)
    {
        $request->validate([
            'period'    => ['nullable', 'in:today,yesterday,last7days,custom'],
            'date_from' => ['nullable', 'date'],
            'date_to'   => ['nullable', 'date'],
        ]);

        [$from, $to] = $this->resolvePeriod($request);

        $rows = OrderItem::query()
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.menu_item_id')
            ->join('categories', 'menu_items.category_id',  '=', 'categories.category_id')
            ->join('orders',     'order_items.order_id',    '=', 'orders.order_id')
            ->whereBetween('orders.created_at', [$from->startOfDay(), $to->copy()->endOfDay()])
            // ✅ Fix: use order_status
            ->whereIn('orders.order_status', self::COMPLETED)
            ->selectRaw('categories.category_name as name, SUM(order_items.subtotal) as revenue')
            ->groupBy('categories.category_id', 'categories.category_name')
            ->orderByDesc('revenue')
            ->get();

        $total  = $rows->sum('revenue') ?: 1;
        $colors = ['success', 'blue', 'orange', 'purple', 'teal', 'red', 'pink', 'cyan'];

        return response()->json(
            $rows->values()->map(fn ($row, $i) => [
                'name'  => $row->name,
                'pct'   => round(($row->revenue / $total) * 100),
                'color' => $colors[$i % count($colors)],
            ])
        );
    }

    public function orders(Request $request)
    {
        $request->validate([
            'period'    => ['nullable', 'in:today,yesterday,last7days,custom'],
            'date_from' => ['nullable', 'date'],
            'date_to'   => ['nullable', 'date'],
            'search'    => ['nullable', 'string'],
            'per_page'  => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        [$from, $to] = $this->resolvePeriod($request);

        $query = Order::query()
            // ✅ Fix: eager-load 'payments' (plural) — matches OrderController relationship
            ->with(['orderItems.menuItem', 'payments'])
            ->whereBetween('created_at', [$from->startOfDay(), $to->copy()->endOfDay()])
            ->latest('order_id');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('order_id', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        $orders  = $query->paginate($perPage);

        return response()->json([
            'data' => $orders->map(fn ($o) => $this->mapOrder($o)),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'per_page'     => $orders->perPage(),
                'total'        => $orders->total(),
            ],
        ]);
    }

    // ── Private helpers ───────────────────────────────────────────────────────
    private function resolvePeriod(Request $request): array
    {
        $period = $request->input('period', 'today');
        $now    = now();

        return match ($period) {
            'yesterday' => [
                $now->copy()->subDay()->startOfDay(),
                $now->copy()->subDay()->endOfDay(),
            ],
            'last7days' => [
                $now->copy()->subDays(6)->startOfDay(),
                $now->copy()->endOfDay(),
            ],
            'custom'    => [
                \Carbon\Carbon::parse($request->input('date_from', $now->toDateString()))->startOfDay(),
                \Carbon\Carbon::parse($request->input('date_to',   $now->toDateString()))->endOfDay(),
            ],
            default     => [    // today
                $now->copy()->startOfDay(),
                $now->copy()->endOfDay(),
            ],
        };
    }

    private function previousPeriod($from, $to): array
    {
        $days = $from->diffInDays($to) + 1;
        return [
            $from->copy()->subDays($days),
            $to->copy()->subDays($days),
        ];
    }

    private function periodStats($from, $to): array
    {
        $row = Order::query()
            ->whereBetween('created_at', [$from, $to])
            // ✅ Fix: order_status not status
            ->whereIn('order_status', self::COMPLETED)
            ->selectRaw('COALESCE(SUM(total_amount), 0) as revenue, COUNT(*) as orders')
            ->first();

        return ['revenue' => $row->revenue, 'orders' => $row->orders];
    }

    private function trend(float $current, float $previous): string
    {
        if ($previous == 0) return $current > 0 ? '+100%' : '0%';
        $pct  = (($current - $previous) / $previous) * 100;
        $sign = $pct >= 0 ? '+' : '';
        return $sign . number_format($pct, 1) . '%';
    }

    private function mapOrder(Order $order): array
    {
        $items = $order->orderItems
            ->map(fn ($i) => $i->menuItem?->item_name ?? 'Unknown')
            ->implode(', ');

        // ✅ Fix: 'payments' is a hasMany — take the first one
        $payment = $order->payments->first();
        $method  = $payment?->payment_method ?? 'Cash';

        $icon = match (strtolower($method)) {
            'credit_card', 'card', 'visa', 'mastercard' => 'mdi-credit-card-outline',
            'qr', 'qr_code', 'khqr', 'aba'              => 'mdi-qrcode',
            default                                      => 'mdi-cash',
        };

        return [
            'date'    => $order->created_at->format('M d, H:i'),
            'id'      => $order->order_number ?? 'ORD-' . str_pad($order->order_id, 4, '0', STR_PAD_LEFT),
            'items'   => $items ?: '—',
            'payment' => ucfirst(str_replace('_', ' ', $method)),
            'payIcon' => $icon,
            'amount'  => '$' . number_format($order->total_amount, 2),
        ];
    }
}