<?php

namespace App\Http\Requests;

class StoreRetailDraftRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'items'              => ['required', 'array', 'min:1'],
            'items.*.id'         => ['required', 'exists:retail_products,id'],
            'items.*.cartQty'    => ['required', 'integer', 'min:1'],
            'customer_name'      => ['nullable', 'string', 'max:255', 'not_regex:/^\s*$/'],
            'customer_phone'     => ['nullable', 'string', 'max:50', 'regex:/^[\+]?[0-9\s\-\(\)]+$/'],
            'customer_email'     => ['nullable', 'email', 'max:255'],
            'notes'              => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required'           => 'At least one product is required.',
            'items.array'              => 'Items must be provided as a list.',
            'items.min'                => 'At least one product is required.',
            'items.*.id.required'      => 'Please select a valid product.',
            'items.*.id.exists'        => 'The selected product does not exist.',
            'items.*.cartQty.required' => 'The quantity is required.',
            'items.*.cartQty.integer'  => 'The quantity must be a whole number.',
            'items.*.cartQty.min'      => 'The quantity must be at least 1.',
            'customer_name.not_regex'  => 'The customer name cannot be empty or whitespace only.',
            'customer_phone.regex'     => 'The phone number may only contain digits, spaces, +, - and parentheses.',
            'customer_email.email'     => 'Please enter a valid customer email address.',
        ];
    }
}
