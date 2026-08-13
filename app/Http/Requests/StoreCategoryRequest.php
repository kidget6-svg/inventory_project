<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true; // Authorization is enforced by the permission middleware.
    }

    /**
     * Validation rules for creating a category.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'max:255', 'unique:categories,name'],
            'description'     => ['nullable', 'string'],
            'shelf_location'  => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Custom validation messages — displayed clearly to the user.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required'     => 'The category name is required.',
            'name.unique'       => 'A category with this name already exists. Please use a different name.',
            'name.max'          => 'The category name may not be greater than 255 characters.',
            'shelf_location.max' => 'The shelf location may not be greater than 255 characters.',
        ];
    }
}
