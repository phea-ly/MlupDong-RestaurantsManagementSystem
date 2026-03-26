<?php

// kds.orders is a PUBLIC channel — no auth needed

use Illuminate\Support\Facades\Broadcast;

// KDS public channel — kitchen display doesn't need auth
Broadcast::channel('kds.orders', fn () => true);