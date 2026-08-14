<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Medicine extends Model
{
    use HasFactory;

    // Status Constants
    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_EXPIRED = 'expired';
    const STATUS_DISCONTINUED = 'discontinued';
    const STATUS_DAMAGED = 'damaged';
    const STATUS_QUARANTINED = 'quarantined';

    // Stock Status Constants
    const STOCK_IN_STOCK = 'in_stock';
    const STOCK_LOW_STOCK = 'low_stock';
    const STOCK_OUT_OF_STOCK = 'out_of_stock';
    const STOCK_EXPIRED = 'expired';

    protected $fillable = [
        'name',
        'generic_name',
        'dosage_form',
        'strength',
        'unit',
        'category_id',
        'supplier_id',
        'shelf_id',
        'branch_id',
        'shelf_location',
        'prescription',
        'manufacturer',
        'batch_number',
        'barcode',
        'serial_number',
        'image',
        'quantity',
        'minimum_stock',
        'maximum_stock',
        'unit_price',
        'purchase_price',
        'selling_price',
        'reorder_level',
        'expiry_date',
        'manufactured_date',
        'received_date',
        'status',
        'stock_status',
        'approval_status',
        'description',
        'manufacturer',
        'shelf_location',
    ];

    protected $casts = [
        'expiry_date' => 'datetime',
        'manufactured_date' => 'datetime',
        'received_date' => 'datetime',
        'quantity' => 'integer',
        'minimum_stock' => 'integer',
        'maximum_stock' => 'integer',
        'unit_price' => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'reorder_level' => 'integer',
    ];

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function shelf()
    {
        return $this->belongsTo(Shelf::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function batches()
    {
        return $this->hasMany(Batch::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function saleItems()
    {
        return $this->morphMany(SaleItem::class, 'itemable');
    }

    public function purchaseOrderItems()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInStock($query)
    {
        return $query->where('quantity', '>', 0);
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('quantity', '<=', 'reorder_level')
                     ->where('quantity', '>', 0);
    }

    public function scopeOutOfStock($query)
    {
        return $query->where('quantity', 0);
    }

    public function scopeExpired($query)
    {
        $calculatedExpiry = $this->calculatedExpiryDate();
        $changes = [];

        if ($calculatedExpiry && (! $this->expiry_date || ! $this->expiry_date->isSameDay($calculatedExpiry))) {
            $changes['expiry_date'] = $calculatedExpiry->toDateString();
        }

        if ($calculatedExpiry && $calculatedExpiry->isBefore(Carbon::today())) {
            $changes['status'] = self::STATUS_EXPIRED;
        }

        if ($changes) {
            $this->forceFill($changes)->saveQuietly();
            $this->refresh();
        }
    }

    /**
     * Get the full public URL to the medicine image.
     * Falls back to a placeholder when no image is set.
     */
    public function getImageUrlAttribute(): string
    {
        if ($this->image) {
            return asset('storage/' . $this->image);
        }
        return asset('images/medicine-placeholder.svg');
    }

    public function getFullNameAttribute()
    {
        $parts = [$this->name];
        if ($this->strength) $parts[] = $this->strength;
        if ($this->dosage_form) $parts[] = $this->dosage_form;
        return implode(' ', $parts);
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            self::STATUS_ACTIVE => 'bg-green-100 text-green-700',
            self::STATUS_INACTIVE => 'bg-gray-100 text-gray-700',
            self::STATUS_EXPIRED => 'bg-red-100 text-red-700',
            self::STATUS_DISCONTINUED => 'bg-orange-100 text-orange-700',
            self::STATUS_DAMAGED => 'bg-red-100 text-red-700',
            self::STATUS_QUARANTINED => 'bg-yellow-100 text-yellow-700',
        ];
        return $badges[$this->status] ?? 'bg-gray-100 text-gray-700';
    }

    public function getStockStatusBadgeAttribute()
    {
        $badges = [
            self::STOCK_IN_STOCK => 'bg-green-100 text-green-700',
            self::STOCK_LOW_STOCK => 'bg-yellow-100 text-yellow-700',
            self::STOCK_OUT_OF_STOCK => 'bg-red-100 text-red-700',
            self::STOCK_EXPIRED => 'bg-gray-100 text-gray-700',
        ];
        return $badges[$this->stock_status] ?? 'bg-gray-100 text-gray-700';
    }

    // Methods
    public function updateStockStatus()
    {
        if ($this->expiry_date && $this->expiry_date < now()) {
            $this->stock_status = self::STOCK_EXPIRED;
        } elseif ($this->quantity <= 0) {
            $this->stock_status = self::STOCK_OUT_OF_STOCK;
        } elseif ($this->quantity <= $this->reorder_level) {
            $this->stock_status = self::STOCK_LOW_STOCK;
        } else {
            $this->stock_status = self::STOCK_IN_STOCK;
        }
        $this->save();
    }

    public function addStock($quantity, $notes = null, $reference = null)
    {
        $oldQuantity = $this->quantity;
        $this->quantity += $quantity;
        $this->save();
        $this->updateStockStatus();

        return StockMovement::create([
            'medicine_id' => $this->id,
            'type' => 'in',
            'quantity' => $quantity,
            'before_quantity' => $oldQuantity,
            'after_quantity' => $this->quantity,
            'user_id' => auth()->id(),
            'notes' => $notes,
            'reference' => $reference,
            'status' => 'completed',
        ]);
    }

    public function removeStock($quantity, $notes = null, $reference = null)
    {
        if ($this->quantity < $quantity) {
            throw new \Exception('Insufficient stock');
        }

        $oldQuantity = $this->quantity;
        $this->quantity -= $quantity;
        $this->save();
        $this->updateStockStatus();

        return StockMovement::create([
            'medicine_id' => $this->id,
            'type' => 'out',
            'quantity' => $quantity,
            'before_quantity' => $oldQuantity,
            'after_quantity' => $this->quantity,
            'user_id' => auth()->id(),
            'notes' => $notes,
            'reference' => $reference,
            'status' => 'completed',
        ]);
    }
}