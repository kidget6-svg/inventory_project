<?php

namespace App\Http\Requests;

use App\Models\Sale;

class StoreMedicineSaleRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'items'                 => ['required', 'array', 'min:1'],
            'items.*.medicine_id'   => ['required', 'exists:medicines,id'],
            'items.*.quantity'      => ['required', 'integer', 'min:1'],
            'payment_method'        => ['nullable', 'string', 'in:' . implode(',', array_keys(Sale::paymentMethods()))],
            'amount_paid'           => ['nullable', 'numeric', 'min:0'],
            'customer_name'         => ['required', 'string', 'max:255', 'not_regex:/^\s*$/'],
            'customer_phone'        => ['required', 'string', 'max:50', 'regex:/^[\+]?[0-9\s\-\(\)]+$/'],
            'customer_email'        => ['nullable', 'email', 'max:255'],
            'notes'                 => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required'             => 'At least one medicine item is required for the sale.',
            'items.array'                => 'Items must be provided as a list.',
            'items.min'                  => 'At least one medicine item is required.',
            'items.*.medicine_id.required' => 'Please select a valid medicine.',
            'items.*.medicine_id.exists'  => 'The selected medicine does not exist.',
            'items.*.quantity.required'   => 'The quantity is required.',
            'items.*.quantity.integer'    => 'The quantity must be a whole number.',
            'items.*.quantity.min'        => 'The quantity must be at least 1.',
            'payment_method.in'           => 'The selected payment method is not valid.',
            'amount_paid.numeric'         => 'The amount paid must be a valid number.',
            'amount_paid.min'             => 'The amount paid cannot be negative.',
            'customer_name.required'      => 'The customer name is required.',
            'customer_name.not_regex'     => 'The customer name cannot be empty or whitespace only.',
            'customer_name.max'           => 'The customer name may not exceed 255 characters.',
            'customer_phone.required'     => 'The customer phone number is required.',
            'customer_phone.regex'        => 'The phone number may only contain digits, spaces, +, - and parentheses.',
            'customer_email.email'        => 'Please enter a valid customer email address.',
        ];
    }
}
