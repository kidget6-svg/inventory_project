<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    use HasFactory;

    /*
    |--------------------------------------------------------------------------
    | Status Constants
    |--------------------------------------------------------------------------
    */

    const STATUS_PENDING_CASHIER = 'pending_cashier';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';


    /*
    |--------------------------------------------------------------------------
    | Sale Type Constants
    |--------------------------------------------------------------------------
    */

    const TYPE_PRESCRIPTION = 'prescription';
    const TYPE_OTC = 'otc';


    /*
    |--------------------------------------------------------------------------
    | Payment Method Constants
    |--------------------------------------------------------------------------
    */

    const PAYMENT_CASH = 'cash';
    const PAYMENT_TELEBIRR = 'telebirr';
    const PAYMENT_CBE = 'cbe';
    const PAYMENT_BOA = 'boa';
    const PAYMENT_AWASH = 'awash';
    const PAYMENT_DASHEN = 'dashen';
    const PAYMENT_COOP = 'coop';
    const PAYMENT_WEGAGEN = 'wegagen';
    const PAYMENT_CARD = 'card';
    const PAYMENT_OTHER = 'other';

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
            self::PAYMENT_WEGAGEN => 'Wegagen Bank',
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
            self::PAYMENT_WEGAGEN,
            self::PAYMENT_CARD,
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | Mass Assignment
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'user_id',
        'customer_id',
        'branch_id',
        'sale_date',
        'type',
        'status',
        'total_amount',
        'net_amount',
        'discount_type',
        'discount',
        'tax',
        'payment_method',
        'payment_status',
        'amount_paid',
        'change_amount',
        'notes',
        'receipt_number',
        'customer_name',
        'customer_phone',
        'customer_email',
        'customer_tin',
        'created_by_pharmacist_at',
        'completed_by_cashier_at',
    ];


    /*
    |--------------------------------------------------------------------------
    | Casts
    |--------------------------------------------------------------------------
    */

    protected $casts = [
        'sale_date' => 'datetime',
        'total_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'created_by_pharmacist_at' => 'datetime',
        'completed_by_cashier_at' => 'datetime',
    ];

    protected $appends = ['cashier_name'];


    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * User associated with the sale.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }


    /**
     * Branch associated with the sale.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }


    /**
     * Sale items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }


    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Only completed sales.
     */
    public function scopeCompleted($query)
    {
        return $query->where(
            'status',
            self::STATUS_COMPLETED
        );
    }


    /**
     * Only pending cashier sales.
     */
    public function scopePending($query)
    {
        return $query->where(
            'status',
            self::STATUS_PENDING_CASHIER
        );
    }


    /**
     * Today's sales.
     */
    public function scopeToday($query)
    {
        return $query->whereDate(
            'sale_date',
            today()
        );
    }


    /**
     * Sales between two dates.
     */
    public function scopeBetweenDates(
        $query,
        $start,
        $end
    ) {
        return $query->whereBetween(
            'sale_date',
            [$start, $end]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    /**
     * Human-readable status.
     */
    public function getStatusLabelAttribute()
    {
        $labels = [

            self::STATUS_PENDING_CASHIER =>
                'Pending Cashier',

            self::STATUS_COMPLETED =>
                'Completed',

            self::STATUS_CANCELLED =>
                'Cancelled',
        ];

        return $labels[$this->status]
            ?? $this->status;
    }


    /**
     * Tailwind status badge classes.
     */
    public function getStatusBadgeAttribute()
    {
        $colors = [

            self::STATUS_PENDING_CASHIER =>
                'bg-yellow-100 text-yellow-700',

            self::STATUS_COMPLETED =>
                'bg-green-100 text-green-700',

            self::STATUS_CANCELLED =>
                'bg-red-100 text-red-700',
        ];

        return $colors[$this->status]
            ?? 'bg-gray-100 text-gray-700';
    }


    /**
     * Human-readable sale type.
     */
    public function getTypeLabelAttribute()
    {
        $labels = [

            self::TYPE_PRESCRIPTION =>
                'Prescription',

            self::TYPE_OTC =>
                'OTC / Retail',
        ];

        return $labels[$this->type]
            ?? $this->type;
    }


    /**
     * Human-readable payment method.
     */
    public function getPaymentMethodLabelAttribute()
    {
        $labels = [

            self::PAYMENT_CASH =>
                'Cash',

            self::PAYMENT_TELEBIRR =>
                'Telebirr',

            self::PAYMENT_CBE =>
                'Commercial Bank of Ethiopia',

            self::PAYMENT_BOA =>
                'Bank of Abyssinia',

            self::PAYMENT_AWASH =>
                'Awash Bank',

            self::PAYMENT_DASHEN =>
                'Dashen Bank',

            self::PAYMENT_COOP =>
                'Cooperative Bank of Oromia',

            self::PAYMENT_WEGAGEN =>
                'Wegagen Bank',

            self::PAYMENT_CARD =>
                'Credit/Debit Card',

            self::PAYMENT_OTHER =>
                'Other',
        ];

        return $labels[$this->payment_method]
            ?? $this->payment_method;
    }


    /**
     * Get cashier/user name.
     */
    public function getCashierNameAttribute()
    {
        return $this->user?->name ?? 'Unknown';
    }


    /*
    |--------------------------------------------------------------------------
    | Receipt Number
    |--------------------------------------------------------------------------
    */

    /**
     * Generate a receipt number.
     *
     * Example:
     * RCP-202608-0001
     */
    public static function generateReceiptNumber()
    {
        $prefix = 'RCP';

        $year = date('Y');
        $month = date('m');

        $last = self::whereYear(
                'created_at',
                $year
            )
            ->whereMonth(
                'created_at',
                $month
            )
            ->count() + 1;

        return sprintf(
            '%s-%s%s-%04d',
            $prefix,
            $year,
            $month,
            $last
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Status Helpers
    |--------------------------------------------------------------------------
    */

    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }


    public function isPending()
    {
        return $this->status === self::STATUS_PENDING_CASHIER;
    }


    /*
    |--------------------------------------------------------------------------
    | Complete Sale
    |--------------------------------------------------------------------------
    */

    public function complete($userId = null)
    {
        $this->status = self::STATUS_COMPLETED;

        $this->completed_by_cashier_at = now();

        if ($userId) {
            $this->user_id = $userId;
        }

        if (!$this->receipt_number) {
            $this->receipt_number =
                self::generateReceiptNumber();
        }

        $this->save();
    }


    /*
    |--------------------------------------------------------------------------
    | Cancel Sale
    |--------------------------------------------------------------------------
    */

    public function cancel()
    {
        $this->status = self::STATUS_CANCELLED;

        $this->save();
    }
}
