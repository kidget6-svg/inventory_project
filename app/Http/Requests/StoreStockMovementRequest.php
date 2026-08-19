<?php

namespace App\Http\Requests;

class StoreStockMovementRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'type'            => ['required', 'string', 'in:in,out,adjustment,return,transfer,damaged,expired,lost,correction,self,warehouse'],
            'reference'       => ['nullable', 'string', 'max:255'],
            'notes'           => ['nullable', 'string'],
            'source_type'     => ['nullable', 'string', 'in:self,supplier,branch,sale,customer,warehouse'],
            'source_id'       => ['nullable', 'integer', 'min:1'],
            'destination_type'=> ['nullable', 'string', 'in:self,supplier,branch,sale,customer,warehouse'],
            'destination_id'  => ['nullable', 'integer', 'min:1'],
            'branch_id'       => ['nullable', 'integer', 'min:1', 'exists:branches,id'],
            'status'          => ['nullable', 'string', 'in:pending,approved,completed,cancelled'],
            'items'           => ['nullable', 'array', 'min:1'],
            'items.*.type'    => ['required_with:items', 'string', 'in:medicine,retail'],
            'items.*.id'      => ['required_with:items', 'integer', 'min:1'],
            'items.*.quantity'=> ['required_with:items', 'integer', 'min:1'],
            'medicine_id'     => ['nullable', 'exists:medicines,id'],
            'retail_product_id'=> ['nullable', 'exists:retail_products,id'],
            'quantity'        => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required'                => 'The movement type is required.',
            'type.in'                    => 'The selected movement type is not valid.',
            'reference.max'              => 'The reference may not exceed 255 characters.',
            'source_type.in'             => 'The source type is not valid.',
            'source_id.integer'          => 'The source ID must be a valid integer.',
            'destination_type.in'        => 'The destination type is not valid.',
            'destination_id.integer'     => 'The destination ID must be a valid integer.',
            'branch_id.integer'          => 'The branch ID must be a valid integer.',
            'branch_id.exists'           => 'The selected branch does not exist.',
            'status.in'                  => 'The selected status is not valid.',
            'items.array'                => 'Items must be provided as a list.',
            'items.min'                  => 'At least one item is required.',
            'items.*.type.required_with' => 'The product type is required for each item.',
            'items.*.type.in'            => 'The product type must be medicine or retail.',
            'items.*.id.required_with'   => 'The product ID is required for each item.',
            'items.*.id.integer'         => 'The product ID must be a valid integer.',
            'items.*.quantity.required_with' => 'The quantity is required for each item.',
            'items.*.quantity.integer'   => 'The quantity must be a whole number.',
            'items.*.quantity.min'       => 'The quantity must be at least 1.',
            'medicine_id.exists'         => 'The selected medicine does not exist.',
            'retail_product_id.exists'   => 'The selected retail product does not exist.',
            'quantity.integer'           => 'The quantity must be a whole number.',
            'quantity.min'               => 'The quantity must be at least 1.',
        ];
    }
}
