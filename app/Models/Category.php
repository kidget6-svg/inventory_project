<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'shelf_location',
    ];

    /**
     * A category belongs to many medicines.
     */
    public function medicines()
    {
        return $this->hasMany(Medicine::class);
    }

    /**
     * Check whether this category is associated with any medicines.
     */
    public function isAssociatedWithMedicines(): bool
    {
        return $this->medicines()->exists();
    }
}
