<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Medicine extends Model
{
    use HasFactory;

    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_EXPIRED = 'expired';
    const STATUS_DISCONTINUED = 'discontinued';

    protected $fillable = [
        'name',
        'generic_name',
        'category_id',
        'quantity',
        'reorder_level',
        'status',
        'description',
        'dosage_form',
        'strength',
        'unit',
        'batch_number',
        'manufacturer',
        'branch_id',
        'shelf_id',
        'image',
    ];

    protected $with = [];

    protected $casts = [
    ];

    /**
     * Category Relationship (Optional)
     */
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

    public function purchaseOrderItems()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function batches()
    {
        return $this->hasMany(Batch::class, 'medicine_id');
    }

    public function calculatedExpiryDate(): ?Carbon
    {
        $batchExpiry = $this->batches()
            ->when($this->batch_number, fn ($query) => $query->where('batch_number', $this->batch_number))
            ->whereNotNull('expiry_date')
            ->latest('id')
            ->value('expiry_date');

        return $batchExpiry ? Carbon::parse($batchExpiry) : null;
    }

    public function syncAutomaticExpiryState(): void
    {
        $calculatedExpiry = $this->calculatedExpiryDate();
        $changes = [];

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
            if (str_starts_with($this->image, 'http')) {
                return $this->image;
            }

            if (str_starts_with($this->image, 'images/')) {
                return asset($this->image);
            }

            return asset('storage/' . $this->image);
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
