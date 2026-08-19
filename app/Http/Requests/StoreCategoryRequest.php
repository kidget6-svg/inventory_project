<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreCategoryRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:255', 'unique:categories,name', 'not_regex:/^\s*$/'],
            'description'    => ['nullable', 'string'],
            'shelf_location' => ['nullable', 'string', 'max:255', 'not_regex:/^\s*$/'],
            'type'           => ['required', 'string', 'in:medicine,retail,otc'],
            'status'         => ['nullable', 'string', 'in:active,inactive'],
            'icon'           => ['nullable', 'string', 'max:50'],
            'color'          => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'          => 'The category name is required.',
            'name.not_regex'         => 'The category name cannot be empty or whitespace only.',
            'name.unique'            => 'A category with this name already exists. Please use a different name.',
            'name.max'               => 'The category name may not be greater than 255 characters.',
            'shelf_location.not_regex' => 'The shelf location cannot be empty or whitespace only.',
            'shelf_location.max'     => 'The shelf location may not be greater than 255 characters.',
            'type.required'          => 'The category type is required.',
            'type.in'                => 'The category type must be medicine, retail, or otc.',
            'status.in'              => 'The selected status is not valid.',
        ];
    }
}
