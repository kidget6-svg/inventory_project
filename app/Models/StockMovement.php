<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use HasFactory;

    // Movement Types
    const TYPE_IN = 'in';
    const TYPE_OUT = 'out';
    const TYPE_TRANSFER = 'transfer';
    const TYPE_ADJUSTMENT = 'adjustment';
    const TYPE_RETURN = 'return';
    const TYPE_DAMAGED = 'damaged';
    const TYPE_EXPIRED = 'expired';
    const TYPE_LOST = 'lost';
    const TYPE_CORRECTION = 'correction';
    const TYPE_SELF = 'self';

    // Status Types
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'medicine_id',
        'itemable_type',
        'itemable_id',
        'batch_id',
        'type',
        'quantity',
        'before_quantity',
        'after_quantity',
        'manufacturer',
        'user_id',
        'source_type',
        'source_id',
        'destination_type',
        'destination_id',
        'reference',
        'notes',
        'status',
        'ip_address',
        'user_agent',
        'approved_by',
        'approved_at',
        'completed_by',
        'completed_at',
        'linked_movement_id',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'before_quantity' => 'integer',
        'after_quantity' => 'integer',
        'approved_at' => 'datetime',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    /**
     * Polymorphic relationship to the moved item (Medicine or RetailProduct).
     */
    public function itemable()
    {
        return $this->morphTo();
    }

    public function retailProduct()
    {
        return $this->belongsTo(RetailProduct::class, 'itemable_id')
            ->where('itemable_type', RetailProduct::class);
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'source_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function completedBy()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function completer()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function linkedMovement()
    {
        return $this->belongsTo(StockMovement::class, 'linked_movement_id');
    }

    // Scopes
    public function scopeType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeBetweenDates($query, $start, $end)
    {
        return $query->whereBetween('created_at', [$start, $end]);
    }

    // Accessors
    public function getTypeLabelAttribute()
    {
        $labels = [
            self::TYPE_IN => 'Stock In',
            self::TYPE_OUT => 'Stock Out',
            self::TYPE_TRANSFER => 'Transfer',
            self::TYPE_ADJUSTMENT => 'Adjustment',
            self::TYPE_RETURN => 'Return',
            self::TYPE_DAMAGED => 'Damaged',
            self::TYPE_EXPIRED => 'Expired',
            self::TYPE_LOST => 'Lost',
            self::TYPE_CORRECTION => 'Correction',
            self::TYPE_SELF => 'Self Adjustment',
        ];
        return $labels[$this->type] ?? $this->type;
    }

    public function getTypeColorAttribute()
    {
        $colors = [
            self::TYPE_IN => 'bg-emerald-100 text-emerald-700 border-emerald-200',
            self::TYPE_OUT => 'bg-red-100 text-red-700 border-red-200',
            self::TYPE_TRANSFER => 'bg-purple-100 text-purple-700 border-purple-200',
            self::TYPE_ADJUSTMENT => 'bg-amber-100 text-amber-700 border-amber-200',
            self::TYPE_RETURN => 'bg-sky-100 text-sky-700 border-sky-200',
            self::TYPE_DAMAGED => 'bg-red-100 text-red-700 border-red-200',
            self::TYPE_EXPIRED => 'bg-gray-100 text-gray-700 border-gray-200',
            self::TYPE_LOST => 'bg-orange-100 text-orange-700 border-orange-200',
            self::TYPE_CORRECTION => 'bg-blue-100 text-blue-700 border-blue-200',
            self::TYPE_SELF => 'bg-teal-100 text-teal-700 border-teal-200',
        ];
        return $colors[$this->type] ?? 'bg-gray-100 text-gray-700 border-gray-200';
    }

    public function getStatusLabelAttribute()
    {
        $labels = [
            self::STATUS_PENDING => 'Pending',
            self::STATUS_APPROVED => 'Approved',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
        ];
        return $labels[$this->status] ?? $this->status;
    }

    public function getStatusColorAttribute()
    {
        $colors = [
            self::STATUS_PENDING => 'bg-yellow-100 text-yellow-700',
            self::STATUS_APPROVED => 'bg-blue-100 text-blue-700',
            self::STATUS_COMPLETED => 'bg-green-100 text-green-700',
            self::STATUS_CANCELLED => 'bg-red-100 text-red-700',
        ];
        return $colors[$this->status] ?? 'bg-gray-100 text-gray-700';
    }

    // Methods
    public function isComplete()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function approve($userId = null)
    {
        $this->status = self::STATUS_APPROVED;
        $this->approved_by = $userId ?? auth()->id();
        $this->approved_at = now();
        $this->save();
    }

    public function complete($userId = null)
    {
        $this->status = self::STATUS_COMPLETED;
        $this->completed_by = $userId ?? auth()->id();
        $this->completed_at = now();
        $this->save();
    }

    public function cancel()
    {
        $this->status = self::STATUS_CANCELLED;
        $this->save();
    }
}