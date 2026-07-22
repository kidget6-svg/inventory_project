<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Batch extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'supplier_id',
        'batch_number',
        'quantity',
        'expiry_date',
        'received_date',
        'unit_cost'
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'received_date' => 'date',
        'quantity' => 'integer',
        'unit_cost' => 'decimal:2'
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function stockLedgers()
    {
        return $this->hasMany(StockLedger::class);
    }

    public function stockAdjustments()
    {
        return $this->hasMany(StockAdjustment::class);
    }

    // Check if batch is expired
    public function getIsExpiredAttribute()
    {
        return $this->expiry_date <= now();
    }

    // Check if batch is expiring soon
    public function getIsExpiringSoonAttribute($days = 90)
    {
        return !$this->is_expired && $this->expiry_date <= now()->addDays($days);
    }

    // Get days until expiry
    public function getDaysUntilExpiryAttribute()
    {
        if ($this->is_expired) {
            return 0;
        }
        return now()->diffInDays($this->expiry_date);
    }

    // Scope for active batches
    public function scopeActive($query)
    {
        return $query->where('quantity', '>', 0);
    }

    // Scope for expired batches
    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<=', now())->where('quantity', '>', 0);
    }
}