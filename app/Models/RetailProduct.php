<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RetailProduct extends Model
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
        'sku',
        'category',
        'barcode',
        'supplier_id',
        'quantity',
        'price',
        'purchase_price',
        'reorder_level',
        'expiry_date',
        'status',
        'description',
        'manufacturer',
        'shelf_location',
        'image',
    ];

    protected $appends = ['image_url'];

    protected $casts = [
        'expiry_date' => 'date',
        'quantity' => 'integer',
        'reorder_level' => 'integer',
        'price' => 'decimal:2',
        'purchase_price' => 'decimal:2',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function getImageUrlAttribute(): string
    {
        if ($this->image) {
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
