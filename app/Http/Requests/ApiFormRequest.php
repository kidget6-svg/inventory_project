<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * Base Form Request for all API endpoints.
 *
 * Guarantees that:
 *  - Validation failures always return a consistent JSON response
 *    with a `success: false`, `message`, and `errors` structure.
 *  - HTTP 422 (Unprocessable Entity) is used so the frontend can
 *    display field-level errors beside the incorrect fields.
 *  - Authorization is delegated to the route middleware; the request
 *    itself never gates access (prevents users from bypassing role/
 *    permission checks by altering the request payload).
 */
class ApiFormRequest extends FormRequest
{
    /**
     * Authorization is enforced by the route middleware
     * (role:*, permission:*).  Returning true here lets the
     * middleware decide rather than duplicating logic.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Convert a failed validation attempt into a JSON response.
     */
    protected function failedValidation(Validator $validator): void
    {
        $response = response()->json([
            'success' => false,
            'message' => 'The given data was invalid.',
            'errors'  => $validator->errors(),
        ], 422);

        throw new HttpResponseException($response);
    }

    /**
     * Ensure validation errors are returned as JSON even when the
     * request does not explicitly expect JSON (e.g. form-encoded API
     * posts).  Laravel normally redirects on failed validation for
     * non-JSON requests; this forces a JSON response.
     */
    protected function prepareForValidation(): void
    {
        if (! $this->expectsJson()) {
            $this->header('Accept', 'application/json');
        }
    }
}
