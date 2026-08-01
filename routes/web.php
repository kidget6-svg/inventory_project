<?php
// routes/web.php

use Illuminate\Support\Facades\Route;

// ============================================
// CSRF TOKEN ROUTE FOR FRONTEND
// ============================================

Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
});

// ============================================
// CATCH-ALL: Serve React Single Page Application
// ============================================

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');