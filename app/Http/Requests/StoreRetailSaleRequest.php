<?php

namespace App\Http\Requests;

use App\Models\Sale;

class StoreRetailSaleRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'items'                 => ['required', 'array', 'min:1'],
            'items.*.id'            => ['required', 'exists:retail_products,id'],
            'items.*.cartQty'       => ['required', 'integer', 'min:1'],
            'payment_method'        => ['required', 'string', 'in:' . implode(',', array_keys(Sale::paymentMethods()))],
            'amount_paid'           => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required'             => 'At least one product is required.',
            'items.array'                => 'Items must be provided as a list.',
            'items.min'                  => 'At least one product is required.',
            'items.*.id.required'        => 'Please select a valid product.',
            'items.*.id.exists'          => 'The selected product does not exist.',
            'items.*.cartQty.required'   => 'The quantity is required.',
            'items.*.cartQty.integer'    => 'The quantity must be a whole number.',
            'items.*.cartQty.min'        => 'The quantity must be at least 1.',
            'payment_method.required'    => 'Please select a payment method.',
            'payment_method.in'          => 'The selected payment method is not valid.',
            'amount_paid.required'       => 'The amount paid is required.',
            'amount_paid.numeric'        => 'The amount paid must be a valid number.',
            'amount_paid.min'            => 'The amount paid cannot be negative.',
        ];
    }
}
