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
            'medicine_id' => 'required|exists:medicines,id',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
        ]);

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
    'medicine_id' => $request->medicine_id,
    'quantity' => $request->quantity,
    'unit_cost' => $request->unit_price,
]);

        // Increase medicine stock
        $medicine = Medicine::find($request->medicine_id);

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