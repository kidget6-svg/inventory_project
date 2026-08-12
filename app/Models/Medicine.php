<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Medicine extends Model
{
    use HasFactory;

    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_EXPIRED = 'expired';
    const STATUS_DISCONTINUED = 'discontinued';

    public static function statuses(): array
    {
        return [
            self::STATUS_ACTIVE => 'Active',
            self::STATUS_INACTIVE => 'Inactive',
            self::STATUS_EXPIRED => 'Expired',
            self::STATUS_DISCONTINUED => 'Discontinued',
        ];
    }

    protected $fillable = [
        'name',
        'generic_name',
        'batch_number',
        'barcode',
        'category_id',
        'supplier_id',
        'shelf_id',
        'quantity',
        'unit_price',
        'purchase_price',
        'selling_price',
        'reorder_level',
        'expiry_date',
        'status',
        'image',
        'description',
        'manufacturer',
        'shelf_location',
    ];

    protected $appends = ['image_url'];

    protected $casts = [
        'expiry_date' => 'date',
        'quantity' => 'integer',
        'reorder_level' => 'integer',
        'unit_price' => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
    ];

    public function shelf()
    {
        return $this->belongsTo(Shelf::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function purchaseOrderItems()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function batches()
    {
        return $this->hasMany(Batch::class);
    }

    public function calculatedExpiryDate(): ?Carbon
    {
        $batchExpiry = $this->batches()
            ->when($this->batch_number, fn ($query) => $query->where('batch_number', $this->batch_number))
            ->whereNotNull('expiry_date')
            ->latest('id')
            ->value('expiry_date');

        return $batchExpiry ? Carbon::parse($batchExpiry) : ($this->expiry_date ? Carbon::parse($this->expiry_date) : null);
    }

    public function syncAutomaticExpiryState(): void
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
            return asset($this->image);
        }

        return asset('images/medicine-placeholder.svg');
    }

    public function getStatusBadgeClass(): string
    {
        return match ($this->status) {
            self::STATUS_ACTIVE => 'bg-green-100 text-green-700',
            self::STATUS_INACTIVE => 'bg-gray-100 text-gray-700',
            self::STATUS_EXPIRED => 'bg-red-100 text-red-700',
            self::STATUS_DISCONTINUED => 'bg-orange-100 text-orange-700',
            default => 'bg-gray-100 text-gray-600',
        };
    }
}
