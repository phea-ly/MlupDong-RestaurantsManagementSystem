<?php

namespace App\Traits;

use App\Models\ActivityLog;

/**
 * LogsActivity trait
 *
 * Add to any controller:
 *   use LogsActivity;
 *
 * Then call:
 *   $this->logActivity('menu', 'created', "Menu item \"{$item->item_name}\" created");
 *   $this->logActivity('user', 'deleted', "User #{$id} deleted", ['user_id' => $id]);
 */
trait LogsActivity
{
    protected function logActivity(
        string $eventType,
        string $action,
        string $description,
        array  $metadata = []
    ): void {
        try {
            ActivityLog::record($eventType, $action, $description, $metadata);
        } catch (\Throwable) {
            // Never let logging crash the actual request
        }
    }
}