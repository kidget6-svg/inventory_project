<?php

namespace App\Models;

use App\Models\Medicine;
use App\Models\RetailProduct;
use App\Models\StockMovement;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class PurchaseOrder extends Model
{
    use HasFactory;

    // Status Constants
    public const STATUS_DRAFT = 'draft';
    public const STATUS_PENDING = 'pending';
    public const STATUS_SENT = 'sent';
    public const STATUS_DELIVERED = 'delivered';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'supplier_id',
        'manufacturing_company',
        'order_date',
        'total_amount',
        'status',
        'sent_at',
        'delivered_at',
        'completed_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'completed_at' => 'datetime',
        'order_date' => 'date',
    ];

    /**
     * Get all valid statuses.
     *
     * Workflow: Draft -> Pending -> Approved -> Completed -> Cancelled
     * (sent/delivered are legacy intermediate states kept for backward compatibility)
     */
    public static function statuses(): array
    {
        return ['draft', 'pending', 'sent', 'delivered', 'approved', 'completed', 'cancelled'];
    }

    /**
     * Always expose status as lowercase so checks are reliable
     * even if existing DB values have different casing.
     */
    public function getStatusAttribute($value): string
    {
        return is_string($value) ? strtolower($value) : $value;
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
     * Whether the order can be edited (draft, pending, or approved).
     */
    public function canEdit(): bool
    {
        return in_array($this->status, ['draft', 'pending', 'approved']);
    }

    /**
     * Whether the order can be deleted (draft only).
     */
    public function canDelete(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Whether the order can be submitted (draft only).
     * Draft -> Pending
     */
    public function canSubmit(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Whether the order can be sent to supplier (pending only).
     * Pending -> Sent
     */
    public function canSend(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Whether the order can be marked as delivered (sent only).
     * Sent -> Delivered
     */
    public function canDeliver(): bool
    {
        return $this->status === 'sent';
    }

    /**
     * Whether the order can be approved (pending only).
     * Pending -> Approved
     */
    public function canApprove(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Whether the order can be completed (delivered or approved).
     * Delivered -> Completed | Approved -> Completed
     */
    public function canComplete(): bool
    {
        return in_array($this->status, ['delivered', 'approved']);
    }

    /**
     * Whether the order can be cancelled (draft, pending, sent, delivered, or approved).
     */
    public function canCancel(): bool
    {
        return in_array($this->status, ['draft', 'pending', 'sent', 'delivered', 'approved']);
    }

    /**
     * Whether the order can be reopened (cancelled only).
     * Cancelled -> Pending
     */
    public function canReopen(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Whether the PDF can be generated for this order.
     * Available for all statuses.
     */
    public function canGeneratePdf(): bool
    {
        return true;
    }

    /**
     * Whether the PDF can be viewed for this order.
     * Available for all statuses except draft.
     */
    public function canViewPdf(): bool
    {
        return $this->status !== 'draft';
    }

    /**
     * Whether the PDF can be downloaded for this order.
     * Available for all statuses except draft.
     */
    public function canDownloadPdf(): bool
    {
        return $this->status !== 'draft';
    }

    /**
     * Whether the order can be re-sent to the supplier.
     * Available for sent, approved, and completed statuses.
     * Allows supplier communication after the initial send.
     */
    public function canResend(): bool
    {
        return in_array($this->status, ['sent', 'approved', 'completed']);
    }

    /**
     * Submit the purchase order (draft -> pending).
     */
    public function submit(): bool
    {
        if (! $this->canSubmit()) {
            return false;
        }

        return $this->update(['status' => 'pending']);
    }

    /**
     * Send the purchase order to the supplier (pending -> sent).
     * The sent_at timestamp is recorded by the service layer
     * (PurchaseOrderService::sendToSupplier) immediately after
     * the email is successfully dispatched, so it is not set here.
     */
    public function send(): bool
    {
        if (! $this->canSend()) {
            return false;
        }

        return $this->update([
            'status' => 'sent',
        ]);
    }

    /**
     * Mark the purchase order as delivered (sent -> delivered).
     * Records the delivered_at timestamp.
     */
    public function deliver(): bool
    {
        if (! $this->canDeliver()) {
            return false;
        }

        return $this->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);
    }

    /**
     * Approve the purchase order (pending -> approved).
     */
    public function approve(): bool
    {
        if (! $this->canApprove()) {
            return false;
        }

        return $this->update(['status' => 'approved']);
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
     * Reopen a cancelled purchase order (cancelled -> pending).
     */
    public function reopen(): bool
    {
        if (! $this->canReopen()) {
            return false;
        }

        return $this->update(['status' => 'pending']);
    }

    /**
     * Complete the purchase order:
     * - Update stock quantities for medicines AND retail products
     * - Create stock movement records (polymorphic)
     * - Prevent duplicate stock additions
     * - Records the completed_at timestamp
     * Delivered -> Completed | Approved -> Completed
     */
    public function complete(): bool
    {
        if (! $this->canComplete()) {
            return false;
        }

        DB::beginTransaction();

        try {
            $this->load('items');

            foreach ($this->items as $item) {
                // Resolve the product via polymorphic relationship (preferred)
                $product = $item->itemable;

                // Fallback to medicine relationship for legacy items
                if (! $product && $item->medicine_id) {
                    $product = Medicine::lockForUpdate()->find($item->medicine_id);
                }

                if (! $product) {
                    throw new \RuntimeException('Product not found for order item ' . $item->id);
                }

                // Lock the product row for update
                if ($product instanceof RetailProduct) {
                    $product = RetailProduct::lockForUpdate()->find($product->id);
                } elseif ($product instanceof Medicine) {
                    $product = Medicine::lockForUpdate()->find($product->id);
                }

                if (! $product) {
                    throw new \RuntimeException('Failed to lock product for order item ' . $item->id);
                }

                // Check if a stock movement already exists for this PO item
                // to prevent duplicate stock additions
                $existingMovement = StockMovement::where('itemable_type', get_class($product))
                    ->where('itemable_id', $product->id)
                    ->where('reference', 'PO-' . $this->id)
                    ->where('type', 'in')
                    ->exists();

                // Also check legacy medicine_id column
                if (! $existingMovement && $product instanceof Medicine) {
                    $existingMovement = StockMovement::where('medicine_id', $product->id)
                        ->where('reference', 'PO-' . $this->id)
                        ->where('type', 'in')
                        ->exists();
                }

                if (! $existingMovement) {
                    if (! $product->increment('quantity', $item->quantity)) {
                        throw new \RuntimeException('Failed to increment stock for product ' . $product->id);
                    }

                    StockMovement::create([
                        'medicine_id' => $product instanceof Medicine ? $product->id : null,
                        'itemable_type' => get_class($product),
                        'itemable_id' => $product->id,
                        'type' => 'in',
                        'quantity' => $item->quantity,
                        'reference' => 'PO-' . $this->id,
                        'notes' => 'Stock added via purchase order #' . $this->id,
                    ]);
                }
            }

            if (! $this->update([
                'status' => 'completed',
                'completed_at' => now(),
            ])) {
                throw new \RuntimeException('Failed to update purchase order status to completed.');
            }

            DB::commit();

            return true;
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Purchase order completion failed', [
                'purchase_order_id' => $this->id,
                'status' => $this->status,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    // ==================================================================
    // Email status display helpers
    // ==================================================================

    /**
     * Mail drivers that provide delivery tracking (e.g. via webhooks).
     * Drivers not in this list cannot confirm whether an email was
     * actually delivered to the recipient.
     */
    public static function deliveryTrackingDrivers(): array
    {
        return ['ses', 'mailgun', 'postmark'];
    }

    /**
     * Whether the currently configured mail driver can confirm
     * email delivery (e.g. via webhooks or delivery receipts).
     */
    public static function mailDriverSupportsDeliveryTracking(): bool
    {
        $driver = config('mail.mailer') ?? config('mail.driver') ?? 'log';

        return in_array($driver, self::deliveryTrackingDrivers());
    }

    /**
     * Human-readable "Sent At" display value.
     *
     * - "Not sent yet." when the email has not been dispatched.
     * - The formatted timestamp once the email has been sent.
     */
    public function sentAtDisplay(): string
    {
        if (! $this->sent_at) {
            return 'Not sent yet.';
        }

        return $this->sent_at->format('M d, Y h:i A');
    }

    /**
     * Human-readable "Delivered At" display value.
     *
     * - The formatted timestamp when delivery has been confirmed.
     * - "Delivery confirmation unavailable" when the current mail
     *   driver does not provide delivery tracking.
     * - "Not delivered yet." when tracking IS available but delivery
     *   has not yet been confirmed.
     */
    public function deliveredAtDisplay(): string
    {
        if ($this->delivered_at) {
            return $this->delivered_at->format('M d, Y h:i A');
        }

        if (! self::mailDriverSupportsDeliveryTracking()) {
            return 'Delivery confirmation unavailable';
        }

        return 'Not delivered yet.';
    }

    /**
     * Accessor so sent_at_display is included in API/JSON responses.
     */
    public function getSentAtDisplayAttribute(): string
    {
        return $this->sentAtDisplay();
    }

    /**
     * Accessor so delivered_at_display is included in API/JSON responses.
     */
    public function getDeliveredAtDisplayAttribute(): string
    {
        return $this->deliveredAtDisplay();
    }
}
