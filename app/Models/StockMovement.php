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
    ];

    protected $casts = [
        'quantity' => 'integer',
        'before_quantity' => 'integer',
        'after_quantity' => 'integer',
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

    // Accessors
    public function getTypeLabelAttribute(): string
    {
        return [
            'in' => 'Stock In',
            'out' => 'Stock Out',
            'adjustment' => 'Adjustment',
            'return' => 'Return',
            'damaged' => 'Damaged',
        ][$this->type] ?? $this->type;
    }

    public function getTypeColorAttribute(): string
    {
        return [
            'in' => 'green',
            'out' => 'red',
            'adjustment' => 'orange',
            'return' => 'blue',
            'damaged' => 'red',
        ][$this->type] ?? 'gray';
    }

    public function getTypeIconAttribute(): string
    {
        return [
            'in' => '↓',
            'out' => '↑',
            'adjustment' => '↔',
            'return' => '↩',
            'damaged' => '✕',
        ][$this->type] ?? '•';
    }
}