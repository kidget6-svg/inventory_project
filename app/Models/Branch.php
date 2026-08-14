<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'phone',
        'email',
        'manager_name',
        'status',
        'opening_hours',
    ];

    protected $casts = [
        'opening_hours' => 'array',
        'status' => 'string',
    ];

    // Relationships
    public function medicines()
    {
        return $this->hasMany(Medicine::class);
    }

    public function shelves()
    {
        return $this->hasMany(Shelf::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    public function transfers()
    {
        return $this->hasMany(StockTransfer::class, 'to_branch_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', "%{$search}%")
                     ->orWhere('location', 'like', "%{$search}%")
                     ->orWhere('manager_name', 'like', "%{$search}%");
    }

    // Accessors
    public function getStatusBadgeAttribute()
    {
        return $this->status === 'active'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700';
    }

    public function getStockCountAttribute()
    {
        return $this->medicines()->sum('quantity');
    }

    public function getMedicineCountAttribute()
    {
        return $this->medicines()->count();
    }

    public function getSalesCountAttribute()
    {
        return $this->sales()->count();
    }

    // Methods
    public function getInventoryValue()
    {
        return $this->medicines()->sum(\DB::raw('quantity * unit_price'));
    }

    public function getLowStockItems()
    {
        return $this->medicines()->whereColumn('quantity', '<=', 'reorder_level')->get();
    }

    public function getOutOfStockItems()
    {
        return $this->medicines()->where('quantity', 0)->get();
    }
}