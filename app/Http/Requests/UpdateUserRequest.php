<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateUserRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $userId = $this->route('user') ? $this->route('user')->id : $this->route('id');

        return [
            'first_name' => ['required', 'string', 'max:255', 'regex:/^[\p{L}\s\-\'\.]+$/u', 'not_regex:/^\s*$/'],
            'last_name'  => ['nullable', 'string', 'max:255', 'regex:/^[\p{L}\s\-\'\.]+$/u'],
            'email'      => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'phone_number' => ['nullable', 'string', 'max:30', 'regex:/^[\+]?[0-9\s\-\(\)]+$/'],
            'role'       => ['required', 'string', 'in:admin,pharmacist,cashier,purchasing_staff'],
            'branch_id'  => ['nullable', 'integer', 'min:1', 'exists:branches,id'],
            'password'   => ['nullable', 'string', 'min:8', 'confirmed'],
            'gender'     => ['nullable', 'string', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required'    => 'The first name is required.',
            'first_name.regex'       => 'The first name may only contain letters, spaces, hyphens, apostrophes and periods.',
            'first_name.not_regex'   => 'The first name cannot be empty or whitespace only.',
            'last_name.regex'        => 'The last name may only contain letters, spaces, hyphens, apostrophes and periods.',
            'email.required'         => 'The email address is required.',
            'email.email'            => 'Please enter a valid email address.',
            'email.unique'           => 'Another user is already using this email address.',
            'phone_number.regex'     => 'The phone number may only contain digits, spaces, +, - and parentheses.',
            'role.required'          => 'The user role is required.',
            'role.in'                => 'The selected role is not valid. Allowed roles: admin, pharmacist, cashier.',
            'branch_id.exists'       => 'The selected branch does not exist.',
            'password.confirmed'     => 'The password confirmation does not match.',
            'password.min'           => 'The password must be at least 8 characters long.',
            'gender.in'              => 'The selected gender is not valid.',
            'date_of_birth.date'     => 'Please enter a valid date of birth.',
            'date_of_birth.before'   => 'The date of birth cannot be in the future.',
        ];
    }
}
