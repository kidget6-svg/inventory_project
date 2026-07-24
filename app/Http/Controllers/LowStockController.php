<?php

namespace App\Http\Controllers;

use App\Models\Medicine;

class LowStockController extends Controller
{
    public function index()
    {
        $medicines = Medicine::whereColumn(
            'quantity',
            '<=',
            'reorder_level'
        )->orderBy('quantity')
         ->get();

        return view('low-stock.index', compact('medicines'));
    }
}