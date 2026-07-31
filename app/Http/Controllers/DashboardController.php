<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Sale;
use App\Models\User;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->isAdmin()) {
            return response()->json(
                $this->adminDashboard()
            );
        }

        if ($user->isPharmacist()) {
            return response()->json(
                $this->pharmacistDashboard()
            );
        }

        return response()->json(
            $this->cashierDashboard()
        );
    }



    private function adminDashboard()
    {

        return [

            // Cards
            'totalMedicines' => Medicine::count(),

            'totalStock' => Medicine::sum('quantity'),


            'lowStockCount' =>
                Medicine::whereColumn(
                    'quantity',
                    '<=',
                    'reorder_level'
                )->count(),


            'expiredCount' =>
                Medicine::whereDate(
                    'expiry_date',
                    '<',
                    today()
                )->count(),



            'pendingPurchaseOrders' =>
                PurchaseOrder::where(
                    'status',
                    'pending'
                )->count(),



            'totalUsers' =>
                User::count(),




            // Today's sales

            'todayRevenue' =>
                Sale::whereDate(
                    'sale_date',
                    today()
                )->sum('total_amount'),



            'todaySalesCount' =>
                Sale::whereDate(
                    'sale_date',
                    today()
                )->count(),





            // Purchase vs Sales

            'purchaseVsSales' => [

                'totalPurchases' =>
                    PurchaseOrder::sum('total_amount'),


                'totalSales' =>
                    Sale::sum('total_amount'),


                'purchaseCount' =>
                    PurchaseOrder::count(),


                'salesCount' =>
                    Sale::count(),

            ],




            // Inventory chart

            'inventoryStatus' => [

                'inStock' =>
                    Medicine::where(
                        'quantity',
                        '>',
                        0
                    )->count(),


                'lowStock' =>
                    Medicine::whereColumn(
                        'quantity',
                        '<=',
                        'reorder_level'
                    )->count(),



                'outOfStock' =>
                    Medicine::where(
                        'quantity',
                        0
                    )->count(),



                'expired' =>
                    Medicine::whereDate(
                        'expiry_date',
                        '<',
                        today()
                    )->count(),

            ],





            // Low stock list

            'lowStockMedicines' =>

                Medicine::whereColumn(
                    'quantity',
                    '<=',
                    'reorder_level'
                )
                ->with('category')
                ->limit(5)
                ->get(),






            // Expiry

            'expiringSoon' => [

                '30_days' =>
                    Medicine::whereBetween(
                        'expiry_date',
                        [
                            today(),
                            today()->addDays(30)
                        ]
                    )->get(),


                '60_days' =>
                    Medicine::whereBetween(
                        'expiry_date',
                        [
                            today(),
                            today()->addDays(60)
                        ]
                    )->get(),


                '90_days' =>
                    Medicine::whereBetween(
                        'expiry_date',
                        [
                            today(),
                            today()->addDays(90)
                        ]
                    )->get(),

            ],




            // Activity

            'recentActivities' => [

                [
                    'id'=>1,
                    'action'=>'Dashboard loaded',
                    'user'=>auth()->user()->name,
                    'icon'=>'activity',
                    'date'=>now()->format('Y-m-d'),
                    'time'=>now()->format('H:i')
                ]

            ],




            // Sales chart

            'salesAnalytics'=>[

                'daily'=>[],

                'weekly'=>[],

                'monthly'=>[]

            ],


        ];

    }





    private function pharmacistDashboard()
    {
        return [
            'totalMedicines'=>Medicine::count(),
            'totalStock'=>Medicine::sum('quantity'),

            'lowStockCount'=>
                Medicine::whereColumn(
                    'quantity',
                    '<=',
                    'reorder_level'
                )->count()
        ];
    }





    private function cashierDashboard()
    {
        return [

            'todayRevenue'=>
                Sale::whereDate(
                    'sale_date',
                    today()
                )->sum('total_amount'),


            'todaySalesCount'=>
                Sale::whereDate(
                    'sale_date',
                    today()
                )->count(),

        ];
    }
}