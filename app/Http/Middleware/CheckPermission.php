<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * Checks whether the authenticated user possesses at least one of the
     * permissions passed in the middleware declaration.  Permissions may be
     * supplied as multiple arguments or as a single comma-separated string:
     *
     *   route->middleware('permission:suppliers.manage');
     *   route->middleware('permission:suppliers.manage,suppliers.view');
     *   route->middleware('permission:purchasing_history.view', 'permission:suppliers.manage');
     *
     * Admin users (role === 'admin') always pass because they hold the
     * wildcard "*" permission.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$permissions
     */
    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        $user = $request->user();

        if (! $user) {
            return $this->forbidden($request, 'Unauthenticated.');
        }

        // Admin role bypasses every permission check.
        if ($user->role === 'admin') {
            return $next($request);
        }

        // Flatten comma-separated permission lists and trim whitespace.
        $required = [];
        foreach ($permissions as $permission) {
            foreach (explode(',', $permission) as $p) {
                $p = trim($p);
                if ($p !== '') {
                    $required[] = $p;
                }
            }
        }

        // Check if the user has at least one of the required permissions.
        foreach ($required as $permission) {
            if ($user->hasPermission($permission)) {
                return $next($request);
            }
        }

        return $this->forbidden($request, 'This action is unauthorized.');
    }

    /**
     * Build the appropriate 403 response for the request type.
     */
    protected function forbidden(Request $request, string $message): Response
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => $message,
                'error'   => 'forbidden',
            ], 403);
        }

        abort(403, $message);
    }
}
