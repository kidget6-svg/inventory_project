<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Shelf extends Model
{
    use HasFactory;

    protected $fillable = [
        'shelf_code',
        'location',
    ];

    public function medicines()
    {
        return $this->hasMany(Medicine::class);
    }
}
