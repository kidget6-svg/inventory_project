<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
        'tax_id',
        'payment_terms',
        'lead_time_days',
        'preferred_communication',
        'status',
        'notes',
    ];

    protected $casts = [
        'lead_time_days' => 'integer',
        'status' => 'string',
    ];

    // Relationships
    public function medicines()
    {
        return $this->hasMany(Medicine::class);
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', "%{$search}%")
                     ->orWhere('contact_person', 'like', "%{$search}%")
                     ->orWhere('email', 'like', "%{$search}%");
    }

    // Accessors
    public function getStatusBadgeAttribute()
    {
        return $this->status === 'active' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700';
    }

    // Methods
    public function getPerformanceMetrics()
    {
        $orders = $this->purchaseOrders()->where('status', 'completed')->get();
        $totalOrders = $orders->count();
        $onTimeDeliveries = $orders->filter(function ($order) {
            return $order->actual_delivery && $order->actual_delivery <= $order->expected_delivery;
        })->count();

        return [
            'total_orders' => $totalOrders,
            'on_time_rate' => $totalOrders > 0 ? round(($onTimeDeliveries / $totalOrders) * 100, 2) : 0,
            'total_spent' => $orders->sum('total_amount'),
            'average_lead_time' => $totalOrders > 0 ? round($orders->avg('lead_time_days'), 1) : 0,
        ];
    }
}