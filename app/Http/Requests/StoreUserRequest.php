<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreUserRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ((!$this->filled('first_name') || !$this->filled('last_name')) && $this->filled('name')) {
            $parts = explode(' ', trim($this->input('name')), 2);
            $this->merge([
                'first_name' => $this->input('first_name') ?: ($parts[0] ?? $this->input('name')),
                'last_name'  => $this->input('last_name')  ?: ($parts[1] ?? $parts[0] ?? $this->input('name')),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'first_name'            => ['required', 'string', 'max:255', 'regex:/^[\p{L}\s\-\'\.]+$/u', 'not_regex:/^\s*$/'],
            'last_name'             => ['nullable', 'string', 'max:255', 'regex:/^[\p{L}\s\-\'\.]+$/u', 'not_regex:/^\s*$/'],
            'email'                 => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone_number'          => ['nullable', 'string', 'max:30', 'regex:/^[\+]?[0-9\s\-\(\)]+$/'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'role'                  => ['required', 'in:admin,pharmacist,cashier,purchasing_staff'],
            'gender'                => ['nullable', 'in:male,female,other'],
            'date_of_birth'         => ['nullable', 'date', 'before:today'],
            'address'               => ['nullable', 'string'],
            'branch_id'             => ['nullable', 'integer', 'min:1', 'exists:branches,id'],
            'profile_photo'         => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
            'license_number'        => ['nullable', 'string', 'max:255'],
            'license_expiry_date'   => ['nullable', 'date', 'after:today'],
            'professional_registration_number' => ['nullable', 'string', 'max:255'],
            'university'            => ['nullable', 'string', 'max:255'],
            'degree'                => ['nullable', 'string', 'max:255'],
            'years_of_experience'   => ['nullable', 'integer', 'min:0'],
            'national_id'           => ['nullable', 'string', 'max:255'],
            'qualification'         => ['nullable', 'string', 'max:255'],
            'pharmacy_license'      => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:5120'],
            'degree_certificate'    => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:5120'],
            'qualification_document'=> ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:5120'],
            'license_document'      => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required'                => 'The first name is required.',
            'first_name.regex'                   => 'The first name may only contain letters, spaces, hyphens, apostrophes and periods.',
            'first_name.not_regex'               => 'The first name cannot be empty or whitespace only.',
            'last_name.regex'                    => 'The last name may only contain letters, spaces, hyphens, apostrophes and periods.',
            'last_name.not_regex'                => 'The last name cannot be empty or whitespace only.',
            'email.required'                     => 'The email address is required.',
            'email.email'                        => 'Please enter a valid email address.',
            'email.unique'                       => 'An account with this email already exists.',
            'phone_number.regex'                 => 'The phone number may only contain digits, spaces, +, - and parentheses.',
            'password.required'                  => 'The password is required.',
            'password.min'                       => 'The password must be at least 8 characters long.',
            'password.confirmed'                 => 'The password confirmation does not match.',
            'role.required'                      => 'The user role is required.',
            'role.in'                            => 'The selected role is not valid. Allowed roles: admin, pharmacist, cashier, purchasing_staff.',
            'gender.in'                          => 'The selected gender is not valid.',
            'date_of_birth.date'                 => 'Please enter a valid date of birth.',
            'date_of_birth.before'               => 'The date of birth cannot be in the future.',
            'branch_id.exists'                   => 'The selected branch does not exist.',
            'profile_photo.image'                => 'The profile photo must be an image (JPEG, PNG, or JPG).',
            'profile_photo.mimes'                => 'The profile photo must be in JPEG, PNG, or JPG format.',
            'profile_photo.max'                  => 'The profile photo must not exceed 2 MB.',
            'license_expiry_date.date'           => 'Please enter a valid expiry date.',
            'license_expiry_date.after'          => 'The license expiry date must be in the future.',
            'years_of_experience.integer'        => 'Years of experience must be a whole number.',
            'years_of_experience.min'            => 'Years of experience cannot be negative.',
            'pharmacy_license.mimes'             => 'The pharmacy license must be a PDF or image (JPEG, PNG, JPG).',
            'pharmacy_license.max'               => 'The pharmacy license must not exceed 5 MB.',
            'license_document.mimes'             => 'The license document must be a PDF or image (JPEG, PNG, JPG).',
            'license_document.max'               => 'The license document must not exceed 5 MB.',
            'degree_certificate.mimes'           => 'The degree certificate must be a PDF or image (JPEG, PNG, JPG).',
            'degree_certificate.max'             => 'The degree certificate must not exceed 5 MB.',
            'qualification_document.mimes'       => 'The qualification document must be a PDF or image (JPEG, PNG, JPG).',
            'qualification_document.max'         => 'The qualification document must not exceed 5 MB.',
        ];
    }
}
