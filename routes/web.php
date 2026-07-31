<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\LowStockController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserController;



/*
|--------------------------------------------------------------------------
| CSRF TOKEN
|--------------------------------------------------------------------------
*/

Route::get('/csrf-token', function () {

    return response()->json([
        'token' => csrf_token()
    ]);

});



/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/


Route::post('/login', [
    AuthController::class,
    'login'
]);




Route::middleware('auth')->group(function () {



    /*
    |--------------------------------------------------------------------------
    | USER AUTH
    |--------------------------------------------------------------------------
    */

    Route::post('/logout', [
        AuthController::class,
        'logout'
    ]);


    Route::get('/user', [
        AuthController::class,
        'user'
    ]);





    /*
    |--------------------------------------------------------------------------
    | DASHBOARD
    |--------------------------------------------------------------------------
    */

    Route::get('/dashboard', [
        DashboardController::class,
        'index'
    ]);







    /*
    |--------------------------------------------------------------------------
    | USERS (ADMIN ONLY)
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:admin')->group(function(){


        Route::post('/register', [
            AuthController::class,
            'register'
        ]);


        Route::apiResource(
            'users',
            UserController::class
        );


    });







    /*
    |--------------------------------------------------------------------------
    | CATEGORIES
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:admin')->group(function(){


        Route::apiResource(
            'categories',
            CategoryController::class
        );


    });








    /*
    |--------------------------------------------------------------------------
    | SUPPLIERS
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:admin')->group(function(){


        Route::apiResource(
            'suppliers',
            SupplierController::class
        );


    });









    /*
    |--------------------------------------------------------------------------
    | PURCHASE ORDERS
    |--------------------------------------------------------------------------
    */


    Route::middleware('role:admin')->group(function(){



        Route::apiResource(
            'purchase-orders',
            PurchaseOrderController::class
        );



        Route::post(
            'purchase-orders/{purchaseOrder}/approve',
            [
                PurchaseOrderController::class,
                'approve'
            ]
        );


        Route::post(
            'purchase-orders/{purchaseOrder}/process',
            [
                PurchaseOrderController::class,
                'process'
            ]
        );


        Route::post(
            'purchase-orders/{purchaseOrder}/complete',
            [
                PurchaseOrderController::class,
                'complete'
            ]
        );


        Route::post(
            'purchase-orders/{purchaseOrder}/cancel',
            [
                PurchaseOrderController::class,
                'cancel'
            ]
        );


    });










    /*
    |--------------------------------------------------------------------------
    | MEDICINES
    |--------------------------------------------------------------------------
    */


    Route::middleware('role:admin,pharmacist')->group(function(){


        Route::apiResource(
            'medicines',
            MedicineController::class
        );


    });









    /*
    |--------------------------------------------------------------------------
    | STOCK MOVEMENTS
    |--------------------------------------------------------------------------
    */


    Route::middleware('role:admin,pharmacist')->group(function(){


        Route::apiResource(
            'stock-movements',
            StockMovementController::class
        );


    });










    /*
    |--------------------------------------------------------------------------
    | LOW STOCK
    |--------------------------------------------------------------------------
    */


    Route::middleware('role:admin,pharmacist')->group(function(){


        Route::get(
            '/low-stock',
            [
                LowStockController::class,
                'index'
            ]
        );


    });









    /*
    |--------------------------------------------------------------------------
    | SALES
    |--------------------------------------------------------------------------
    */


    Route::middleware('role:admin,cashier')->group(function(){


        Route::apiResource(
            'sales',
            SaleController::class
        );


    });










    /*
    |--------------------------------------------------------------------------
    | REPORTS
    |--------------------------------------------------------------------------
    */


    Route::middleware('role:admin,pharmacist')->group(function(){


        Route::get(
            '/reports',
            [
                ReportController::class,
                'index'
            ]
        );


    });



});







/*
|--------------------------------------------------------------------------
| REACT FRONTEND
|--------------------------------------------------------------------------
| Keep this LAST
|--------------------------------------------------------------------------
*/


Route::get('/{any}', function(){

    return view('app');

})->where('any','.*');