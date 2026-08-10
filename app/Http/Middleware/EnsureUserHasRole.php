<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Laravel passes middleware parameters as separate args (not as a single comma-separated string),
        // so accept a variadic list and normalize into an array of allowed roles.
        if (count($roles) === 1 && is_string($roles[0]) && str_contains($roles[0], ',')) {
            $allowedRoles = array_map('trim', explode(',', $roles[0]));
        } else {
            $allowedRoles = array_map('trim', $roles);
        }

        if (!$request->user() || !in_array($request->user()->role, $allowedRoles)) {
            abort(403, 'Unauthorized. You do not have the required role.');
        }

        return $next($request);
    }
}
