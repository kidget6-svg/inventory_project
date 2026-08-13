<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Medicine extends Model
{
    use HasFactory;

    /**
     * Prescription flags – stored as boolean but exposed as readable labels.
     */
    public const PRESCRIPTION_LABEL = 'Prescription Required';
    public const OTC_LABEL         = 'Over-the-Counter';

    /**
     * Default reorder level (kept for backward compatibility with dashboard UI).
     * Inventory tracking now lives in the Batch model.
     */
    public const DEFAULT_REORDER_LEVEL = 10;

    protected $fillable = [
        'name',
        'generic_name',
        'batch_number',
        'barcode',
        'category_id',
        'supplier_id',
        'shelf_id',
        'prescription',
        'dosage_form',
        'strength',
        'unit',
        'image',
        'manufacturer',
        'shelf_location',
    ];

    protected $casts = [
        'prescription' => 'boolean',
    ];

    /**
     * A medicine belongs to a category.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * A medicine may belong to a supplier.
     */
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * A medicine may be stored on a shelf.
     */
    public function shelf()
    {
        return $this->belongsTo(Shelf::class);
    }

    /**
     * A medicine has many batches.
     *
     * Inventory tracking (quantity, expiry date) has moved from the
     * medicines table to the batches table.  This relationship gives
     * access to the individual batch records for a medicine.
     */
    public function batches()
    {
        return $this->hasMany(Batch::class);
    }

    /**
     * Total quantity across all batches.
     *
     * Provided as an accessor so legacy dashboard / UI code that reads
     * $medicine->quantity continues to work.  The value is summed from
     * the related batches table.
     */
    public function getQuantityAttribute(): int
    {
        return (int) ($this->relationLoaded('batches')
            ? $this->batches->sum('quantity')
            : $this->batches()->sum('quantity'));
    }

    /**
     * Default reorder level for backward compatibility.
     *
     * The per-medicine reorder_level column has been removed from the
     * database.  Inventory re-ordering is now managed through the
     * purchasing workflow.  This accessor returns a sensible default
     * so existing UI code does not break.
     */
    public function getReorderLevelAttribute(): int
    {
        return self::DEFAULT_REORDER_LEVEL;
    }

    /**
     * Get the full public URL to the medicine image.
     * Falls back to a placeholder when no image is set.
     */
    public function getImageUrlAttribute(): string
    {
        if ($this->image) {
            return asset('storage/' . $this->image);
        }

        return asset('images/medicine-placeholder.svg');
    }

    /**
     * Human-readable prescription label.
     */
    public function getPrescriptionLabelAttribute(): string
    {
        return (bool) $this->prescription ? self::PRESCRIPTION_LABEL : self::OTC_LABEL;
    }

    /**
     * Full identification string e.g. "Paracetamol - Tablet - 500 mg - Box"
     */
    public function getIdentificationAttribute(): string
    {
        $parts = array_filter([
            $this->name,
            $this->dosage_form,
            $this->strength,
            $this->unit,
        ]);

        return implode(' - ', $parts);
    }
}
