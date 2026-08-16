<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Batch extends Model
{
    use HasFactory;

    // Status Constants
    const STATUS_AVAILABLE = 'available';
    const STATUS_QUARANTINED = 'quarantined';
    const STATUS_RECALLED = 'recalled';
    const STATUS_EXPIRED = 'expired';
    const STATUS_DISPOSED = 'disposed';

    protected $fillable = [
        'medicine_id',
        'shelf_id',
        'batch_number',
        'barcode',
        'manufacturing_date',
        'expiry_date',
        'manufacturer',
        'country_of_origin',
        'storage_conditions',
        'quantity',
        'received_by',
        'purchase_order_id',
        'received_at',
        'status',
        'notes',
    ];

    protected $casts = [
        'manufacturing_date' => 'datetime',
        'expiry_date' => 'datetime',
        'received_at' => 'datetime',
        'quantity' => 'integer',
    ];

    // Relationships
    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function receivedBy()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('status', self::STATUS_AVAILABLE)
                     ->where('quantity', '>', 0)
                     ->where('expiry_date', '>', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now());
    }

    public function scopeExpiringSoon($query, $days = 90)
    {
        return $query->where('expiry_date', '>=', now())
                     ->where('expiry_date', '<=', now()->addDays($days));
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('quantity', '<=', 'minimum_stock');
    }

    // Accessors
    public function getStatusBadgeAttribute()
    {
        $badges = [
            self::STATUS_AVAILABLE => 'bg-green-100 text-green-700',
            self::STATUS_QUARANTINED => 'bg-yellow-100 text-yellow-700',
            self::STATUS_RECALLED => 'bg-red-100 text-red-700',
            self::STATUS_EXPIRED => 'bg-gray-100 text-gray-700',
            self::STATUS_DISPOSED => 'bg-gray-100 text-gray-700',
        ];
        return $badges[$this->status] ?? 'bg-gray-100 text-gray-700';
    }

    public function getDaysUntilExpiryAttribute()
    {
        if (!$this->expiry_date) return null;
        return now()->diffInDays($this->expiry_date, false);
    }

    public function getIsExpiredAttribute()
    {
        return $this->expiry_date && $this->expiry_date < now();
    }

    public function getIsExpiringSoonAttribute()
    {
        return $this->expiry_date && $this->expiry_date >= now() && $this->expiry_date <= now()->addDays(90);
    }

    // Methods
    public function isAvailable()
    {
        return $this->status === self::STATUS_AVAILABLE && 
               $this->quantity > 0 && 
               $this->expiry_date > now();
    }

    public function markAsQuarantined($reason)
    {
        $this->status = self::STATUS_QUARANTINED;
        $this->notes = ($this->notes ? $this->notes . "\n" : '') . "Quarantined: " . $reason;
        $this->save();
    }

    public function markAsRecalled($reason)
    {
        $this->status = self::STATUS_RECALLED;
        $this->notes = ($this->notes ? $this->notes . "\n" : '') . "Recalled: " . $reason;
        $this->save();
    }

    public function markAsExpired()
    {
        $this->status = self::STATUS_EXPIRED;
        $this->save();
    }

    public function markAsDisposed($reason)
    {
        $this->status = self::STATUS_DISPOSED;
        $this->notes = ($this->notes ? $this->notes . "\n" : '') . "Disposed: " . $reason;
        $this->quantity = 0;
        $this->save();
    }
}