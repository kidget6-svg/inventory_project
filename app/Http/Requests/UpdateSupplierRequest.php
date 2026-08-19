<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateSupplierRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $supplierId = $this->route('supplier') ? $this->route('supplier')->id : $this->route('id');

        return [
            'name'             => ['required', 'string', 'max:255', 'not_regex:/^\s*$/'],
            'contact_person'   => ['nullable', 'string', 'max:255', 'not_regex:/^\s*$/'],
            'phone'            => ['required', 'string', 'max:20', 'regex:/^[\+]?[0-9\s\-\(\)]+$/'],
            'email'            => ['nullable', 'email', 'max:255', Rule::unique('suppliers', 'email')->ignore($supplierId)],
            'address'          => ['nullable', 'string', 'not_regex:/^\s*$/'],
            'tax_id'           => ['nullable', 'string', 'max:255'],
            'payment_terms'    => ['nullable', 'string', 'max:255'],
            'lead_time_days'   => ['nullable', 'integer', 'min:0'],
            'preferred_communication' => ['nullable', 'string', 'in:email,phone,whatsapp'],
            'status'           => ['nullable', 'string', 'in:active,inactive'],
            'notes'            => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'             => 'The supplier name is required.',
            'name.not_regex'            => 'The supplier name cannot be empty or whitespace only.',
            'name.max'                  => 'The supplier name may not be greater than 255 characters.',
            'phone.required'            => 'The phone number is required.',
            'phone.regex'               => 'The phone number may only contain digits, spaces, +, - and parentheses.',
            'phone.max'                 => 'The phone number may not be greater than 20 characters.',
            'email.email'               => 'Please enter a valid email address.',
            'email.unique'              => 'Another supplier is already using this email address.',
            'email.max'                 => 'The email may not be greater than 255 characters.',
            'lead_time_days.integer'    => 'The lead time must be a whole number of days.',
            'lead_time_days.min'        => 'The lead time cannot be negative.',
            'preferred_communication.in' => 'The preferred communication method is not valid.',
            'status.in'                 => 'The selected status is not valid.',
        ];
    }
}
