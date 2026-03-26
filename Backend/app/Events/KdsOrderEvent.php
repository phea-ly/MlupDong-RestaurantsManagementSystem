<?php

namespace App\Events;

use App\Support\KdsPayload;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// ✅ Use ShouldBroadcastNow (not ShouldBroadcast) so it fires immediately
//    without needing a queue worker running
class KdsOrderEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string     $eventType,
        public readonly KdsPayload $payload,
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            new Channel('kitchen'),
        ];

        // Also push to per-table channel so customer menu can track status
        if ($this->payload->tableNumber) {
            $channels[] = new Channel('table.' . $this->payload->tableNumber);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return $this->eventType;   // frontend listens as '.order.created' etc.
    }

    public function broadcastWith(): array
    {
        return $this->payload->toArray();
    }
}