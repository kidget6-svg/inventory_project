<?php

namespace App\Http\Requests;

class UpdatePasswordRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'new_password'     => ['required', 'string', 'min:8', 'different:current_password', 'confirmed'],
            'new_password_confirmation' => ['required', 'string', 'min:8'],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required' => 'The current password is required.',
            'new_password.required'     => 'The new password is required.',
            'new_password.min'          => 'The new password must be at least 8 characters long.',
            'new_password.different'    => 'The new password must be different from your current password.',
            'new_password.confirmed'     => 'The password confirmation does not match.',
            'new_password_confirmation.required' => 'The password confirmation is required.',
            'new_password_confirmation.min' => 'The password confirmation must be at least 8 characters long.',
        ];
    }
}
