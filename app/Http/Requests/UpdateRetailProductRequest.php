<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateRetailProductRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $productId = $this->route('retailProduct') ? $this->route('retailProduct')->id : $this->route('id');

        return [
            'name'             => ['required', 'string', 'max:255', 'not_regex:/^\s*$/'],
            'sku'              => ['nullable', 'string', 'max:100', Rule::unique('retail_products', 'sku')->ignore($productId)],
            'barcode'          => ['nullable', 'string', 'max:100', Rule::unique('retail_products', 'barcode')->ignore($productId)],
            'category'         => ['required', 'string', 'max:255'],
            'supplier_id'      => ['nullable', 'exists:suppliers,id'],
            'quantity'         => ['nullable', 'integer', 'min:0'],
            'price'            => ['required', 'numeric', 'min:0'],
            'purchase_price'   => ['nullable', 'numeric', 'min:0'],
            'reorder_level'    => ['nullable', 'integer', 'min:0'],
            'expiry_date'      => ['nullable', 'date', 'after:yesterday'],
            'status'           => ['nullable', 'string', 'in:active,inactive,expired,discontinued'],
            'description'      => ['nullable', 'string'],
            'manufacturer'     => ['nullable', 'string', 'max:255'],
            'shelf_location'   => ['nullable', 'string', 'max:50'],
            'image'            => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'             => 'The product name is required.',
            'name.not_regex'            => 'The product name cannot be empty or whitespace only.',
            'name.max'                  => 'The product name may not be greater than 255 characters.',
            'sku.unique'                => 'Another product is already using this SKU.',
            'barcode.unique'            => 'Another product is already using this barcode.',
            'category.required'         => 'Please select a category.',
            'supplier_id.exists'        => 'The selected supplier does not exist.',
            'price.required'            => 'The product price is required.',
            'price.numeric'             => 'The price must be a valid number.',
            'price.min'                 => 'The price cannot be negative.',
            'purchase_price.numeric'    => 'The purchase price must be a valid number.',
            'purchase_price.min'        => 'The purchase price cannot be negative.',
            'reorder_level.integer'     => 'The reorder level must be a whole number.',
            'reorder_level.min'         => 'The reorder level cannot be negative.',
            'expiry_date.date'          => 'Please enter a valid expiry date.',
            'expiry_date.after'         => 'The expiry date cannot be in the past.',
            'status.in'                 => 'Invalid product status selected.',
            'image.image'               => 'The uploaded file must be an image (JPEG, PNG, or WebP).',
            'image.mimes'               => 'The image must be in JPEG, PNG, or WebP format.',
            'image.max'                 => 'The image must not exceed 2 MB.',
        ];
    }
}
