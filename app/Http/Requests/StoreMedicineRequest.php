<?php

namespace App\Http\Requests;

class StoreMedicineRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                 => ['required', 'string', 'max:255', 'unique:medicines,name', 'not_regex:/^\s*$/'],
            'generic_name'         => ['nullable', 'string', 'max:255', 'not_regex:/^\s*$/'],
            'batch_number'         => ['nullable', 'string', 'max:255'],
            'barcode'              => ['nullable', 'string', 'max:100', 'unique:medicines,barcode', 'regex:/^[0-9A-Za-z\-]{3,100}$/'],
            'category_id'          => ['required', 'exists:categories,id'],
            'supplier_id'          => ['nullable', 'exists:suppliers,id'],
            'shelf_id'             => ['nullable', 'exists:shelves,id'],
            'prescription'         => ['boolean'],
            'prescription_details' => ['nullable', 'string'],
            'dosage_form'          => ['required', 'string', 'max:50'],
            'strength'             => ['required', 'string', 'max:100'],
            'unit'                 => ['required', 'string', 'max:255'],
            'manufacturer'         => ['nullable', 'string', 'max:255'],
            'shelf_location'       => ['nullable', 'string', 'max:50'],
            'image'                => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'quantity'             => ['nullable', 'integer', 'min:0'],
            'reorder_level'        => ['nullable', 'integer', 'min:0'],
            'expiry_date'          => ['nullable', 'date', 'after:yesterday'],
            'price'                => ['nullable', 'numeric', 'min:0'],
            'type'                 => ['nullable', 'string', 'in:medicine,retail,otc'],
            'status'               => ['nullable', 'string', 'in:active,inactive,expired,discontinued'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'               => 'The medicine name is required.',
            'name.not_regex'              => 'The medicine name cannot be empty or whitespace only.',
            'name.unique'                 => 'A medicine with this name already exists. Medicine names must be globally unique.',
            'name.max'                    => 'The medicine name may not be greater than 255 characters.',
            'barcode.unique'              => 'This barcode is already assigned to another medicine.',
            'barcode.regex'               => 'The barcode may only contain alphanumeric characters, hyphens, and be 3-100 characters long.',
            'category_id.required'        => 'Please select a category.',
            'category_id.exists'          => 'The selected category does not exist.',
            'supplier_id.exists'          => 'The selected supplier does not exist.',
            'shelf_id.exists'             => 'The selected shelf does not exist.',
            'dosage_form.required'        => 'The dosage form is required (e.g. tablet, capsule, syrup).',
            'dosage_form.max'             => 'The dosage form may not be greater than 50 characters.',
            'strength.required'           => 'The strength is required (e.g. 500 mg, 10 mg/5 ml).',
            'strength.max'                => 'The strength may not be greater than 100 characters.',
            'unit.required'               => 'The unit is required (e.g. tablet, bottle, vial).',
            'unit.max'                    => 'The unit may not be greater than 255 characters.',
            'quantity.integer'            => 'The quantity must be a whole number.',
            'quantity.min'                => 'The quantity cannot be negative.',
            'reorder_level.integer'       => 'The reorder level must be a whole number.',
            'reorder_level.min'           => 'The reorder level cannot be negative.',
            'expiry_date.date'            => 'Please enter a valid expiry date.',
            'expiry_date.after'           => 'The expiry date cannot be in the past.',
            'price.numeric'               => 'The price must be a valid number.',
            'price.min'                   => 'The price cannot be negative.',
            'image.image'                 => 'The uploaded file must be an image (JPEG, PNG, or WebP).',
            'image.mimes'                 => 'The image must be in JPEG, PNG, or WebP format.',
            'image.max'                   => 'The image must not exceed 2 MB.',
            'type.in'                     => 'The type must be medicine, retail, or otc.',
            'status.in'                   => 'The selected status is not valid.',
        ];
    }
}
