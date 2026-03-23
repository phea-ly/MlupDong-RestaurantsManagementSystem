<?php
// app/Observers/OrderObserver.php

namespace App\Observers;

use App\Models\Order;
use App\Models\OrderStatusLog;

class OrderObserver
{
    public function updated(Order $order): void
    {
        if ($order->wasChanged('order_status')) {
            OrderStatusLog::create([
                'order_id'   => $order->order_id,
                'status'     => $order->order_status,
                'changed_at' => now(),
                'note'       => 'Status changed via API',
            ]);
        }
    }
}