<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockTransfer extends Model
{
    use HasFactory;

    // Status Constants
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_IN_TRANSIT = 'in_transit';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    // Priority Constants
    const PRIORITY_LOW = 'low';
    const PRIORITY_MEDIUM = 'medium';
    const PRIORITY_HIGH = 'high';
    const PRIORITY_URGENT = 'urgent';

    protected $fillable = [
        'medicine_id',
        'from_location',
        'to_location',
        'from_branch_id',
        'to_branch_id',
        'quantity',
        'status',
        'priority',
        'transfer_date',
        'expected_delivery',
        'actual_delivery',
        'notes',
        'requested_by',
        'approved_by',
        'completed_by',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'transfer_date' => 'date',
        'expected_delivery' => 'date',
        'actual_delivery' => 'date',
    ];

    // Relationships
    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function fromBranch()
    {
        return $this->belongsTo(Branch::class, 'from_branch_id');
    }

    public function toBranch()
    {
        return $this->belongsTo(Branch::class, 'to_branch_id');
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function completedBy()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    // Accessors
    public function getStatusLabelAttribute()
    {
        $labels = [
            self::STATUS_PENDING => 'Pending',
            self::STATUS_APPROVED => 'Approved',
            self::STATUS_IN_TRANSIT => 'In Transit',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
        ];
        return $labels[$this->status] ?? $this->status;
    }

    public function getStatusBadgeAttribute()
    {
        $colors = [
            self::STATUS_PENDING => 'bg-yellow-100 text-yellow-700',
            self::STATUS_APPROVED => 'bg-blue-100 text-blue-700',
            self::STATUS_IN_TRANSIT => 'bg-purple-100 text-purple-700',
            self::STATUS_COMPLETED => 'bg-green-100 text-green-700',
            self::STATUS_CANCELLED => 'bg-red-100 text-red-700',
        ];
        return $colors[$this->status] ?? 'bg-gray-100 text-gray-700';
    }

    public function getPriorityBadgeAttribute()
    {
        $colors = [
            self::PRIORITY_LOW => 'bg-gray-100 text-gray-700',
            self::PRIORITY_MEDIUM => 'bg-blue-100 text-blue-700',
            self::PRIORITY_HIGH => 'bg-orange-100 text-orange-700',
            self::PRIORITY_URGENT => 'bg-red-100 text-red-700',
        ];
        return $colors[$this->priority] ?? 'bg-gray-100 text-gray-700';
    }

    // Methods
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved()
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function approve($userId = null)
    {
        $this->status = self::STATUS_APPROVED;
        $this->approved_by = $userId ?? auth()->id();
        $this->save();
    }

    public function markInTransit()
    {
        $this->status = self::STATUS_IN_TRANSIT;
        $this->save();
    }

    public function complete($userId = null)
    {
        $this->status = self::STATUS_COMPLETED;
        $this->completed_by = $userId ?? auth()->id();
        $this->actual_delivery = now();
        $this->save();
    }

    public function cancel()
    {
        $this->status = self::STATUS_CANCELLED;
        $this->save();
    }
}