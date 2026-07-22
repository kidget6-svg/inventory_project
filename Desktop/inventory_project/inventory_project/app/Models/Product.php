<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name_generic', 'name_brand', 'strength', 'dosage_form',
        'manufacturer', 'barcode', 'unit_of_measure',
        'storage_conditions', 'category', 'minimum_stock_level',
        'price', 'is_active'
    ];

    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }

    public function stockLedgers(): HasMany
    {
        return $this->hasMany(StockLedger::class);
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function getTotalStockAttribute(): int
    {
        return $this->batches()->sum('quantity_remaining');
    }

    public function isLowStock(): bool
    {
        return $this->total_stock <= $this->minimum_stock_level;
    }
}
