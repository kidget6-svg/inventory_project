<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Validation\ValidationException;

class Shelf extends Model
{
    use HasFactory;

    public const LOCATION_WAREHOUSE = 'warehouse';
    public const LOCATION_BRANCH = 'branch';

    public const PRODUCT_MEDICINE = 'medicine';
    public const PRODUCT_RETAIL_OTC = 'retail_otc';

    protected $fillable = [
        'name',
        'code',
        'shelf_location',
        'location_type',
        'product_type',
        'branch_id',
        'warehouse_id',
        'description',
        'capacity',
        'current_quantity',
        'status',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'current_quantity' => 'integer',
        'warehouse_id' => 'integer',
        'status' => 'string',
        'location_type' => 'string',
        'product_type' => 'string',
    ];

    protected $appends = [
        'utilization',
        'current_items',
        'occupancy_status',
        'occupancy_status_label',
        'occupancy_color',
        'location_label',
        'product_type_label',
        'remaining_capacity',
    ];

    // Relationships
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function medicines()
    {
        return $this->hasMany(Medicine::class);
    }

    public function retailProducts()
    {
        return $this->hasMany(RetailProduct::class);
    }

    public function batches()
    {
        return $this->hasManyThrough(Batch::class, Medicine::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInWarehouse($query)
    {
        return $query->where('location_type', self::LOCATION_WAREHOUSE);
    }

    public function scopeInBranch($query, $branchId)
    {
        return $query->where('location_type', self::LOCATION_BRANCH)
            ->where('branch_id', $branchId);
    }

    public function scopeForProductType($query, $productType)
    {
        return $query->where('product_type', $productType);
    }

    public function scopeForLocationType($query, $locationType)
    {
        return $query->where('location_type', $locationType);
    }

    // Accessors
    public function getUtilizationAttribute()
    {
        $capacity = $this->capacity ?: 100;
        $current = $this->current_quantity ?: 0;
        return $capacity > 0 ? min(100, round(($current / $capacity) * 100)) : 0;
    }

    public function getCurrentItemsAttribute()
    {
        return $this->current_quantity ?: 0;
    }

    public function getRemainingCapacityAttribute()
    {
        $capacity = $this->capacity ?: 100;
        return max(0, $capacity - ($this->current_quantity ?: 0));
    }

    public function getOccupancyStatusAttribute()
    {
        $util = $this->utilization;
        if ($util >= 100) return 'full';
        if ($util >= 90) return 'almost_full';
        if ($util >= 70) return 'filling';
        if ($util >= 1) return 'available';
        return 'empty';
    }

    public function getOccupancyStatusLabelAttribute()
    {
        return match ($this->occupancy_status) {
            'full' => 'Full',
            'almost_full' => 'Almost Full',
            'filling' => 'Filling',
            'available' => 'Available',
            default => 'Empty',
        };
    }

    public function getOccupancyColorAttribute()
    {
        return match ($this->occupancy_status) {
            'full' => 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            'almost_full' => 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            'filling' => 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            'available' => 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            default => 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
        };
    }

    public function getLocationLabelAttribute()
    {
        if ($this->location_type === self::LOCATION_WAREHOUSE) {
            return 'Central Warehouse';
        }
        return $this->branch?->name ?? 'Unknown Branch';
    }

    public function getProductTypeLabelAttribute()
    {
        return match ($this->product_type) {
            self::PRODUCT_MEDICINE => 'Medicine',
            self::PRODUCT_RETAIL_OTC => 'Retail & OTC',
            default => 'Unknown',
        };
    }

    // Capacity methods (backend enforcement)
    public function isFull(): bool
    {
        return ($this->current_quantity ?: 0) >= ($this->capacity ?: 100);
    }

    public function hasCapacity(int $requested = 1): bool
    {
        return $this->remaining_capacity >= $requested;
    }

    /**
     * Increase shelf usage. Throws ValidationException (HTTP 422) when capacity is exceeded.
     */
    public function addStock(int $quantity): void
    {
        $quantity = (int) $quantity;
        if ($quantity <= 0) {
            return;
        }

        $remaining = $this->remaining_capacity;
        $capacity = $this->capacity ?: 100;

        if ($remaining <= 0) {
            throw ValidationException::withMessages([
                'capacity' => 'Shelf is full. No additional items can be added.',
            ]);
        }

        if ($quantity > $remaining) {
            throw ValidationException::withMessages([
                'capacity' => "Cannot add {$quantity} items. This shelf has only {$remaining} available spaces.",
                'available_capacity' => $remaining,
                'requested_quantity' => $quantity,
            ]);
        }

        $this->current_quantity = ($this->current_quantity ?: 0) + $quantity;
        $this->save();
    }

    /**
     * Decrease shelf usage (frees capacity). Never drops below zero.
     */
    public function removeStock(int $quantity): void
    {
        $quantity = (int) $quantity;
        if ($quantity <= 0) {
            return;
        }
        $this->current_quantity = max(0, ($this->current_quantity ?: 0) - $quantity);
        $this->save();
    }

    /**
     * Set the shelf quantity to an absolute value (used when editing a stock record).
     * Differentiates between old and new so we never compute old + new.
     */
    public function setAbsoluteStock(int $newQuantity): void
    {
        $newQuantity = max(0, (int) $newQuantity);
        $capacity = $this->capacity ?: 100;

        if ($newQuantity > $capacity) {
            throw ValidationException::withMessages([
                'capacity' => "Cannot set shelf quantity to {$newQuantity}. Capacity is {$capacity}.",
                'available_capacity' => $capacity,
                'requested_quantity' => $newQuantity,
            ]);
        }

        $this->current_quantity = $newQuantity;
        $this->save();
    }
}
