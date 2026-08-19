<?php

namespace App\Http\Requests;

class ApiLoginRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required'    => 'The email address is required.',
            'email.email'       => 'Please enter a valid email address.',
            'password.required' => 'The password is required.',
        ];
    }
}
