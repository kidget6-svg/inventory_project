<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class PurchaseOrder extends Model
{
    use HasFactory;

    // Status Constants
    const STATUS_DRAFT = 'draft';
    const STATUS_PENDING = 'pending';
    const STATUS_SENT = 'sent';
    const STATUS_APPROVED = 'approved';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_PARTIALLY_RECEIVED = 'partially_received';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'supplier_id',
        'order_number',
        'order_date',
        'status',
        'total_amount',
        'currency',
        'payment_terms',
        'delivery_terms',
        'expected_delivery',
        'actual_delivery',
        'notes',
        'created_by',
        'approved_by',
    ];

    protected $casts = [
        'order_date' => 'date',
        'expected_delivery' => 'date',
        'actual_delivery' => 'date',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'completed_at' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    // Relationships
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeDraft($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    // Accessors
    public function getStatusLabelAttribute()
    {
        $labels = [
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_PENDING => 'Pending',
            self::STATUS_SENT => 'Sent',
            self::STATUS_APPROVED => 'Approved',
            self::STATUS_PARTIALLY_RECEIVED => 'Partially Received',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
        ];
        return $labels[$this->status] ?? $this->status;
    }

    public function getStatusBadgeAttribute()
    {
        $colors = [
            self::STATUS_DRAFT => 'bg-gray-100 text-gray-700',
            self::STATUS_PENDING => 'bg-yellow-100 text-yellow-700',
            self::STATUS_SENT => 'bg-blue-100 text-blue-700',
            self::STATUS_APPROVED => 'bg-green-100 text-green-700',
            self::STATUS_PARTIALLY_RECEIVED => 'bg-purple-100 text-purple-700',
            self::STATUS_COMPLETED => 'bg-emerald-100 text-emerald-700',
            self::STATUS_CANCELLED => 'bg-red-100 text-red-700',
        ];
        return $colors[$this->status] ?? 'bg-gray-100 text-gray-700';
    }

    // Methods
    public function canEdit()
    {
        return in_array($this->status, [self::STATUS_DRAFT, self::STATUS_PENDING]);
    }

    public function canDelete()
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function canSubmit()
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function canSend()
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function canGeneratePdf()
    {
        return $this->status !== self::STATUS_DRAFT;
    }

    public function canDownloadPdf()
    {
        return $this->status !== self::STATUS_DRAFT;
    }

    public function canResend()
    {
        return in_array($this->status, [
            self::STATUS_SENT,
            self::STATUS_APPROVED,
            self::STATUS_COMPLETED,
        ], true);
    }

    public function canApprove()
    {
        return $this->status === self::STATUS_PENDING || $this->status === self::STATUS_SENT;
    }

    public function canDeliver()
    {
        return $this->status === self::STATUS_APPROVED || $this->status === self::STATUS_SENT;
    }

    public function canComplete()
    {
        return $this->status === self::STATUS_DELIVERED || $this->status === self::STATUS_APPROVED;
    }

    public function canCancel()
    {
        return !in_array($this->status, [self::STATUS_COMPLETED, self::STATUS_CANCELLED]);
    }

    public function canReopen()
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    public function submit()
    {
        $this->status = self::STATUS_PENDING;
        $this->save();
    }

    public function send()
    {
        $this->status = self::STATUS_SENT;
        $this->sent_at = now();
        $this->save();
    }

    public function approve()
    {
        $this->status = self::STATUS_APPROVED;
        $this->save();
    }

    public function deliver()
    {
        $this->status = self::STATUS_DELIVERED;
        $this->delivered_at = now();
        $this->save();
    }

    public function complete()
    {
        DB::transaction(function () {
            foreach ($this->items()->with('medicine')->get() as $item) {
                if (! $item->medicine) {
                    continue;
                }

                $reference = 'PO-' . $this->id;
                if (StockMovement::where('reference', $reference)->exists()) {
                    continue;
                }

                $medicine = Medicine::lockForUpdate()->findOrFail($item->medicine_id);
                $beforeQuantity = $medicine->quantity;
                $medicine->increment('quantity', $item->quantity);

                StockMovement::create([
                    'medicine_id' => $medicine->id,
                    'user_id' => auth()->id(),
                    'type' => 'in',
                    'quantity' => $item->quantity,
                    'before_quantity' => $beforeQuantity,
                    'after_quantity' => $beforeQuantity + $item->quantity,
                    'reference' => $reference,
                    'notes' => 'Stock received from purchase order ' . $this->id,
                ]);
            }

            $this->status = self::STATUS_COMPLETED;
            $this->completed_at = now();
            $this->save();
        });
    }

    public function cancel()
    {
        $this->status = self::STATUS_CANCELLED;
        $this->save();
    }

    public function reopen()
    {
        $this->status = self::STATUS_PENDING;
        $this->save();
    }
}
