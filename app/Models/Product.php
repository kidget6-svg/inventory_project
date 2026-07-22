<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'generic_name',
        'brand_name',
        'barcode',
        'category',
        'is_controlled',
        'is_refrigerated',
        'aisle',
        'shelf',
        'bin',
        'reorder_level'
    ];

    protected $casts = [
        'is_controlled' => 'boolean',
        'is_refrigerated' => 'boolean',
    ];

    // Relationships
    public function batches()
    {
        return $this->hasMany(Batch::class);
    }

    public function stockLedgers()
    {
        return $this->hasMany(StockLedger::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function purchaseOrderItems()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function stockAdjustments()
    {
        return $this->hasMany(StockAdjustment::class);
    }

    // Get total stock for this product
    public function getTotalStockAttribute()
    {
        return $this->batches()->sum('quantity');
    }

    // Check if product is low stock
    public function getIsLowStockAttribute()
    {
        return $this->total_stock <= $this->reorder_level;
    }

    // Get active batches (with quantity > 0)
    public function activeBatches()
    {
        return $this->batches()->where('quantity', '>', 0);
    }

    // Get expired batches
    public function expiredBatches()
    {
        return $this->batches()
            ->where('expiry_date', '<=', now())
            ->where('quantity', '>', 0);
    }

    // Get batches expiring soon
    public function expiringSoonBatches($days = 90)
    {
        return $this->batches()
            ->where('quantity', '>', 0)
            ->whereDate('expiry_date', '>', now())
            ->whereDate('expiry_date', '<=', now()->addDays($days));
    }
}