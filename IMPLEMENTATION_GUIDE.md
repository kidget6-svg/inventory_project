# Medicine Category & Medicine Management Module — Implementation Guide

## Overview

This document describes the **Medicine Category** and **Medicine Management** module for the Laravel pharmacy inventory system (EthioPharmacy). It covers database schema, models, validation, API endpoints, routes, controller logic, Blade views, and the React (SPA) frontend.

## Key Design Decisions

| Requirement | Decision |
|---|---|
| Category name uniqueness | `unique:categories,name` on store; `Rule::unique()->ignore()` on update |
| Prevent deleting used categories | Controller checks `isAssociatedWithMedicines()` and returns `422` |
| Prescription field | `boolean` column — `true` = prescription required, `false` = over-the-counter |
| Removed fields | `unit_price`, `purchase_price`, `selling_price`, `quantity`, `reorder_level`, `expiry_date`, `status`, `description` (moved to Batch model) |
| Inventory tracking | Migrated to the **Batch** model (already exists with `quantity`, `expiry_date`, `unit_cost`) |
| Image storage | Laravel `public` disk — `php artisan storage:link` required |
| Barcode | `string(100) nullable unique` + dedicated `?barcode=` query param + label generator |

---

## 1. Database Migrations

### 1.1 Category name unique index

**File:** `database/migrations/2026_08_12_000000_make_category_name_unique.php`

```php
public function up(): void
{
    Schema::table('categories', function (Blueprint $table) {
        $table->unique('name', 'categories_name_unique');
    });
}

public function down(): void
{
    Schema::table('categories', function (Blueprint $table) {
        $table->dropUnique('categories_name_unique');
    });
}
```

### 1.2 Medicines table refactor

**File:** `database/migrations/2026_08_12_000001_refactor_medicines_table.php`

**Added columns:**
- `prescription` — `boolean`, default `false` (replaces `description`)
- `dosage_form` — `string(50)`, nullable (e.g. tablet, capsule, syrup…)
- `strength` — `string(100)`, nullable (e.g. 500 mg, 10 mg/5 ml, 1%)
- `unit` — `string(50)`, nullable (e.g. box, bottle, tablet…)

**Removed columns:**
`unit_price`, `purchase_price`, `selling_price`, `quantity`, `reorder_level`, `expiry_date`, `status`, `description`

**Constraints applied:**
- `name` → unique index
- `barcode` → unique index
- `category_id` → foreign key with `restrictOnDelete()` (prevents deleting a category that has medicines)

### Running Migrations

```bash
php artisan migrate:fresh --seed
```

Or, if the database already has data:

```bash
php artisan migrate
```

---

## 2. Models

### Category (`app/Models/Category.php`)

```php
class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'shelf_location'];

    public function medicines()
    {
        return $this->hasMany(Medicine::class);
    }

    public function isAssociatedWithMedicines(): bool
    {
        return $this->medicines()->exists();
    }
}
```

### Medicine (`app/Models/Medicine.php`)

```php
class Medicine extends Model
{
    use HasFactory;

    public const PRESCRIPTION_LABEL = 'Prescription Required';
    public const OTC_LABEL          = 'Over-the-Counter';
    public const DEFAULT_REORDER_LEVEL = 10;

    protected $fillable = [
        'name', 'generic_name', 'batch_number', 'barcode',
        'category_id', 'supplier_id', 'shelf_id', 'prescription',
        'dosage_form', 'strength', 'unit', 'image',
        'manufacturer', 'shelf_location',
    ];

    protected $casts = ['prescription' => 'boolean'];

    // Relationships
    public function category() { return $this->belongsTo(Category::class); }
    public function supplier()  { return $this->belongsTo(Supplier::class); }
    public function shelf()     { return $this->belongsTo(Shelf::class); }
    public function batches()  { return $this->hasMany(Batch::class); }

    // Computed accessors (backward compatibility with dashboard components)
    public function getQuantityAttribute(): int
    {
        return (int) ($this->relationLoaded('batches')
            ? $this->batches->sum('quantity')
            : $this->batches()->sum('quantity'));
    }

    public function getReorderLevelAttribute(): int
    {
        return self::DEFAULT_REORDER_LEVEL;
    }

    // Display helpers
    public function getImageUrlAttribute(): string
    {
        return $this->image
            ? asset('storage/' . $this->image)
            : asset('images/medicine-placeholder.svg');
    }

    public function getPrescriptionLabelAttribute(): string
    {
        return (bool) $this->prescription ? self::PRESCRIPTION_LABEL : self::OTC_LABEL;
    }

    public function getIdentificationAttribute(): string
    {
        return implode(' - ', array_filter([
            $this->name, $this->dosage_form, $this->strength, $this->unit
        ]));
    }
}
```

---

## 3. Form Request Validation

### StoreCategoryRequest

