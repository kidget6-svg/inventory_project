<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    // Action Constants
    const ACTION_CREATE = 'create';
    const ACTION_UPDATE = 'update';
    const ACTION_DELETE = 'delete';
    const ACTION_APPROVE = 'approve';
    const ACTION_REJECT = 'reject';
    const ACTION_STOCK_ADJUST = 'stock_adjust';
    const ACTION_SALE_COMPLETE = 'sale_complete';
    const ACTION_USER_LOGIN = 'user_login';
    const ACTION_USER_LOGOUT = 'user_logout';
    const ACTION_PASSWORD_CHANGE = 'password_change';
    const ACTION_TRANSFER = 'transfer';
    const ACTION_RECEIVE = 'receive';

    protected $fillable = [
        'user_id',
        'action',
        'module',
        'table_name',
        'record_id',
        'before_values',
        'after_values',
        'ip_address',
        'user_agent',
        'reason',
    ];

    protected $casts = [
        'before_values' => 'array',
        'after_values' => 'array',
        'created_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeModule($query, $module)
    {
        return $query->where('module', $module);
    }

    public function scopeAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeBetweenDates($query, $start, $end)
    {
        return $query->whereBetween('created_at', [$start, $end]);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where('table_name', 'like', "%{$search}%")
                     ->orWhere('record_id', 'like', "%{$search}%")
                     ->orWhere('ip_address', 'like', "%{$search}%");
    }

    // Accessors
    public function getActionLabelAttribute()
    {
        $labels = [
            self::ACTION_CREATE => 'Create',
            self::ACTION_UPDATE => 'Update',
            self::ACTION_DELETE => 'Delete',
            self::ACTION_APPROVE => 'Approve',
            self::ACTION_REJECT => 'Reject',
            self::ACTION_STOCK_ADJUST => 'Stock Adjust',
            self::ACTION_SALE_COMPLETE => 'Sale Complete',
            self::ACTION_USER_LOGIN => 'User Login',
            self::ACTION_USER_LOGOUT => 'User Logout',
            self::ACTION_PASSWORD_CHANGE => 'Password Change',
            self::ACTION_TRANSFER => 'Transfer',
            self::ACTION_RECEIVE => 'Receive',
        ];
        return $labels[$this->action] ?? $this->action;
    }

    public function getActionColorAttribute()
    {
        $colors = [
            self::ACTION_CREATE => 'bg-emerald-100 text-emerald-700',
            self::ACTION_UPDATE => 'bg-blue-100 text-blue-700',
            self::ACTION_DELETE => 'bg-red-100 text-red-700',
            self::ACTION_APPROVE => 'bg-green-100 text-green-700',
            self::ACTION_REJECT => 'bg-red-100 text-red-700',
            self::ACTION_STOCK_ADJUST => 'bg-amber-100 text-amber-700',
            self::ACTION_SALE_COMPLETE => 'bg-purple-100 text-purple-700',
            self::ACTION_USER_LOGIN => 'bg-sky-100 text-sky-700',
            self::ACTION_USER_LOGOUT => 'bg-gray-100 text-gray-700',
            self::ACTION_PASSWORD_CHANGE => 'bg-yellow-100 text-yellow-700',
            self::ACTION_TRANSFER => 'bg-indigo-100 text-indigo-700',
            self::ACTION_RECEIVE => 'bg-teal-100 text-teal-700',
        ];
        return $colors[$this->action] ?? 'bg-gray-100 text-gray-700';
    }

    // Methods
    public static function log($data)
    {
        return self::create([
            'user_id' => $data['user_id'] ?? auth()->id(),
            'action' => $data['action'],
            'module' => $data['module'],
            'table_name' => $data['table_name'] ?? null,
            'record_id' => $data['record_id'] ?? null,
            'before_values' => $data['before_values'] ?? null,
            'after_values' => $data['after_values'] ?? null,
            'ip_address' => $data['ip_address'] ?? request()->ip(),
            'user_agent' => $data['user_agent'] ?? request()->userAgent(),
            'reason' => $data['reason'] ?? null,
        ]);
    }
}