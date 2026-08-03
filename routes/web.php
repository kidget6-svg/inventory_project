<?php

use Illuminate\Support\Facades\Route;

// CSRF TOKEN ROUTE FOR FRONTEND
Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
});

// CATCH-ALL ROUTE FOR REACT SPA
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');