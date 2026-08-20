<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Medicine;
use App\Models\PurchaseOrder;
use App\Models\StockTransfer;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * AlertController
 *
 * Computes system alerts dynamically from existing tables:
 *   - medicines  (low stock, out of stock)
 *   - batches    (expiring soon, expired)
 *   - purchase_orders (pending / draft orders)
 *   - stock_transfers (pending transfers)
 *
 * No separate notifications table is used — all data comes from
 * the same sources already used by the Dashboard API.
 */
class AlertController extends Controller
{
    // How many days ahead to flag medicines as "expiring soon"
    const EXPIRY_SOON_DAYS = 30;

    // -------------------------------------------------------------------------
    //  Public API: GET /api/alerts
    // -------------------------------------------------------------------------

    public function index(Request $request)
    {
        $user        = Auth::user();
        $branchScope = $user ? $user->getBranchScope($request) : null;

        // ── collect all raw alerts ────────────────────────────────────────────
        $alerts = collect();

        $alerts = $alerts->merge($this->outOfStockAlerts($branchScope));
        $alerts = $alerts->merge($this->expiredAlerts($branchScope));
        $alerts = $alerts->merge($this->lowStockAlerts($branchScope));
        $alerts = $alerts->merge($this->expiringSoonAlerts($branchScope));
        $alerts = $alerts->merge($this->pendingPurchaseAlerts());
        $alerts = $alerts->merge($this->pendingTransferAlerts($branchScope));

        // ── apply search ──────────────────────────────────────────────────────
        if ($request->filled('search')) {
            $q = mb_strtolower(trim($request->search));
            $alerts = $alerts->filter(function ($a) use ($q) {
                return str_contains(mb_strtolower($a['title']), $q)
                    || str_contains(mb_strtolower($a['message']), $q)
                    || str_contains(mb_strtolower($a['location'] ?? ''), $q)
                    || str_contains(mb_strtolower($a['type']), $q);
            });
        }

        // ── apply type filter ─────────────────────────────────────────────────
        if ($request->filled('type') && $request->type !== 'all') {
            $type = $request->type;
            $alerts = $alerts->filter(fn($a) => $a['type'] === $type);
        }

        // ── apply priority filter ─────────────────────────────────────────────
        if ($request->filled('priority') && $request->priority !== 'all') {
            $priority = $request->priority;
            $alerts = $alerts->filter(fn($a) => $a['priority'] === $priority);
        }

        // ── apply date filter ─────────────────────────────────────────────────
        if ($request->filled('date_range')) {
            $now = Carbon::now();
            $cutoff = match ($request->date_range) {
                'today'     => Carbon::today(),
                'yesterday' => Carbon::yesterday(),
                'last_7'    => $now->copy()->subDays(6)->startOfDay(),
                'last_30'   => $now->copy()->subDays(29)->startOfDay(),
                default     => null,
            };

            if ($cutoff) {
                if ($request->date_range === 'yesterday') {
                    $alerts = $alerts->filter(function ($a) {
                        $ts = Carbon::parse($a['created_at']);
                        return $ts->isYesterday();
                    });
                } else {
                    $alerts = $alerts->filter(function ($a) use ($cutoff) {
                        return Carbon::parse($a['created_at'])->gte($cutoff);
                    });
                }
            }
        }

        // ── apply sort ────────────────────────────────────────────────────────
        $sort = $request->get('sort', 'newest');
        $alerts = match ($sort) {
            'oldest'   => $alerts->sortBy('created_at'),
            'priority' => $alerts->sortByDesc(fn($a) => $this->priorityWeight($a['priority'])),
            'unread'   => $alerts->sortByDesc(fn($a) => $a['is_unread'] ?? 0),
            default    => $alerts->sortByDesc('created_at'),
        };

        $alerts = $alerts->values();

        // ── paginate ──────────────────────────────────────────────────────────
        $perPage = min((int) $request->get('per_page', 20), 100);
        $page    = max((int) $request->get('page', 1), 1);
        $total   = $alerts->count();
        $items   = $alerts->forPage($page, $perPage)->values();

        return response()->json([
            'data' => $items,
            'meta' => [
                'total'        => $total,
                'per_page'     => $perPage,
                'current_page' => $page,
                'last_page'    => max(1, (int) ceil($total / $perPage)),
                'from'         => $total === 0 ? 0 : (($page - 1) * $perPage) + 1,
                'to'           => min($page * $perPage, $total),
            ],
        ]);
    }