```php
'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
```

### UpdateCategoryRequest

```php
'name' => ['required', 'string', 'max:255',
    Rule::unique('categories', 'name')->ignore($this->route('category'))],
```

### StoreMedicineRequest

```php
'name'        => ['required', 'string', 'max:255', 'unique:medicines,name'],
'barcode'     => ['nullable', 'string', 'max:100', 'unique:medicines,barcode'],
'category_id' => ['required', 'exists:categories,id'],
'dosage_form' => ['required', 'string', 'max:50'],
'strength'    => ['required', 'string', 'max:100'],
'unit'        => ['required', 'string', 'max:50'],
'image'       => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
```

### UpdateMedicineRequest

Same as StoreMedicineRequest but with `Rule::unique()->ignore($this->route('medicine'))` for `name` and `barcode`, plus a `delete_image` boolean field.

---

## 4. Controllers & API Endpoints

### CategoryController (Api)

| Method | URI | Permission | Description |
|---|---|---|---|
| GET | `/api/categories` | `categories.view` | Paginated list with `medicines_count` |
| GET | `/api/categories/{id}` | `categories.view` | Single category with medicine count |
| POST | `/api/categories` | `categories.manage` | Create new category |
| PUT | `/api/categories/{id}` | `categories.manage` | Update category |
| DELETE | `/api/categories/{id}` | `categories.manage` | Delete — returns `422` if medicines are associated |

### MedicineController (Api)

| Method | URI | Permission | Description |
|---|---|---|---|
| GET | `/api/medicines` | `medicines.view` | Paginated list with search & filters |
| GET | `/api/medicines/{id}` | `medicines.view` | Single medicine detail |
| POST | `/api/medicines` | `medicines.manage` | Create with image upload |
| PUT | `/api/medicines/{id}` | `medicines.manage` | Update with image replacement |
| DELETE | `/api/medicines/{id}` | `medicines.manage` | Delete — also removes image file |
| GET | `/api/medicines/barcode-label/{id}` | `medicines.view` | Returns label data for printing |

### Search & Barcode

```
GET /api/medicines?search=paracetamol          — multi-field search
GET /api/medicines?barcode=1234567890123       — exact barcode lookup
GET /api/medicines?category_id=5               — filter by category
GET /api/medicines?prescription=true           — filter by Rx flag
GET /api/medicines?per_page=25                 — pagination
```

---

## 5. Image Upload

### Setup

```bash
# Create the symbolic link between public/ and storage/
php artisan storage:link
```

### Storage Logic

```php
// Store with unique filename (Laravel auto-generates)
$path = $request->file('image')->store('medicine-images', 'public');

// Delete old image when replacing
Storage::disk('public')->delete($medicine->image);

// Delete image on medicine deletion
Storage::disk('public')->delete($medicine->image);
```

### Validation

- **MIME types:** `jpeg`, `png`, `jpg`, `webp`
- **Max size:** 2 MB (`max:2048`)

### Display

Images are displayed on:
- Medicine list page (thumbnail in table)
- Medicine details modal (large preview)
- Medicine edit form (preview with remove option)

---

## 6. Barcode Support

### Barcode Field

- **Database:** `string(100) nullable unique` on `medicines.barcode`
- **Form:** Text input with camera scan button (using `BarcodeDetector` API)
- **Search:** Dedicated `?barcode=` query parameter on the list endpoint
- **Validation error:** "This barcode is already assigned to another medicine."

### Barcode Label Generation

```
GET /api/medicines/barcode-label/{id}
```

Returns medicine data + barcode value for label printing. The React frontend opens a print window with the label content.

---

## 7. Database Indexes

| Table | Column(s) | Type |
|---|---|---|
| `categories` | `name` | unique |
| `medicines` | `name` | unique |
| `medicines` | `barcode` | unique |
| `medicines` | `category_id` | foreign key (restrict on delete) |
| `medicines` | `created_at`, `updated_at` | timestamps (auto-managed) |

---

## 8. Foreign-Key Protection

The migration adds a foreign key constraint on `medicines.category_id`:

```php
$table->foreign('category_id')
    ->references('id')
    ->on('categories')
    ->cascadeOnUpdate()
    ->restrictOnDelete();
```

Additionally, the CategoryController's `destroy()` method checks for associated medicines and returns HTTP `422` with a descriptive message.

---

## 9. Authorization

### Permission-based Middleware

All routes are protected by the `CheckPermission` middleware:

**Categories:**
- `categories.view` — read access
- `categories.manage` — create, update, delete

**Medicines:**
- `medicines.view` — read access (admin, pharmacist, cashier, purchasing staff)
- `medicines.manage` — create, update, delete (admin, pharmacist only)

### Frontend Permission Checks

The React components use `useAuth().can()` to check permissions before showing create/edit/delete buttons.

