<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'full_name' => 'required|regex:/^[a-zA-Z]+(?: [a-zA-Z]+)*$/|',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed|min:8',
            'role' => ['required', Rule::exists('roles', 'slug')],
            'gender' => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'phone_number' => 'nullable|string|max:20',
            'license_number' => 'nullable|string|max:255',
            'license_expiry_date' => 'nullable|date',
            'professional_registration_number' => 'nullable|string|max:255',
            'university' => 'nullable|string|max:255',
            'degree' => 'nullable|string|max:255',
            'years_of_experience' => 'nullable|integer|min:0',
            'national_id' => 'nullable|string|max:255',
            'pharmacy_license' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'degree_certificate' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'qualification' => 'nullable|string|max:255',
            'license_document' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'qualification_document' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
        ];
    }

    public function messages()
    {
        return [
            'full_name.regex' => 'Name must contain letters only.',
        ];
    }
}
