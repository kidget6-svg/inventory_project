<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use Illuminate\Http\Request;

class PurchaseOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
{
    $purchaseOrders = PurchaseOrder::with('supplier')
        ->orderBy('id', 'asc')
        ->get();

    return view('purchase-orders.index', compact('purchaseOrders'));
}

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $suppliers = Supplier::all();
        $medicines = Medicine::all();

        return view('purchase-orders.create', compact('suppliers', 'medicines'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'status' => 'required',
            'medicine_name' => 'nullable|string|max:255',
            'medicine_id' => 'nullable|exists:medicines,id',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
        ]);

        if (empty($request->medicine_name) && empty($request->medicine_id)) {
            return redirect()->back()->withErrors(['medicine_name' => 'Medicine name or medicine ID is required']);
        }

        $medicine = null;
        if (!empty($request->medicine_id)) {
            $medicine = Medicine::find($request->medicine_id);
        }
        if (!$medicine && !empty($request->medicine_name)) {
            $medName = trim($request->medicine_name);
            $medicine = Medicine::where('name', $medName)->first();
            if (!$medicine) {
                $defaultCategory = \App\Models\Category::first();
                $medicine = Medicine::create([
                    'name' => $medName,
                    'category_id' => $defaultCategory ? $defaultCategory->id : 1,
                    'quantity' => 0,
                    'unit_price' => $request->unit_price,
                    'selling_price' => $request->unit_price,
                    'status' => 'active',
                ]);
            }
        }

        // Calculate subtotal
        $subtotal = $request->quantity * $request->unit_price;

        // Create Purchase Order
        $purchaseOrder = PurchaseOrder::create([
            'supplier_id' => $request->supplier_id,
            'order_date' => $request->order_date,
            'status' => $request->status,
            'total_amount' => $subtotal,
        ]);

        // Create Purchase Order Item
        PurchaseOrderItem::create([
            'purchase_order_id' => $purchaseOrder->id,
            'medicine_id' => $medicine->id,
            'quantity' => $request->quantity,
            'unit_cost' => $request->unit_price,
        ]);

        // Increase medicine stock
        if ($medicine) {
            $medicine->quantity += $request->quantity;
            $medicine->save();
        }

        return redirect()
            ->route('purchase-orders.index')
            ->with('success', 'Purchase Order created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(PurchaseOrder $purchaseOrder)
    {
        return view('purchase-orders.show', compact('purchaseOrder'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PurchaseOrder $purchaseOrder)
    {
        $suppliers = Supplier::all();
        $medicines = Medicine::all();

        return view('purchase-orders.edit', compact(
            'purchaseOrder',
            'suppliers',
            'medicines'
        ));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->delete();

        return redirect()
            ->route('purchase-orders.index')
            ->with('success', 'Purchase Order deleted successfully.');
    }
}