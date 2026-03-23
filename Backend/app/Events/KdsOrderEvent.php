<?php
// app/Events/KdsOrderEvent.php

namespace App\Events;

use App\Support\KdsPayload;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class KdsOrderEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string     $eventType,  // e.g. 'order.created', 'order.status.updated'
        public readonly KdsPayload $payload,
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            new Channel('kitchen'),
        ];

        // Also push to the specific table channel so the eMenu can track status
        if ($this->payload->tableNumber) {
            $channels[] = new Channel('table.' . $this->payload->tableNumber);
        }

        return $channels;
    }

    // The frontend listens for `.order.created`, `.order.status.updated`, etc.
    public function broadcastAs(): string
    {
        return $this->eventType;
    }

    public function broadcastWith(): array
    {
        return $this->payload->toArray();
    }
}