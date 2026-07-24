<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Medicine;
use Illuminate\Http\Request;

class SaleController extends Controller
{

    public function index()
    {
        $sales = Sale::latest()->get();

        return view('sales.index', compact('sales'));
    }



    public function create()
    {
        $medicines = Medicine::all();

        return view('sales.create', compact('medicines'));
    }



    public function store(Request $request)
    {

        $request->validate([
            'sale_date'=>'required',
            'total_amount'=>'required'
        ]);


        Sale::create([

            'sale_date'=>$request->sale_date,

            'total_amount'=>$request->total_amount

        ]);


        return redirect()
        ->route('sales.index')
        ->with('success','Sale created successfully');

    }



    public function show(Sale $sale)
    {
        return view('sales.show',compact('sale'));
    }



    public function edit(Sale $sale)
    {
        return view('sales.edit',compact('sale'));
    }



    public function update(Request $request, Sale $sale)
    {

        $sale->update([

            'sale_date'=>$request->sale_date,

            'total_amount'=>$request->total_amount

        ]);


        return redirect()
        ->route('sales.index');

    }



    public function destroy(Sale $sale)
    {

        $sale->delete();


        return redirect()
        ->route('sales.index');

    }

}