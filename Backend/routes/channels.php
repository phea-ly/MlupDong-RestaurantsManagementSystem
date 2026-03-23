<?php
// routes/channels.php

use Illuminate\Support\Facades\Broadcast;

// Kitchen channel — all KDS screens subscribe here
Broadcast::channel('kitchen', function () {
    return true; // Public; add staff auth here if needed
});

// Per-table channel — eMenu subscribes to track its own order
Broadcast::channel('table.{tableNumber}', function ($user, string $tableNumber) {
    return true; // Add table ownership check if needed
});