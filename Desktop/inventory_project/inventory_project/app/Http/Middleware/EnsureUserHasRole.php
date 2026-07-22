<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  Comma-separated list of roles (e.g., "admin,pharmacist")
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user()) {
            return redirect()->route('login');
        }

        // Flatten comma-separated roles into a single array
        $allowedRoles = [];
        foreach ($roles as $roleParam) {
            $allowedRoles = array_merge($allowedRoles, array_map('trim', explode(',', $roleParam)));
        }

        if (! $request->user()->hasAnyRole($allowedRoles)) {
            abort(403, 'Unauthorized: You do not have the required role to access this resource.');
        }

        return $next($request);
    }
}
