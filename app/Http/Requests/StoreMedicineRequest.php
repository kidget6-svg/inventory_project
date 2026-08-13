<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreMedicineRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true; // Authorization is enforced by the permission middleware.
    }

    /**
     * Validation rules for creating a medicine.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:255', 'unique:medicines,name'],
            'generic_name'   => ['nullable', 'string', 'max:255'],
            'batch_number'   => ['nullable', 'string', 'max:255'],
            'barcode'        => ['nullable', 'string', 'max:100', 'unique:medicines,barcode'],
            'category_id'    => ['required', 'exists:categories,id'],
            'supplier_id'    => ['nullable', 'exists:suppliers,id'],
            'shelf_id'       => ['nullable', 'exists:shelves,id'],
            'prescription'   => ['boolean'],
            'dosage_form'    => ['required', 'string', 'max:50'],
            'strength'       => ['required', 'string', 'max:100'],
            'unit'           => ['required', 'string', 'max:50'],
            'manufacturer'   => ['nullable', 'string', 'max:255'],
            'shelf_location' => ['nullable', 'string', 'max:50'],
            'image'          => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }

    /**
     * Custom validation messages — displayed clearly to the user.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required'      => 'The medicine name is required.',
            'name.unique'        => 'A medicine with this name already exists. Medicine names must be globally unique.',
            'barcode.unique'     => 'This barcode is already assigned to another medicine.',
            'category_id.required' => 'Please select a category.',
            'category_id.exists'   => 'The selected category does not exist.',
            'dosage_form.required' => 'The dosage form is required (e.g. tablet, capsule, syrup).',
            'strength.required'    => 'The strength is required (e.g. 500 mg, 10 mg/5 ml).',
            'unit.required'        => 'The unit is required (e.g. box, bottle, tablet).',
            'image.image'          => 'The uploaded file must be an image (JPEG, PNG, or WebP).',
            'image.mimes'          => 'The image must be in JPEG, PNG, or WebP format.',
            'image.max'            => 'The image must not exceed 2 MB.',
        ];
    }
}
