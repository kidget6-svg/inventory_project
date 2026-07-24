<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'sale_date',
        'total_amount',
    ];


    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }
}