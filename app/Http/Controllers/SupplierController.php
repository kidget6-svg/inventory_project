<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{

    // Display all suppliers
    public function index()
    {
        $suppliers = Supplier::all();

        return view('suppliers.index', compact('suppliers'));
    }


    // Show create form
    public function create()
    {
        return view('suppliers.create');
    }


    // Save supplier
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'phone' => 'nullable',
            'email' => 'nullable|email',
            'address' => 'nullable'
        ]);


        Supplier::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
        ]);


        return redirect('/suppliers')
            ->with('success','Supplier added successfully');
    }


    // Show single supplier
    public function show(Supplier $supplier)
    {
        return view('suppliers.show', compact('supplier'));
    }


    // Edit supplier
    public function edit(Supplier $supplier)
    {
        return view('suppliers.edit', compact('supplier'));
    }


    // Update supplier
    public function update(Request $request, Supplier $supplier)
    {

        $supplier->update($request->all());

        return redirect('/suppliers');
    }


    // Delete supplier
    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return redirect('/suppliers');
    }

}