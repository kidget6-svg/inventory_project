<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'email_verified_at',
        'password',
        'role',
        'status',
        'branch_id',
        'phone_number',
        'gender',
        'date_of_birth',
        'address',
        'profile_photo',
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
//         User::create([
//     'name' => 'Admin',
//     'email' => 'admin@pharmacy.com',
//     'password' => Hash::make('password'),
//     'role' => 'admin',
// ]);
        return $this->role === 'admin';
    }

    public function isPharmacist(): bool
    {
        return $this->role === 'pharmacist';
    }

    public function isCashier(): bool
    {
        return $this->role === 'cashier';
    }

    /**
     * The role row this user belongs to (for permission lookups).
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * The branch this user is assigned to.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    /**
     * The permissions granted to the user's role.
     */
    public function rolePermissions(): BelongsToMany
    {
        return $this->role()->with('permissions');
    }

    /**
     * Check whether the user should be scoped to a specific branch.
     * Pharmacists and cashiers see only their assigned branch.
     * Admins see all branches.
     */
    public function shouldScopeToBranch(): bool
    {
        return in_array($this->role, ['pharmacist', 'cashier']) && !empty($this->branch_id);
    }

    /**
     * Get the branch_id this user is scoped to (null for admin = all branches).
     */
    public function getBranchScope(): ?int
    {
        return $this->shouldScopeToBranch() ? $this->branch_id : null;
    }

    /**
     * Flat list of permission slugs the user currently holds.
     * Admins automatically hold every permission in the system.
     */
    public function permissions(): array
    {
        if ($this->role === 'admin') {
            return Permission::pluck('slug')->all();
        }

        $role = $this->role_id
            ? $this->role()->first()
            : Role::where('slug', $this->getAttribute('role'))->first();

        if ($role) {
            return $role->permissions()->pluck('permissions.slug')->all();
        }

        return [];
    }

    /**
     * Get the resolved permission slugs for API responses.
     */
    public function getPermissionsAttribute(): array
    {
        return $this->permissions();
    }

    /**
     * Check whether the user holds a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions(), true);
    }

    /**
     * Check whether the user holds any of the given permissions.
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
}
