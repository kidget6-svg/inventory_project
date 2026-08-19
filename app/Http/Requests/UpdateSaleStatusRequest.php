<?php

namespace App\Http\Requests;

use App\Models\Sale;

class UpdateSaleStatusRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'status'         => ['required', 'string', 'in:pending,pending_cashier,completed,cancelled'],
            'payment_method' => ['required', 'string', 'in:' . implode(',', array_keys(Sale::paymentMethods()))],
            'amount_paid'    => ['required', 'numeric', 'min:0'],
            'change_amount'  => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required'         => 'The sale status is required.',
            'status.in'               => 'The selected status is not valid.',
            'payment_method.required' => 'Please select a payment method.',
            'payment_method.in'       => 'The selected payment method is not valid.',
            'amount_paid.required'    => 'The amount paid is required.',
            'amount_paid.numeric'     => 'The amount paid must be a valid number.',
            'amount_paid.min'         => 'The amount paid cannot be negative.',
            'change_amount.numeric'   => 'The change amount must be a valid number.',
            'change_amount.min'       => 'The change amount cannot be negative.',
        ];
    }
}
