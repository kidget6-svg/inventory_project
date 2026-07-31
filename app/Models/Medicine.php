<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Medicine extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'generic_name',
        'batch_number',
        'barcode',
        'category_id',
        'supplier_id',
        'description',
        'shelf_location',
        'manufacturer',
        'image',
        'quantity',
        'unit_price',
        'purchase_price',
        'selling_price',
        'reorder_level',
        'expiry_date',
        'status',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'reorder_level' => 'integer',
        'expiry_date' => 'date',
    ];

    // Relationships
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    // Accessors
    public function getImageUrlAttribute(): string
    {
        if ($this->image) {
            return asset('storage/' . $this->image);
        }
        return asset('images/medicine-placeholder.svg');
    }

    public function getIsLowStockAttribute(): bool
    {
        return $this->quantity <= $this->reorder_level;
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    public function getIsExpiringSoonAttribute(): bool
    {
        return $this->expiry_date && $this->expiry_date->diffInDays(now()) <= 90 && !$this->is_expired;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('quantity', '<=', 'reorder_level');
    }

    public function scopeExpiringWithin($query, $days = 90)
    {
        return $query->whereDate('expiry_date', '<=', now()->addDays($days))
                     ->whereDate('expiry_date', '>=', now());
    }

    public function scopeExpired($query)
    {
        return $query->whereDate('expiry_date', '<', now());
    }
}