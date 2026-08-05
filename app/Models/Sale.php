<?php
// app/Models/Sale.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    use HasFactory;

    // Payment method constants
    public const PAYMENT_CASH = 'cash';
    public const PAYMENT_TELEBIRR = 'telebirr';
    public const PAYMENT_CBE = 'cbe';
    public const PAYMENT_BOA = 'boa';
    public const PAYMENT_AWASH = 'awash';
    public const PAYMENT_DASHEN = 'dashen';
    public const PAYMENT_COOP = 'coop';
    public const PAYMENT_WEGADEN = 'wegagen';
    public const PAYMENT_CARD = 'card';
    public const PAYMENT_OTHER = 'other';

    /**
     * All available payment methods.
     */
    public static function paymentMethods(): array
    {
        return [
            self::PAYMENT_CASH => 'Cash',
            self::PAYMENT_TELEBIRR => 'Telebirr',
            self::PAYMENT_CBE => 'Commercial Bank of Ethiopia (CBE)',
            self::PAYMENT_BOA => 'Bank of Abyssinia (BOA)',
            self::PAYMENT_AWASH => 'Awash Bank',
            self::PAYMENT_DASHEN => 'Dashen Bank',
            self::PAYMENT_COOP => 'Cooperative Bank of Oromia (Coop)',
            self::PAYMENT_WEGADEN => 'Wegagen Bank',
            self::PAYMENT_CARD => 'Credit/Debit Card',
            self::PAYMENT_OTHER => 'Other',
        ];
    }

    /**
     * Payment methods that are bank transfers (for dashboard grouping).
     */
    public static function bankPaymentMethods(): array
    {
        return [
            self::PAYMENT_CBE,
            self::PAYMENT_BOA,
            self::PAYMENT_AWASH,
            self::PAYMENT_DASHEN,
            self::PAYMENT_COOP,
            self::PAYMENT_WEGADEN,
            self::PAYMENT_CARD,
        ];
    }

    protected $fillable = [
        'sale_date',
        'total_amount',
        'discount',
        'tax',
        'net_amount',
        'customer_name',
        'customer_phone',
        'customer_email',
        'payment_method',
        'payment_status',
        'amount_paid',
        'change_amount',
        'notes',
        'receipt_number',
        'user_id',
        'type',
        'status',
    ];

    protected $casts = [
        'sale_date' => 'datetime',
        'total_amount' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'change_amount' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function getStatusColorAttribute(): string
    {
        return [
            'pending' => 'yellow',
            'pending_cashier' => 'yellow',
            'completed' => 'green',
            'cancelled' => 'red',
        ][$this->status] ?? 'gray';
    }

    public function getStatusLabelAttribute(): string
    {
        return [
            'pending' => 'Pending',
            'pending_cashier' => 'Pending Cashier',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
        ][$this->status] ?? $this->status;
    }

    public function getPaymentMethodLabelAttribute(): string
    {
        return self::paymentMethods()[$this->payment_method] ?? $this->payment_method;
    }

    /**
     * Get the cashier (user) name for this sale.
     */
    public function getCashierNameAttribute(): string
    {
        if ($this->user) {
            return $this->user->first_name
                ? $this->user->first_name . ' ' . ($this->user->last_name ?? '')
                : ($this->user->name ?? 'Unknown');
        }
        return 'Unknown';
    }

    /**
     * Generate a unique receipt number.
     * Format: RCPT-YYYYMMDD-XXXXX
     */
    public static function generateReceiptNumber(): string
    {
        $date = now()->format('Ymd');
        $prefix = 'RCPT-' . $date . '-';

        // Find the highest existing receipt number for today and increment
        $lastReceipt = self::where('receipt_number', 'like', $prefix . '%')
            ->orderBy('receipt_number', 'desc')
            ->value('receipt_number');

        if ($lastReceipt) {
            $lastNumber = (int) substr($lastReceipt, strlen($prefix));
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return $prefix . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
    }
}
