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
        'icon',
        'color',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    // Relationships
    public function medicines()
    {
        return $this->hasMany(Medicine::class);
    }

    public function shelf()
    {
        return $this->belongsTo(Shelf::class, 'shelf_location', 'shelf_location');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', "%{$search}%")
                     ->orWhere('description', 'like', "%{$search}%");
    }

    // Accessors
    public function getMedicinesCountAttribute()
    {
        return $this->medicines()->count();
    }

    public function getTotalStockAttribute()
    {
        return $this->medicines()->sum('quantity');
    }
}