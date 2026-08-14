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
        'branch_id',
        'description',
        'capacity',
        'status',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'status' => 'string',
    ];

    // Relationships
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function medicines()
    {
        return $this->hasMany(Medicine::class);
    }

    public function batches()
    {
        return $this->hasManyThrough(Batch::class, Medicine::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInWarehouse($query)
    {
        return $query->whereNull('branch_id');
    }

    public function scopeInBranch($query, $branchId)
    {
        return $query->where('branch_id', $branchId);
    }

    // Accessors
    public function getUtilizationAttribute()
    {
        $totalItems = $this->medicines()->sum('quantity');
        $capacity = $this->capacity ?? 100;
        return $capacity > 0 ? min(100, round(($totalItems / $capacity) * 100)) : 0;
    }

    public function getCurrentItemsAttribute()
    {
        return $this->medicines()->sum('quantity');
    }

    public function getStatusLabelAttribute()
    {
        $utilization = $this->utilization;
        if ($utilization >= 100) return 'Full';
        if ($utilization >= 80) return 'Nearly Full';
        if ($utilization >= 50) return 'Moderate';
        return 'Available';
    }

    public function getStatusColorAttribute()
    {
        $utilization = $this->utilization;
        if ($utilization >= 100) return 'bg-red-100 text-red-700';
        if ($utilization >= 80) return 'bg-amber-100 text-amber-700';
        if ($utilization >= 50) return 'bg-yellow-100 text-yellow-700';
        return 'bg-green-100 text-green-700';
    }

    // Methods
    public function isFull()
    {
        return $this->utilization >= 100;
    }

    public function hasCapacity()
    {
        return $this->utilization < 100;
    }

    public function remainingCapacity()
    {
        $capacity = $this->capacity ?? 100;
        $current = $this->current_items;
        return max(0, $capacity - $current);
    }
}