    // -------------------------------------------------------------------------
    //  Public API: GET /api/alerts/summary
    // -------------------------------------------------------------------------

    public function summary(Request $request)
    {
        $user        = Auth::user();
        $branchScope = $user ? $user->getBranchScope($request) : null;

        $outOfStock    = Medicine::where('quantity', 0)
            ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
            ->count();

        $expired       = Batch::whereNotNull('expiry_date')
            ->where('expiry_date', '<', Carbon::today())
            ->when($branchScope, fn($q) => $q->whereHas('medicine', fn($m) => $m->where('branch_id', $branchScope)))
            ->count();

        $lowStock      = Medicine::where('quantity', '>', 0)
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
            ->count();

        $expiringSoon  = Batch::whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [Carbon::today(), Carbon::today()->addDays(self::EXPIRY_SOON_DAYS)])
            ->when($branchScope, fn($q) => $q->whereHas('medicine', fn($m) => $m->where('branch_id', $branchScope)))
            ->count();

        $pendingPO     = PurchaseOrder::whereIn('status', ['draft', 'pending'])->count();

        $pendingTransfer = StockTransfer::where('status', 'pending')
            ->when($branchScope, fn($q) => $q->where(function ($sub) use ($branchScope) {
                $sub->where('to_branch_id', $branchScope)
                    ->orWhere('from_branch_id', $branchScope);
            }))->count();

        $critical = $outOfStock + $expired;
        $warning  = $lowStock + $expiringSoon;
        $info     = $pendingPO + $pendingTransfer;
        $total    = $critical + $warning + $info;

