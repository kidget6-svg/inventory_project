<?php

namespace App\Http\Requests;

class ApiRegisterRequest extends ApiFormRequest
{
    protected function prepareForValidation(): void
    {
        if ((!$this->filled('first_name') || !$this->filled('last_name')) && $this->filled('name')) {
            $parts = explode(' ', trim($this->input('name')), 2);
            $this->merge([
                'first_name' => $this->input('first_name') ?: ($parts[0] ?? $this->input('name')),
                'last_name'  => $this->input('last_name')  ?: ($parts[1] ?? $parts[0] ?? $this->input('name')),
            ]);
        }
        // Ensure password_confirmation mirrors password if using _confirmation suffix
        if (!$this->filled('password_confirmation') && $this->filled('password_confirmation')) {
            $this->merge(['password_confirmation' => $this->input('password_confirmation')]);
        }
    }

    public function rules(): array
    {
        return [
            'first_name'    => ['required', 'string', 'max:255', 'regex:/^[\p{L}\s\-\'\.]+$/u'],
            'last_name'     => ['required', 'string', 'max:255', 'regex:/^[\p{L}\s\-\'\.]+$/u'],
            'email'         => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone_number'  => ['required', 'string', 'max:30', 'regex:/^[\+]?[0-9\s\-\(\)]+$/'],
            'password'      => ['required', 'string', 'min:8', 'confirmed'],
            'role'          => ['required', 'in:admin,pharmacist,cashier,purchasing_staff'],
            'gender'        => ['nullable', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'address'       => ['nullable', 'string'],
            // Pharmacist-only fields
            'license_number'               => ['nullable', 'string', 'max:255'],
            'license_expiry_date'          => ['nullable', 'date', 'after:today'],
            'professional_registration_number' => ['nullable', 'string', 'max:255'],
            'university'                   => ['nullable', 'string', 'max:255'],
            'degree'                       => ['nullable', 'string', 'max:255'],
            'years_of_experience'          => ['nullable', 'integer', 'min:0'],
            'national_id'                  => ['nullable', 'string', 'max:255'],
            'qualification'                => ['nullable', 'string', 'max:255'],
            // File uploads
            'profile_photo'        => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
            'license_document'     => ['nullable', 'mimes:pdf,jpeg,png,jpg', 'max:5120'],
            'qualification_document' => ['nullable', 'mimes:pdf,jpeg,png,jpg', 'max:5120'],
            'pharmacy_license'     => ['nullable', 'mimes:pdf,jpeg,png,jpg', 'max:5120'],
            'degree_certificate'   => ['nullable', 'mimes:pdf,jpeg,png,jpg', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required'             => 'The first name is required.',
            'first_name.regex'                => 'The first name may only contain letters, spaces, hyphens, apostrophes and periods.',
            'last_name.required'              => 'The last name is required.',
            'last_name.regex'                 => 'The last name may only contain letters, spaces, hyphens, apostrophes and periods.',
            'email.required'                  => 'The email address is required.',
            'email.email'                     => 'Please enter a valid email address.',
            'email.unique'                    => 'An account with this email already exists.',
            'phone_number.required'           => 'The phone number is required.',
            'phone_number.regex'              => 'The phone number may only contain digits, spaces, +, - and parentheses.',
            'password.required'               => 'The password is required.',
            'password.min'                    => 'The password must be at least 8 characters long.',
            'password.confirmed'              => 'The password confirmation does not match.',
            'role.required'                   => 'Please select a role.',
            'role.in'                         => 'The selected role is not valid.',
            'gender.in'                       => 'The selected gender is not valid.',
            'date_of_birth.date'              => 'Please enter a valid date of birth.',
            'date_of_birth.before'            => 'The date of birth cannot be in the future.',
            'license_expiry_date.date'        => 'Please enter a valid expiry date.',
            'license_expiry_date.after'       => 'The license expiry date must be in the future.',
            'years_of_experience.integer'     => 'Years of experience must be a whole number.',
            'years_of_experience.min'         => 'Years of experience cannot be negative.',
            'profile_photo.image'             => 'The profile photo must be an image (JPEG, PNG, or JPG).',
            'profile_photo.mimes'             => 'The profile photo must be in JPEG, PNG, or JPG format.',
            'profile_photo.max'               => 'The profile photo must not exceed 2 MB.',
            'license_document.mimes'          => 'The license document must be a PDF or image (JPEG, PNG, JPG).',
            'license_document.max'            => 'The license document must not exceed 5 MB.',
            'qualification_document.mimes'    => 'The qualification document must be a PDF or image (JPEG, PNG, JPG).',
            'qualification_document.max'      => 'The qualification document must not exceed 5 MB.',
            'pharmacy_license.mimes'          => 'The pharmacy license must be a PDF or image (JPEG, PNG, JPG).',
            'pharmacy_license.max'            => 'The pharmacy license must not exceed 5 MB.',
            'degree_certificate.mimes'          => 'The degree certificate must be a PDF or image (JPEG, PNG, JPG).',
            'degree_certificate.max'          => 'The degree certificate must not exceed 5 MB.',
        ];
    }
}
