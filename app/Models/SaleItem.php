<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SaleItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'medicine_id',
        'quantity',
        'unit_price',
        'subtotal',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}