        return response()->json([
            'total'    => $total,
            'critical' => $critical,
            'warning'  => $warning,
            'info'     => $info,
            // Breakdown
            'out_of_stock'     => $outOfStock,
            'expired'          => $expired,
            'low_stock'        => $lowStock,
            'expiring_soon'    => $expiringSoon,
            'pending_purchase' => $pendingPO,
            'pending_transfer' => $pendingTransfer,
        ]);
    }

    // =========================================================================
    //  Private helpers — one method per alert type
    // =========================================================================

    private function outOfStockAlerts(?int $branchScope): \Illuminate\Support\Collection
    {
        return Medicine::where('quantity', 0)
            ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
            ->with(['branch', 'category'])
            ->get()
            ->map(fn($med) => $this->makeAlert(
                id: 'out_stock_' . $med->id,
                type: 'out_of_stock',
                priority: 'critical',
                title: 'Out of Stock',
                message: "{$med->name} is completely out of stock.",
                medicine: $med,
                relatedType: 'medicine',
                relatedId: $med->id,
                navigateTo: '/medicines',
                extra: [
                    'quantity'     => $med->quantity,
                    'reorder_level' => $med->reorder_level,
                ],
                createdAt: $med->updated_at ?? $med->created_at,
            ));
    }

    private function expiredAlerts(?int $branchScope): \Illuminate\Support\Collection
    {
        return Batch::whereNotNull('expiry_date')
            ->where('expiry_date', '<', Carbon::today())
            ->when($branchScope, fn($q) => $q->whereHas('medicine', fn($m) => $m->where('branch_id', $branchScope)))
            ->with(['medicine.branch', 'medicine.category'])
            ->get()
            ->map(function ($batch) {
                $med = $batch->medicine;
                if (! $med) return null;

                $daysAgo = (int) Carbon::parse($batch->expiry_date)->diffInDays(Carbon::today());
                $msg = "{$med->name} (Batch: {$batch->batch_number}) expired "
                    . ($daysAgo === 0 ? 'today' : "{$daysAgo} day(s) ago")
                    . " on " . Carbon::parse($batch->expiry_date)->format('M d, Y') . ".";

                return $this->makeAlert(
                    id: 'expired_' . $batch->id,
                    type: 'expired',
                    priority: 'critical',
                    title: 'Expired Medicine',
                    message: $msg,
                    medicine: $med,
                    relatedType: 'batch',
                    relatedId: $batch->id,
                    navigateTo: '/medicines',
                    extra: [
                        'batch_number' => $batch->batch_number,
                        'expiry_date'  => $batch->expiry_date,
                        'quantity'     => $batch->quantity,
                    ],
                    createdAt: $batch->expiry_date,
                );
            })
            ->filter()
            ->values();
    }

    private function lowStockAlerts(?int $branchScope): \Illuminate\Support\Collection
    {
        return Medicine::where('quantity', '>', 0)
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
            ->with(['branch', 'category'])
            ->get()
            ->map(fn($med) => $this->makeAlert(
                id: 'low_stock_' . $med->id,
                type: 'low_stock',
                priority: 'warning',
                title: 'Low Stock',
                message: "{$med->name} has only {$med->quantity} unit(s) remaining (reorder level: {$med->reorder_level}).",
                medicine: $med,
                relatedType: 'medicine',
                relatedId: $med->id,
                navigateTo: '/medicines',
                extra: [
                    'quantity'      => $med->quantity,
                    'reorder_level' => $med->reorder_level,
                ],
                createdAt: $med->updated_at ?? $med->created_at,
            ));
    }

    private function expiringSoonAlerts(?int $branchScope): \Illuminate\Support\Collection
    {
        return Batch::whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [
                Carbon::today(),
                Carbon::today()->addDays(self::EXPIRY_SOON_DAYS),
            ])
            ->when($branchScope, fn($q) => $q->whereHas('medicine', fn($m) => $m->where('branch_id', $branchScope)))
            ->with(['medicine.branch', 'medicine.category'])
            ->get()
            ->map(function ($batch) {
                $med = $batch->medicine;
                if (! $med) return null;

                $days = (int) Carbon::today()->diffInDays(Carbon::parse($batch->expiry_date));
                $msg  = "{$med->name} (Batch: {$batch->batch_number}) expires in {$days} day(s) on "
                    . Carbon::parse($batch->expiry_date)->format('M d, Y') . ".";

                return $this->makeAlert(
                    id: 'expiring_' . $batch->id,
                    type: 'expiring_soon',
                    priority: 'warning',
                    title: 'Expiring Soon',
                    message: $msg,
                    medicine: $med,
                    relatedType: 'batch',
                    relatedId: $batch->id,
                    navigateTo: '/medicines',
                    extra: [
                        'batch_number' => $batch->batch_number,
                        'expiry_date'  => $batch->expiry_date,
                        'days_until_expiry' => $days,
                        'quantity'     => $batch->quantity,
                    ],
                    createdAt: $batch->updated_at ?? $batch->created_at,
                );
            })
            ->filter()
            ->values();
    }

    private function pendingPurchaseAlerts(): \Illuminate\Support\Collection
    {
        return PurchaseOrder::whereIn('status', ['draft', 'pending'])
            ->with('supplier')
            ->latest()
            ->get()
            ->map(function ($po) {
                $supplierName = $po->supplier->name ?? 'Unknown Supplier';
                $statusLabel  = ucfirst($po->status);

                return $this->makeAlert(
                    id: 'po_' . $po->id,
                    type: 'pending_purchase',
                    priority: 'info',
                    title: 'Pending Purchase Order',
                    message: "Purchase Order #{$po->id} from {$supplierName} is in {$statusLabel} status.",
                    medicine: null,
                    relatedType: 'purchase_order',
                    relatedId: $po->id,
                    navigateTo: '/purchase-orders',
                    extra: [
                        'po_id'        => $po->id,
                        'status'       => $po->status,
                        'supplier'     => $supplierName,
                        'total_amount' => $po->total_amount,
                        'order_date'   => $po->order_date,
                    ],
                    location: 'Central Warehouse',
                    locationType: 'warehouse',
                    createdAt: $po->created_at,
                );
            });
    }

    private function pendingTransferAlerts(?int $branchScope): \Illuminate\Support\Collection
    {
        return StockTransfer::where('status', 'pending')
            ->when($branchScope, fn($q) => $q->where(function ($sub) use ($branchScope) {
                $sub->where('to_branch_id', $branchScope)
                    ->orWhere('from_branch_id', $branchScope);
            }))
            ->with(['medicine', 'fromBranch', 'toBranch'])
            ->latest()
            ->get()
            ->map(function ($transfer) {
                $medName  = $transfer->medicine->name ?? 'Unknown Medicine';
                $from     = $transfer->fromBranch->name ?? ($transfer->from_location ?? 'Unknown');
                $to       = $transfer->toBranch->name   ?? ($transfer->to_location   ?? 'Unknown');
                $location = $from;
                $locType  = $transfer->fromBranch?->location_type ?? 'branch';

                return $this->makeAlert(
                    id: 'transfer_' . $transfer->id,
                    type: 'pending_transfer',
                    priority: 'info',
                    title: 'Pending Stock Transfer',
                    message: "Transfer of {$transfer->quantity} unit(s) of {$medName} from {$from} to {$to} is pending.",
                    medicine: $transfer->medicine ?? null,
                    relatedType: 'stock_transfer',
                    relatedId: $transfer->id,
                    navigateTo: '/stock-movements',
                    extra: [
                        'quantity'  => $transfer->quantity,
                        'from'      => $from,
                        'to'        => $to,
                        'priority'  => $transfer->priority ?? 'medium',
                    ],
                    location: $location,
                    locationType: $locType,
                    createdAt: $transfer->created_at,
                );
            });
    }

    // =========================================================================
    //  Alert factory
    // =========================================================================

    private function makeAlert(
        string $id,
        string $type,
        string $priority,
        string $title,
        string $message,
        ?object $medicine,
        string $relatedType,
        int $relatedId,
        string $navigateTo,
        array $extra = [],
        ?string $location = null,
        ?string $locationType = null,
        mixed $createdAt = null,
    ): array {
        // Resolve location from medicine → branch if not supplied explicitly
        if ($location === null && $medicine) {
            $branch = $medicine->branch ?? null;
            $location     = $branch?->name ?? 'System';
            $locationType = $branch?->location_type ?? 'branch';
        }

        return [
            'id'           => $id,
            'type'         => $type,
            'priority'     => $priority,
            'title'        => $title,
            'message'      => $message,
            'location'     => $location ?? 'System',
            'location_type'=> $locationType ?? 'branch',
            'medicine_id'  => $medicine?->id,
            'medicine_name'=> $medicine?->name,
            'related_type' => $relatedType,
            'related_id'   => $relatedId,
            'navigate_to'  => $navigateTo,
            'extra'        => $extra,
            'created_at'   => $createdAt
                ? Carbon::parse($createdAt)->toIso8601String()
                : Carbon::now()->toIso8601String(),
        ];
    }

    // =========================================================================
    //  Helpers
    // =========================================================================

    private function priorityWeight(string $priority): int
    {
        return match ($priority) {
            'critical' => 3,
            'warning'  => 2,
            'info'     => 1,
            default    => 0,
        };
    }
}
