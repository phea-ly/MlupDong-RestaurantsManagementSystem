<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ActivityLogController extends Controller
{
    /**
     * GET /activity-logs
     * Query params: search, event_type, action, user_id, date_from, date_to, per_page, page
     */
    public function index(Request $request)
    {
        $query = ActivityLog::query()
            ->with('user')
            ->latest('log_id');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        if ($eventType = $request->input('event_type')) {
            $query->where('event_type', $eventType);
        }

        if ($action = $request->input('action')) {
            $query->where('action', $action);
        }

        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($from = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        $perPage = min((int) $request->input('per_page', 15), 100);
        $logs    = $query->paginate($perPage);

        return response()->json([
            'data' => $logs->map(fn ($log) => $this->mapLog($log)),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
                'per_page'     => $logs->perPage(),
                'total'        => $logs->total(),
            ],
        ]);
    }

    /**
     * GET /activity-logs/summary
     * Counts by event type + action, total entries, DB table size
     */
    public function summary()
    {
        $total = ActivityLog::count();

        $byEvent = ActivityLog::query()
            ->selectRaw('event_type, COUNT(*) as count')
            ->groupBy('event_type')
            ->orderByDesc('count')
            ->pluck('count', 'event_type');

        $byAction = ActivityLog::query()
            ->selectRaw('action, COUNT(*) as count')
            ->groupBy('action')
            ->orderByDesc('count')
            ->limit(8)
            ->pluck('count', 'action');

        // Recent activity: last 7 days by day
        $recentDays = ActivityLog::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date');

        // DB table size (MySQL/MariaDB)
        $dbSizeMb = 0;
        try {
            $row = DB::selectOne("
                SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
                FROM information_schema.TABLES
                WHERE table_schema = DATABASE()
                AND table_name = 'activity_logs'
            ");
            $dbSizeMb = $row?->size_mb ?? 0;
        } catch (\Throwable) {}

        return response()->json([
            'total_entries' => $total,
            'db_size_mb'    => (float) $dbSizeMb,
            'by_event'      => $byEvent,
            'by_action'     => $byAction,
            'recent_days'   => $recentDays,
        ]);
    }

    /**
     * GET /activity-logs/{id}
     */
    public function show(string $id)
    {
        $log = ActivityLog::with('user')->findOrFail($id);
        return response()->json($this->mapLog($log, detailed: true));
    }

    /**
     * DELETE /activity-logs/{id}
     */
    public function destroy(string $id)
    {
        ActivityLog::findOrFail($id)->delete();
        return response()->noContent();
    }

    /**
     * DELETE /activity-logs
     * Body: { before_date?: "YYYY-MM-DD" }
     * Bulk-clears all logs, or only those before a given date.
     */
    public function clear(Request $request)
    {
        $request->validate([
            'before_date' => ['nullable', 'date'],
        ]);

        $query = ActivityLog::query();

        if ($before = $request->input('before_date')) {
            $query->whereDate('created_at', '<=', $before);
        }

        $count = $query->count();
        $query->delete();

        return response()->json([
            'message' => "Deleted {$count} log entries.",
            'deleted' => $count,
        ]);
    }

    // ── Private mapper ────────────────────────────────────────────────────────
    private function mapLog(ActivityLog $log, bool $detailed = false): array
    {
        $user = $log->user;

        $base = [
            'id'          => $log->log_id,
            'event_type'  => $log->event_type  ?? '',
            'action'      => $log->action       ?? '',
            'description' => $log->description  ?? '',
            'ip_address'  => $log->ip_address   ?? '',
            'user_agent'  => $log->user_agent   ?? '',
            'created_at'  => $log->created_at?->toISOString(),
            'user'        => $user ? [
                'id'    => $user->user_id,
                'name'  => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')) ?: $user->email,
                'email' => $user->email,
                'role'  => $user->role?->name ?? $user->role?->role_name ?? '',
            ] : null,
        ];

        if ($detailed) {
            $base['metadata'] = $log->metadata ?? [];
        }

        return $base;
    }
}