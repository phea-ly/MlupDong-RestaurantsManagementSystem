<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ActivityLog extends Model
{
    protected $primaryKey = 'log_id';

    protected $fillable = [
        'user_id',
        'event_type',
        'action',
        'description',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    protected $casts = [
        'metadata'   => 'array',
        'created_at' => 'datetime',
    ];

    // ── Relationship ──────────────────────────────────────────────────────────
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    // ── Static helper — call this anywhere ────────────────────────────────────
    /**
     * Quick log shortcut:
     *   ActivityLog::record('menu', 'created', "Burger created");
     *   ActivityLog::record('user', 'login',   "admin logged in", ['extra' => 'data']);
     */
    public static function record(
        string $eventType,
        string $action,
        string $description,
        array  $metadata = []
    ): self {
        return self::create([
            'user_id'     => Auth::id(),
            'event_type'  => $eventType,
            'action'      => $action,
            'description' => $description,
            'ip_address'  => Request::ip(),
            'user_agent'  => Request::userAgent(),
            'metadata'    => empty($metadata) ? null : $metadata,
        ]);
    }
}