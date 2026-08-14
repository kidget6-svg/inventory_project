<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'medicine_id',
        'user_id',
        'type',
        'quantity',
        'before_quantity',
        'after_quantity',
        'reference',
        'notes',
        'source_type',
        'source_id',
        'destination_type',
        'destination_id',
        'branch_id',
        'status',
        'approved_at',
        'approved_by',
        'completed_at',
        'completed_by',
        'ip_address',
        'device_info',
        'attachments',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'before_quantity' => 'integer',
        'after_quantity' => 'integer',
        'attachments' => 'array',
        'approved_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // Relationships
    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function completer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    // Accessors
    public function getTypeLabelAttribute(): string
    {
        return [
            'in' => 'Stock In',
            'out' => 'Stock Out',
            'adjustment' => 'Adjustment',
            'return' => 'Return',
            'transfer' => 'Transfer',
            'damaged' => 'Damaged',
            'expired' => 'Expired',
            'lost' => 'Lost',
            'correction' => 'Correction',
            'self' => 'Self Adjustment',
        ][$this->type] ?? $this->type;
    }

    public function getTypeColorAttribute(): string
    {
        return [
            'in' => 'green',
            'out' => 'red',
            'adjustment' => 'orange',
            'return' => 'blue',
            'transfer' => 'purple',
            'damaged' => 'red',
            'expired' => 'gray',
            'lost' => 'orange',
            'correction' => 'sky',
            'self' => 'emerald',
        ][$this->type] ?? 'gray';
    }

    public function getTypeIconAttribute(): string
    {
        return [
            'in' => '↓',
            'out' => '↑',
            'adjustment' => '↔',
            'return' => '↩',
            'transfer' => '⇄',
            'damaged' => '✕',
            'expired' => '⏳',
            'lost' => '?',
            'correction' => '✓',
            'self' => '↻',
        ][$this->type] ?? '•';
    }

    public function getIsSelfAttribute(): bool
    {
        return $this->source_type === 'self' || $this->destination_type === 'self';
    }

    public function getStatusLabelAttribute(): string
    {
        return [
            'pending' => 'Pending',
            'approved' => 'Approved',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
        ][$this->status] ?? $this->status ?? 'Pending';
    }

    public function getStatusColorAttribute(): string
    {
        return [
            'pending' => 'amber',
            'approved' => 'sky',
            'completed' => 'emerald',
            'cancelled' => 'red',
        ][$this->status] ?? 'gray';
    }
}
