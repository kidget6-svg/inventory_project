<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PurchaseOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'medicine_id',
        'itemable_type',
        'itemable_id',
        'quantity',
        'unit_price',
        'subtotal',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    /**
     * Polymorphic relationship to the ordered item (Medicine or RetailProduct).
     */
    public function itemable()
    {
        return $this->morphTo();
    }

    public function retailProduct()
    {
        return $this->belongsTo(RetailProduct::class, 'itemable_id')
            ->where('itemable_type', RetailProduct::class);
    }
}
