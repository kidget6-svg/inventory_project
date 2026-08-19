<?php

namespace App\Http\Requests;

class WarehouseReceiveRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'purchase_order_id' => ['required', 'exists:purchase_orders,id'],
            'batch_number'      => ['required', 'string', 'max:255'],
            'expiry_date'       => ['required', 'date', 'after:today'],
            'quantity'          => ['required', 'integer', 'min:1'],
            'shelf_id'          => ['nullable', 'integer', 'min:1', 'exists:shelves,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'purchase_order_id.required' => 'The purchase order is required.',
            'purchase_order_id.exists'   => 'The selected purchase order does not exist.',
            'batch_number.required'      => 'The batch number is required.',
            'batch_number.max'           => 'The batch number may not exceed 255 characters.',
            'expiry_date.required'       => 'The expiry date is required.',
            'expiry_date.date'           => 'Please enter a valid expiry date.',
            'expiry_date.after'          => 'The expiry date must be in the future.',
            'quantity.required'          => 'The quantity is required.',
            'quantity.integer'           => 'The quantity must be a whole number.',
            'quantity.min'               => 'The quantity must be at least 1.',
            'shelf_id.integer'           => 'The shelf ID must be a valid integer.',
            'shelf_id.exists'            => 'The selected shelf does not exist.',
        ];
    }
}
