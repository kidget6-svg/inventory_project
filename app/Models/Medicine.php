<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    use HasFactory;

    /*
    |--------------------------------------------------------------------------
    | Status Constants
    |--------------------------------------------------------------------------
    */

    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_EXPIRED = 'expired';
    const STATUS_DISCONTINUED = 'discontinued';


    /*
    |--------------------------------------------------------------------------
    | Mass Assignment
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'name',
        'generic_name',
        'category_id',
        'supplier_id',
        'quantity',
        'unit_price',
        'purchase_price',
        'selling_price',
        'reorder_level',
        'expiry_date',
        'status',
        'description',
        'manufacturer',
        'dosage_form',
        'strength',
        'unit',
        'batch_number',
        'barcode',
        'branch_id',
        'shelf_id',
        'shelf_location',
        'image',
    ];


    /*
    |--------------------------------------------------------------------------
    | Appended Attributes
    |--------------------------------------------------------------------------
    */

    protected $appends = [
        'image_url',
    ];


    /*
    |--------------------------------------------------------------------------
    | Eager Loading
    |--------------------------------------------------------------------------
    */

    protected $with = [];


    /*
    |--------------------------------------------------------------------------
    | Casts
    |--------------------------------------------------------------------------
    */

    protected $casts = [
        'quantity' => 'integer',
        'reorder_level' => 'integer',
        'branch_id' => 'integer',
        'category_id' => 'integer',
        'shelf_id' => 'integer',
        'supplier_id' => 'integer',
        'expiry_date' => 'date',
    ];


    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Medicine belongs to a category.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }


    /**
     * Medicine belongs to a supplier.
     */
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }


    /**
     * Medicine belongs to a shelf.
     */
    public function shelf()
    {
        return $this->belongsTo(Shelf::class);
    }


    /**
     * Medicine belongs to a branch.
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }


    /**
     * Medicine has many purchase order items.
     */
    public function purchaseOrderItems()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }


    /**
     * Medicine has many batches.
     */
    public function batches()
    {
        return $this->hasMany(Batch::class, 'medicine_id');
    }


    /*
    |--------------------------------------------------------------------------
    | Expiry Management
    |--------------------------------------------------------------------------
    */

    /**
     * Calculate expiry date from the medicine's latest matching batch.
     */
    public function calculatedExpiryDate(): ?Carbon
    {
        $batchExpiry = $this->batches()
            ->when(
                $this->batch_number,
                fn ($query) => $query->where(
                    'batch_number',
                    $this->batch_number
                )
            )
            ->whereNotNull('expiry_date')
            ->latest('id')
            ->value('expiry_date');

        return $batchExpiry
            ? Carbon::parse($batchExpiry)
            : ($this->expiry_date ? Carbon::parse($this->expiry_date) : null);
    }


    /**
     * Automatically mark medicine as expired when necessary.
     */
    public function syncAutomaticExpiryState(): void
    {
        $calculatedExpiry = $this->calculatedExpiryDate();

        $changes = [];

        if (
            $calculatedExpiry &&
            (! $this->expiry_date || ! $this->expiry_date->isSameDay($calculatedExpiry))
        ) {
            $changes['expiry_date'] = $calculatedExpiry->toDateString();
        }

        if (
            $calculatedExpiry &&
            $calculatedExpiry->isBefore(Carbon::today()) &&
            $this->status !== self::STATUS_DISCONTINUED
        ) {
            $changes['status'] = self::STATUS_EXPIRED;
        }

        if (!empty($changes)) {
            $this->forceFill($changes)->saveQuietly();
            $this->refresh();
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Image URL
    |--------------------------------------------------------------------------
    */

    /**
     * Get the full public URL to the medicine image.
     *
     * Supports:
     * - External URLs
     * - images/... paths
     * - storage/... paths
     *
     * Falls back to a placeholder.
     */
    public function getImageUrlAttribute(): string
    {
        if (!$this->image) {
            return asset('images/medicine-placeholder.svg');
        }

        if (str_starts_with($this->image, 'http://')) {
            return $this->image;
        }

        if (str_starts_with($this->image, 'https://')) {
            return $this->image;
        }

        if (str_starts_with($this->image, 'images/')) {
            return asset($this->image);
        }

        if (str_starts_with($this->image, 'storage/')) {
            return asset($this->image);
        }

        return asset('storage/' . ltrim($this->image, '/'));
    }


    /*
    |--------------------------------------------------------------------------
    | Status Badge
    |--------------------------------------------------------------------------
    */

    public function getStatusBadgeClass(): string
    {
        return match ($this->status) {

            self::STATUS_ACTIVE =>
                'bg-green-100 text-green-700',

            self::STATUS_INACTIVE =>
                'bg-gray-100 text-gray-700',

            self::STATUS_EXPIRED =>
                'bg-red-100 text-red-700',

            self::STATUS_DISCONTINUED =>
                'bg-orange-100 text-orange-700',

            default =>
                'bg-gray-100 text-gray-600',
        };
    }
}
