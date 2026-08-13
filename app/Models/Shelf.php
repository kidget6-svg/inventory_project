<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Shelf extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'shelf_location',
        'description',
        'capacity',
    ];

    protected $casts = [
        'capacity' => 'integer',
    ];

    public function medicines()
    {
        return $this->hasMany(Medicine::class);
    }

    // Get utilization percentage
    public function getUtilizationAttribute()
    {
        $totalItems = $this->medicines()->count();
        $capacity = $this->capacity ?? 100;
        return $capacity > 0 ? min(100, round(($totalItems / $capacity) * 100)) : 0;
    }

    // Get status based on utilization
    public function getStatusAttribute()
    {
        $utilization = $this->utilization;
        if ($utilization >= 100) return 'full';
        if ($utilization >= 80) return 'nearly_full';
        return 'available';
    }

    // Get status label
    public function getStatusLabelAttribute()
    {
        return ucfirst(str_replace('_', ' ', $this->status));
    }
}