<?php

namespace App\Models;

use App\Models\Medicine;
use App\Models\StockMovement;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\DB;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier_id',
        'order_date',
        'total_amount',
        'status',
    ];

    /**
     * Get all valid statuses.
     */
    public static function statuses(): array
    {
        return ['pending', 'approved', 'processing', 'completed', 'cancelled'];
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    /**
     * Whether the order can be edited (pending or approved).
     */
    public function canEdit(): bool
    {
        return in_array($this->status, ['pending', 'approved']);
    }

    /**
     * Whether the order can be deleted (pending only).
     */
    public function canDelete(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Whether the order can be approved (pending only).
     */
    public function canApprove(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Whether the order can be processed (approved only).
     */
    public function canProcess(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Whether the order can be completed (approved or processing).
     */
    public function canComplete(): bool
    {
        return in_array($this->status, ['approved', 'processing']);
    }

    /**
     * Whether the order can be cancelled (pending, approved, or processing).
     */
    public function canCancel(): bool
    {
        return in_array($this->status, ['pending', 'approved', 'processing']);
    }

    /**
     * Approve the purchase order.
     */
    public function approve(): bool
    {
        if (! $this->canApprove()) {
            return false;
        }

        return DB::transaction(function () {
            $updated = $this->update(['status' => 'approved']);

            if (! $updated) {
                return false;
            }

            foreach ($this->items as $item) {
                $medicine = Medicine::lockForUpdate()->find($item->medicine_id);

                if (! $medicine) {
                    continue;
                }

                $existingMovement = StockMovement::where('medicine_id', $medicine->id)
                    ->where('reference', 'PO-' . $this->id)
                    ->where('type', 'in')
                    ->exists();

                if (! $existingMovement) {
                    $medicine->increment('quantity', $item->quantity);

                    StockMovement::create([
                        'medicine_id' => $medicine->id,
                        'type' => 'in',
                        'quantity' => $item->quantity,
                        'reference' => 'PO-' . $this->id,
                        'notes' => 'Stock added via purchase order #' . $this->id,
                    ]);
                }
            }

            return true;
        });
    }

    /**
     * Mark the purchase order as processing.
     */
    public function process(): bool
    {
        if (! $this->canProcess()) {
            return false;
        }

        return $this->update(['status' => 'processing']);
    }

    /**
     * Cancel the purchase order.
     */
    public function cancel(): bool
    {
        if (! $this->canCancel()) {
            return false;
        }

        return $this->update(['status' => 'cancelled']);
    }

    /**
     * Complete the purchase order:
     * - Update medicine stock quantities
     * - Create stock movement records
     * - Prevent duplicate stock additions
     */
    public function complete(): bool
    {
        if (! $this->canComplete()) {
            return false;
        }

        DB::beginTransaction();

        try {
            foreach ($this->items as $item) {
                $medicine = Medicine::lockForUpdate()->find($item->medicine_id);

                if (! $medicine) {
                    continue;
                }

                // Check if a stock movement already exists for this PO item
                // to prevent duplicate stock additions
                $existingMovement = StockMovement::where('medicine_id', $medicine->id)
                    ->where('reference', 'PO-' . $this->id)
                    ->where('type', 'in')
                    ->exists();

                if (! $existingMovement) {
                    // Increment stock
                    $medicine->increment('quantity', $item->quantity);

                    // Create stock movement record
                    StockMovement::create([
                        'medicine_id' => $medicine->id,
                        'type' => 'in',
                        'quantity' => $item->quantity,
                        'reference' => 'PO-' . $this->id,
                        'notes' => 'Stock added via purchase order #' . $this->id,
                    ]);
                }
            }

            $this->update(['status' => 'completed']);

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            return false;
        }
    }
}
