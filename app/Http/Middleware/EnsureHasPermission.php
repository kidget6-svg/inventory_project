<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHasPermission
{
    /**
     * Allow the request when the authenticated user holds any of the
     * given permissions (comma-separated slugs). Admins pass automatically.
     */
    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->hasAnyPermission($permissions)) {
            return $next($request);
        }

        return response()->json([
            'message' => 'You do not have permission to perform this action.',
        ], 403);
    }
}
