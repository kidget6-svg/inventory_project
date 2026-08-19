<?php

namespace App\Http\Requests;

class StorePurchaseOrderRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'supplier_id'        => ['required', 'exists:suppliers,id'],
            'manufacturing_company' => ['nullable', 'string', 'max:255'],
            'order_date'         => ['nullable', 'date', 'before_or_equal:today'],
            // Multi-item format (preferred)
            'items'              => ['required', 'array', 'min:1'],
            'items.*.medicine_id'       => ['nullable', 'exists:medicines,id'],
            'items.*.retail_product_id' => ['nullable', 'exists:retail_products,id'],
            'items.*.quantity'          => ['required', 'integer', 'min:1'],
            'items.*.unit_price'        => ['nullable', 'numeric', 'min:0'],
            // Legacy single-item format (backward compat)
            'medicine_name'      => ['nullable', 'string', 'max:255'],
            'medicine_id'        => ['nullable', 'exists:medicines,id'],
            'retail_product_id'  => ['nullable', 'exists:retail_products,id'],
            'quantity'           => ['nullable', 'integer', 'min:1'],
            'unit_price'         => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'supplier_id.required'      => 'Please select a supplier.',
            'supplier_id.exists'        => 'The selected supplier does not exist.',
            'order_date.date'           => 'The order date must be a valid date.',
            'order_date.before_or_equal' => 'The order date cannot be in the future.',
            'items.required'            => 'At least one item is required in the purchase order.',
            'items.array'               => 'Items must be provided as a list.',
            'items.min'                 => 'At least one item is required.',
            'items.*.medicine_id.exists' => 'One of the selected medicines does not exist.',
            'items.*.retail_product_id.exists' => 'One of the selected products does not exist.',
            'items.*.quantity.required' => 'The quantity is required for each item.',
            'items.*.quantity.integer'  => 'The quantity must be a whole number.',
            'items.*.quantity.min'      => 'The quantity must be at least 1.',
            'items.*.unit_price.numeric' => 'The unit price must be a valid number.',
            'items.*.unit_price.min'     => 'The unit price cannot be negative.',
            'medicine_id.exists'        => 'The selected medicine does not exist.',
            'retail_product_id.exists'  => 'The selected retail product does not exist.',
            'quantity.integer'          => 'The quantity must be a whole number.',
            'quantity.min'              => 'The quantity must be at least 1.',
            'unit_price.numeric'        => 'The unit price must be a valid number.',
            'unit_price.min'            => 'The unit price cannot be negative.',
        ];
    }
}
