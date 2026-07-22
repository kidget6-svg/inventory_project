<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    protected $fillable = [
        'name',
        'generic_name',
        'batch_number',
        'category_id',
        'quantity',
        'unit_price',
        'reorder_level',
        'expiry_date',
    ];

    protected $casts = [
        'expiry_date' => 'date',
    ];


    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}