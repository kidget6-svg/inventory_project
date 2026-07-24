<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;

class LowStockController extends Controller
{
    public function index()
    {
        $medicines = Medicine::whereColumn('quantity', '<=', 'reorder_level')
            ->orderBy('quantity')
            ->get();

        return response()->json($medicines);
    }
}
