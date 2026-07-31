<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isApproved()) {
            abort(403, 'Your account is pending approval or has been rejected. Please contact an administrator.');
        }

        return $next($request);
    }
}