---

## 10. Seeding & Factories

### MedicineSeeder

Seeds 15 realistic medicine entries with proper `prescription` flags:

```bash
php artisan db:seed --class=MedicineSeeder
```

### MedicineFactory

```bash
php artisan tinker
>>> \App\Models\Medicine::factory()->count(50)->create();
```

---

## 11. Testing the Complete Feature

### Step 1: Database Setup

```bash
php artisan migrate:fresh --seed
```

### Step 2: Storage Link

```bash
php artisan storage:link
```

### Step 3: Start Development Server

```bash
php artisan serve
# Frontend
npm run dev
```

### Step 4: Test Category Management

1. Log in as **admin** or **pharmacist**
2. Navigate to `/categories`
3. **Create** a new category — enter a unique name
4. **Edit** a category — change name (unique validation should prevent duplicates)
5. **View** a category — see medicine count
6. **Delete** a category with associated medicines — should get error message
7. **Delete** a category with no medicines — should succeed

### Step 5: Test Medicine Management

1. Navigate to `/medicines`
2. **Search** using the search bar (by name, dosage form, strength)
3. **Scan barcode** — click the camera icon and scan a barcode
4. **Enter barcode** — type a barcode in the barcode field
5. **Filter by category** using the dropdown
6. **Add a medicine** — fill the form with all required fields
7. **Upload an image** — select a JPEG/PNG/WebP image
8. **View a medicine** — see the identification string and image preview
9. **Print a barcode label** — click "Print Barcode Label" in the view modal
10. **Edit a medicine** — replace the image, remove the image
11. **Delete a medicine** — image file should be removed from storage

### Step 6: Verify Validation

1. Try creating a category with a duplicate name → see error message
2. Try creating a medicine without a name → see error message
3. Try creating a medicine with a duplicate barcode → see error message
4. Try uploading a non-image file → see error message

### Step 7: Verify Authorization

1. Log in as **cashier** — cannot see create/edit/delete buttons
2. Log in as **pharmacist** — can create/edit/delete medicines and categories
3. Log in as **purchasing_staff** — can view but not manage medicines/categories

---

## 12. Backward Compatibility Notes

- The `quantity` and `reorder_level` accessors on the Medicine model compute values from the `batches` table, allowing dashboard components (LowStockAlert, InventoryStatusChart, ExpiryAlert) to continue working.
- The DashboardController and LowStockController have been updated to query the `batches` table for stock and expiry information.
- The `syncAutomaticExpiryState()` call has been removed from the DashboardController (the method did not exist in the refactored model).

---

## 13. File Summary

### Created/Updated Files

| File | Action |
|---|---|
| `database/migrations/2026_08_12_000000_make_category_name_unique.php` | ✅ Existing |
| `database/migrations/2026_08_12_000001_refactor_medicines_table.php` | ✅ Existing |
| `app/Models/Category.php` | ✏️ Updated |
| `app/Models/Medicine.php` | ✏️ Updated (new fields, accessors, relationships) |
| `app/Http/Requests/StoreCategoryRequest.php` | ✅ Created |
| `app/Http/Requests/UpdateCategoryRequest.php` | ✅ Created |
| `app/Http/Requests/StoreMedicineRequest.php` | ✅ Created |
| `app/Http/Requests/UpdateMedicineRequest.php` | ✅ Created |
| `app/Http/Controllers/Api/CategoryController.php` | ✏️ Updated (uniqueness, deletion protection) |
| `app/Http/Controllers/Api/MedicineController.php` | ✏️ Updated (new fields, barcode search, image deletion, barcode label) |
| `app/Http/Controllers/Api/DashboardController.php` | ✏️ Updated (batch-based queries) |
| `app/Http/Controllers/Api/LowStockController.php` | ✏️ Updated (batch-based queries) |
| `app/Http/Controllers/CategoryController.php` | ✏️ Updated (Form Requests, deletion protection) |
| `app/Http/Controllers/MedicineController.php` | ✏️ Updated (Form Requests, image handling) |
| `routes/api.php` | ✏️ Updated (barcode label route, removed status route) |
| `routes/web.php` | ✏️ Updated (barcode label route, removed status route) |
| `database/factories/MedicineFactory.php` | ✏️ Updated |
| `database/seeders/MedicineSeeder.php` | ✏️ Updated |
| `resources/js/pages/Medicines.jsx` | ✏️ Rewritten |
| `resources/js/pages/Categories.jsx` | ✏️ Updated |
| `resources/js/pages/CategoryView.jsx` | ✏️ Updated |
| `resources/js/pages/CategoryCreate.jsx` | ✏️ Updated |
| `resources/js/pages/CategoryEdit.jsx` | ✏️ Updated |
| `resources/js/components/ExpiryAlert.jsx` | ✏️ Updated (graceful handling) |
