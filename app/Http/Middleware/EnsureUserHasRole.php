<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles  // Collects all passed roles into an array
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Handle cases where roles are passed as a single comma-separated string e.g. "admin,pharmacist,cashier"
        $allowedRoles = [];
        foreach ($roles as $role) {
            $allowedRoles = array_merge($allowedRoles, explode(',', $role));
        }

        // Trim whitespace just in case
        $allowedRoles = array_map('trim', $allowedRoles);

        // Check if the user's role is in the list of allowed roles
        if (! in_array($user->role, $allowedRoles)) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        return $next($request);
    }
}