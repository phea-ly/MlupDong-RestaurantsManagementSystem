<?php

namespace App\Events;

use App\Support\KdsPayload;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class KdsOrderEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $eventName;
    public array  $payload;

    public function __construct(string $eventName, KdsPayload $payload)
    {
        $this->eventName = $eventName;
        $this->payload   = $payload->toArray();
    }

    /**
     * Broadcast on BOTH channels:
     *  - "kitchen"         → KDS screen
     *  - "table.{number}"  → Customer success screen
     */
    public function broadcastOn(): array
    {
        $channels = [new Channel('kitchen')];

        // Add per-table channel so customer can track their order
        $tableNumber = $this->payload['table_number'] ?? null;
        if ($tableNumber) {
            $channels[] = new Channel("table.{$tableNumber}");
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return $this->eventName;
    }

    public function broadcastWith(): array
    {
        return $this->payload;
    }
}