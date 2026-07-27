<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_no',
        'customer_id',
        'total_amount',
        'sale_date',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
