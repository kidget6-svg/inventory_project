<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateShelfRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $shelfId = $this->route('shelf') ? $this->route('shelf')->id : $this->route('id');

        return [
            'shelf_location' => ['required', 'string', 'max:255', Rule::unique('shelves', 'shelf_location')->ignore($shelfId), 'not_regex:/^\s*$/'],
            'description'    => ['nullable', 'string'],
            'capacity'       => ['required', 'integer', 'min:1'],
            'branch_id'      => ['nullable', 'integer', 'min:1', 'exists:branches,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'shelf_location.required' => 'The shelf location is required.',
            'shelf_location.not_regex' => 'The shelf location cannot be empty or whitespace only.',
            'shelf_location.unique'   => 'Another shelf is already using this location.',
            'shelf_location.max'      => 'The shelf location may not exceed 255 characters.',
            'capacity.required'       => 'The shelf capacity is required.',
            'capacity.integer'        => 'The capacity must be a whole number.',
            'capacity.min'            => 'The capacity must be at least 1.',
            'branch_id.integer'       => 'The branch ID must be a valid integer.',
            'branch_id.exists'        => 'The selected branch does not exist.',
        ];
    }
}
