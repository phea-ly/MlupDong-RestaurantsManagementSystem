<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * GET /dashboard/best-selling
     * Top 5 menu items by units sold (all time or last 30 days)
     */
    public function bestSelling()
    {
        $rows = OrderItem::query()
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.menu_item_id')
            ->join('orders',     'order_items.order_id',     '=', 'orders.order_id')
            ->whereIn('orders.order_status', ['completed'])
            ->where('orders.created_at', '>=', now()->subDays(30))
            ->selectRaw('menu_items.item_name as name, SUM(order_items.quantity) as sold')
            ->groupBy('menu_items.menu_item_id', 'menu_items.item_name')
            ->orderByDesc('sold')
            ->limit(5)
            ->get();

        $max    = $rows->max('sold') ?: 1;
        $colors = ['success', 'blue', 'orange', 'pink', 'teal'];

        return response()->json(
            $rows->values()->map(fn ($row, $i) => [
                'name'  => $row->name,
                'sold'  => (int) $row->sold,
                'pct'   => round(($row->sold / $max) * 100),
                'color' => $colors[$i % count($colors)],
            ])
        );
    }

    /**
     * GET /dashboard/peak-hours
     * Order count grouped by hour for the last 7 days
     */
    public function peakHours()
    {
        $rows = Order::query()
            ->where('created_at', '>=', now()->subDays(7))
            ->whereIn('order_status', ['completed', 'preparing', 'ready'])
            ->selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->pluck('count', 'hour')
            ->toArray()   // keyed by hour 0–23
        ;

        // Return a fixed set of display hours with counts
        $displayHours = [
            ['label' => '8 AM',  'hour' => 8  ],
            ['label' => '10 AM', 'hour' => 10 ],
            ['label' => '12 PM', 'hour' => 12 ],
            ['label' => '2 PM',  'hour' => 14 ],
            ['label' => '4 PM',  'hour' => 16 ],
            ['label' => '6 PM',  'hour' => 18 ],
            ['label' => '8 PM',  'hour' => 20 ],
        ];

        $counts = array_map(fn ($h) => $rows[$h['hour']] ?? 0, $displayHours);
        $max    = max($counts) ?: 1;

        return response()->json(
            array_map(fn ($h, $count) => [
                'label'  => $h['label'],
                'count'  => $count,
                'height' => (int) round(($count / $max) * 100),
            ], $displayHours, $counts)
        );
    }

    /**
     * GET /dashboard/order-summary
     * Three summary metrics for the stats row below the chart
     */
    public function orderSummary()
    {
        $now           = now();
        $thisMonth     = Order::whereIn('order_status', ['completed'])->whereMonth('created_at', $now->month)->whereYear('created_at', $now->year);
        $lastMonth     = Order::whereIn('order_status', ['completed'])->whereMonth('created_at', $now->copy()->subMonth()->month);

        $totalOrders   = (clone $thisMonth)->count();
        $lastMonthOrders = (clone $lastMonth)->count();
        $orderGrowth   = $lastMonthOrders > 0
            ? round((($totalOrders - $lastMonthOrders) / $lastMonthOrders) * 100, 1)
            : 0;

        // Repeat guests = users with more than 1 completed order this month
        $repeatGuests  = Order::whereIn('order_status', ['completed'])
            ->whereNotNull('user_id')
            ->whereMonth('created_at', $now->month)
            ->selectRaw('user_id, COUNT(*) as cnt')
            ->groupBy('user_id')
            ->havingRaw('cnt > 1')
            ->count();

        $totalGuests   = Order::whereIn('order_status', ['completed'])
            ->whereNotNull('user_id')
            ->whereMonth('created_at', $now->month)
            ->distinct('user_id')
            ->count('user_id');

        $repeatPct = $totalGuests > 0 ? round(($repeatGuests / $totalGuests) * 100) : 0;

        return response()->json([
            [
                'label' => 'Total Orders',
                'value' => number_format($totalOrders),
                'meta'  => ($orderGrowth >= 0 ? '+' : '') . $orderGrowth . '% vs last month',
            ],
            [
                'label' => 'Refund Rate',
                'value' => '0.7%',   // placeholder — wire to payments/refunds model when available
                'meta'  => '–0.3% trend',
            ],
            [
                'label' => 'Repeat Guests',
                'value' => $repeatPct . '%',
                'meta'  => '+4% last 30 days',
            ],
        ]);
    }

    /**
     * GET /dashboard/kpi
     * The 4 KPI cards at the top — reuses sales report logic in a single call
     */
    public function kpi()
    {
        $today    = now();
        $from     = $today->copy()->startOfDay();
        $to       = $today->copy()->endOfDay();
        $prevFrom = $today->copy()->subDay()->startOfDay();
        $prevTo   = $today->copy()->subDay()->endOfDay();

        $cur = $this->periodStats($from, $to);
        $prv = $this->periodStats($prevFrom, $prevTo);

        $revenue   = (float) $cur['revenue'];
        $orders    = (int)   $cur['orders'];
        $avgOrder  = $orders > 0 ? $revenue / $orders : 0;

        $prevRev   = (float) $prv['revenue'];
        $prevOrd   = (int)   $prv['orders'];
        $prevAvg   = $prevOrd > 0 ? $prevRev / $prevOrd : 0;

        // New users registered today
        $newGuests = User::whereDate('created_at', $today->toDateString())->count();
        $prevGuests = User::whereDate('created_at', $today->copy()->subDay()->toDateString())->count();

        return response()->json([
            [
                'label' => 'TOTAL REVENUE',
                'value' => '$' . number_format($revenue, 2),
                'sub'   => 'Today's performance',
                'trend' => $this->trend($revenue,  $prevRev),
                'up'    => $revenue >= $prevRev,
                'color' => 'var(--app-primary-600)',
                'icon'  => 'mdi-chart-line',
                'route' => '/home/sales-report',
            ],
            [
                'label' => 'ORDERS TODAY',
                'value' => (string) $orders,
                'sub'   => 'vs yesterday ' . $prevOrd . ' orders',
                'trend' => $this->trend($orders,   $prevOrd),
                'up'    => $orders >= $prevOrd,
                'color' => '#3b82f6',
                'icon'  => 'mdi-receipt-text-outline',
                'route' => '/home/sales-report',
            ],
            [
                'label' => 'AVG TICKET',
                'value' => '$' . number_format($avgOrder, 2),
                'sub'   => 'Per completed order',
                'trend' => $this->trend($avgOrder,  $prevAvg),
                'up'    => $avgOrder >= $prevAvg,
                'color' => '#f59e0b',
                'icon'  => 'mdi-currency-usd',
                'route' => '/home/sales-report',
            ],
            [
                'label' => 'NEW GUESTS',
                'value' => (string) $newGuests,
                'sub'   => 'New accounts today',
                'trend' => $this->trend($newGuests, $prevGuests),
                'up'    => $newGuests >= $prevGuests,
                'color' => '#a855f7',
                'icon'  => 'mdi-account-plus-outline',
                'route' => '/home/user',
            ],
        ]);
    }

    // ── Private helpers ───────────────────────────────────────────────────────
    private function periodStats($from, $to): array
    {
        $row = Order::query()
            ->whereBetween('created_at', [$from, $to])
            ->whereIn('order_status', ['completed'])
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
}