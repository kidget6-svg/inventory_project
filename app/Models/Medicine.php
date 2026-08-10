<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    use HasFactory;

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
        'shelf_location',
        'batch_number',
        'barcode',
    ];

    // Explicitly clear $with so Eloquent doesn't query missing relationships like 'shelf'
    protected $with = [];

    /**
     * Category Relationship (Optional)
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}