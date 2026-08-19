<?php

namespace App\Http\Requests;

class StoreRoleRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:255', 'unique:roles,name'],
            'description' => ['nullable', 'string'],
            'permissions' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'       => 'The role name is required.',
            'name.unique'         => 'A role with this name already exists.',
            'name.max'            => 'The role name may not exceed 255 characters.',
            'permissions.array'   => 'Permissions must be provided as a list.',
        ];
    }
}
