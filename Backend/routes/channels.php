<?php
// routes/channels.php

use Illuminate\Support\Facades\Broadcast;

// KDS screen — kitchen staff
Broadcast::channel('kitchen', function () {
    return true; // Public for KDS devices
});

// Per-table channel — customer tracks their order
// Pattern: table.1, table.2, table.A3, etc.
Broadcast::channel('table.{tableNumber}', function ($user, $tableNumber) {
    return true; // Public — customer has no auth
});