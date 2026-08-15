<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // Role Constants
    public const ROLE_ADMIN = 'admin';
    public const ROLE_PHARMACIST = 'pharmacist';
    public const ROLE_CASHIER = 'cashier';
    public const ROLE_PURCHASING_STAFF = 'purchasing_staff';

    // Status Constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    // All system roles
    public const ROLES = [
        self::ROLE_ADMIN,
        self::ROLE_PHARMACIST,
        self::ROLE_CASHIER,
        self::ROLE_PURCHASING_STAFF,
    ];

    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'email_verified_at',
        'password',
        'role',
        'status',
        'license_number',
        'license_expiry_date',
        'professional_registration_number',
        'university',
        'degree',
        'years_of_experience',
        'national_id',
        'license_document',
        'qualification_document',
        'pharmacy_license',
        'degree_certificate',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'role_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'license_expiry_date' => 'date',
        'approved_at' => 'datetime',
    ];

    protected $appends = ['permissions'];

    /**
     * Check if the user account is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if the user account is pending.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if the user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isPharmacist(): bool
    {
        return $this->role === self::ROLE_PHARMACIST;
    }

    public function isCashier(): bool
    {
        return $this->role === self::ROLE_CASHIER;
    }

    public function isPurchasingStaff(): bool
    {
        return $this->role === self::ROLE_PURCHASING_STAFF;
    }

    /**
     * The role row this user belongs to.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * Get all permissions for the user's role.
     */
    public function getAllPermissions(): array
    {
        return $this->permissions();
    }

    /**
     * Get the user's resolved permission slugs.
     */
    public function permissions(): array
    {
        // Admin has every permission.
        if ($this->role === self::ROLE_ADMIN) {
            return Permission::pluck('slug')->all();
        }

        $role = $this->role_id
            ? $this->role()->first()
            : Role::where('slug', $this->getAttribute('role'))->first();

        if ($role) {
            return $role->permissions()->pluck('permissions.slug')->all();
        }

        // Fallback to config-based permissions.
        return config(
            'permissions.permissions.' . $this->role,
            []
        );
    }

    /**
     * Get permissions for API responses.
     */
    public function getPermissionsAttribute(): array
    {
        return $this->permissions();
    }

    /**
     * Check if the user has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        // Admin automatically has every permission.
        if ($this->role === self::ROLE_ADMIN) {
            return true;
        }

        $permissions = $this->permissions();

        // Wildcard permission.
        if (in_array('*', $permissions, true)) {
            return true;
        }

        return in_array($permission, $permissions, true);
    }

    /**
     * Check whether the user has ANY of the given permissions.
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check whether the user has ALL of the given permissions.
     */
    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (! $this->hasPermission($permission)) {
                return false;
            }
        }

        return true;
    }
}
