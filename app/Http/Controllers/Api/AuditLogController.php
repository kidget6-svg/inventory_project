<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Apply the shared index/export filters to a query builder.
     */
    protected function applyFilters($query, Request $request)
    {
        if ($request->filled('branch_id') && $request->branch_id !== 'all') {
            $query->whereHas('user', fn ($q) => $q->where('branch_id', $request->branch_id));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }
        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                    $q->where('table_name', 'like', "%{$search}%")
                        ->orWhere('record_id', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%")
                        ->orWhere('action', 'like', "%{$search}%")
                        ->orWhere('module', 'like', "%{$search}%")
                        ->orWhereRaw('CAST(before_values AS CHAR) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('CAST(after_values AS CHAR) LIKE ?', ["%{$search}%"])
                        ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhereHas('branch', fn ($q3) => $q3->where('name', 'like', "%{$search}%"));
                    });
            });
        }

        return $query;
    }

    public function index(Request $request)
    {
        $query = AuditLog::with('user.branch');

        $this->applyFilters($query, $request);

        $sort = $request->get('sort', 'newest');
        $query->orderBy('created_at', $sort === 'oldest' ? 'asc' : 'desc');

        $logs = $query->paginate($request->get('per_page', 20));

        return response()->json($logs);
    }

    public function stats(Request $request)
    {
        $base = AuditLog::query();
        $this->applyFilters($base, $request);

        return response()->json([
            'total' => (clone $base)->count(),
            'today' => (clone $base)->whereDate('created_at', today())->count(),
            'created' => (clone $base)->where('action', 'create')->count(),
            'updated' => (clone $base)->where('action', 'update')->count(),
            'deleted' => (clone $base)->where('action', 'delete')->count(),
        ]);
    }

    public function modules()
    {
        $modules = AuditLog::distinct('module')->pluck('module');
        return response()->json($modules);
    }

    public function export(Request $request)
    {
        $format = $request->get('format', 'csv');
        $query = AuditLog::with('user.branch');
        $this->applyFilters($query, $request);
        $query->orderBy('created_at', 'desc');

        $logs = $query->get();

        if ($format === 'json') {
            return response()->json($logs);
        }

        $columns = [
            'id', 'created_at', 'user', 'email', 'branch',
            'action', 'module', 'table_name', 'record_id', 'ip_address',
        ];

        $callback = function () use ($logs, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->created_at,
                    $log->user?->name,
                    $log->user?->email,
                    $log->user?->branch?->name,
                    $log->action,
                    $log->module,
                    $log->table_name,
                    $log->record_id,
                    $log->ip_address,
                ]);
            }
            fclose($file);
        };

        $filename = 'audit-logs-' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload($callback, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
