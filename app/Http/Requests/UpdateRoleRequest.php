<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateRoleRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $roleId = $this->route('role') ? $this->route('role')->id : $this->route('id');

        return [
            'name'        => ['required', 'string', 'max:255', Rule::unique('roles', 'name')->ignore($roleId)],
            'description' => ['nullable', 'string'],
            'permissions' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'       => 'The role name is required.',
            'name.unique'         => 'Another role is already using this name.',
            'name.max'            => 'The role name may not exceed 255 characters.',
            'permissions.array'   => 'Permissions must be provided as a list.',
        ];
    }
}
