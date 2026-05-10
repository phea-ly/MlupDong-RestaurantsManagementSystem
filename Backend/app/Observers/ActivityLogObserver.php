<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\RestaurantTable;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

/**
 * Registered in AppServiceProvider::boot():
 *
 *   User::observe(ActivityLogObserver::class);
 *   MenuItem::observe(ActivityLogObserver::class);
 *   Category::observe(ActivityLogObserver::class);
 *   RestaurantTable::observe(ActivityLogObserver::class);
 *   Staff::observe(ActivityLogObserver::class);
 *   Order::observe(ActivityLogObserver::class);
 */
class ActivityLogObserver
{
    // ── Helpers ───────────────────────────────────────────────────────────────
    private function label(mixed $model): string
    {
        return match (true) {
            $model instanceof User            => "User \"{$model->email}\"",
            $model instanceof MenuItem        => "Menu item \"{$model->item_name}\"",
            $model instanceof Category        => "Category \"{$model->category_name}\"",
            $model instanceof RestaurantTable => "Table #{$model->table_number}",
            $model instanceof Staff           => "Staff #{$model->staff_id}",
            $model instanceof Order           => "Order #{$model->order_id}",
            default                           => class_basename($model) . ' #' . $model->getKey(),
        };
    }

    private function eventType(mixed $model): string
    {
        return match (true) {
            $model instanceof User            => 'user',
            $model instanceof MenuItem        => 'menu',
            $model instanceof Category        => 'category',
            $model instanceof RestaurantTable => 'table',
            $model instanceof Staff           => 'staff',
            $model instanceof Order           => 'order',
            default                           => 'system',
        };
    }

    private function write(string $eventType, string $action, string $description, array $meta = []): void
    {
        try {
            ActivityLog::create([
                'user_id'     => Auth::id(),
                'event_type'  => $eventType,
                'action'      => $action,
                'description' => $description,
                'ip_address'  => Request::ip(),
                'user_agent'  => Request::userAgent(),
                'metadata'    => empty($meta) ? null : $meta,
            ]);
        } catch (\Throwable) {
            // Never let logging crash the actual request
        }
    }

    // ── Hooks ─────────────────────────────────────────────────────────────────
    public function created(mixed $model): void
    {
        $this->write(
            $this->eventType($model),
            'created',
            $this->label($model) . ' was created.'
        );
    }

    public function updated(mixed $model): void
    {
        // Skip logging if only qr_code / qr_code_url changed — TableController
        // logs that explicitly as 'qr_generated' with more context
        $changed = array_keys($model->getChanges());
        $qrOnly  = !array_diff($changed, ['qr_code', 'qr_code_url', 'updated_at']);
        if ($qrOnly) return;

        $this->write(
            $this->eventType($model),
            'updated',
            $this->label($model) . ' was updated.',
            ['changed_fields' => $changed]
        );
    }

    public function deleted(mixed $model): void
    {
        $this->write(
            $this->eventType($model),
            'deleted',
            $this->label($model) . ' was deleted.',
            ['deleted_id' => $model->getKey()]
        );
    }
}