<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Medicine;
use App\Models\RetailProduct;
use App\Services\SaleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    /**
     * Fetch sales queue for Cashier / Admin.
     */
    public function index(Request $request)
    {
        $query = Sale::with(['items.itemable', 'user']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Pharmacist dispatches prescription sale.
     */
    public function storePrescription(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $totalAmount = 0;
            $itemsToCreate = [];

            foreach ($validated['items'] as $item) {
                $medicine = Medicine::findOrFail($item['medicine_id']);

                if ($medicine->quantity < $item['quantity']) {
                    return response()->json([
                        'message' => "Insufficient stock for {$medicine->name}"
                    ], 422);
                }

                $unitPrice = $medicine->selling_price ?? $medicine->unit_price ?? 0;
                $subtotal = $unitPrice * $item['quantity'];
                $totalAmount += $subtotal;

                $itemsToCreate[] = [
                    'medicine_id' => $medicine->id,
                    'itemable_id' => $medicine->id,
                    'itemable_type' => Medicine::class,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ];
            }

            $sale = Sale::create([
                'user_id' => $request->user()->id,
                'sale_date' => now(),
                'type' => 'prescription',
                'status' => 'pending_cashier',
                'total_amount' => $totalAmount,
            ]);

            foreach ($itemsToCreate as $itemData) {
                $sale->items()->create($itemData);
            }

            return response()->json([
                'message' => 'Order sent to Cashier',
                'sale' => $sale->load('items.itemable')
            ], 201);
        });
    }

    /**
     * Cashier completes a retail sale from the retail catalogue.
     */
    public function storeRetail(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer|exists:retail_products,id',
            'items.*.cartQty' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $totalAmount = 0;
            $itemsToCreate = [];

            foreach ($validated['items'] as $item) {
                $product = RetailProduct::findOrFail($item['id']);

                if ($product->quantity < $item['cartQty']) {
                    return response()->json([
                        'message' => "Insufficient stock for {$product->name}"
                    ], 422);
                }

                $subtotal = $product->price * $item['cartQty'];
                $totalAmount += $subtotal;

                $itemsToCreate[] = [
                    'medicine_id' => $product->id,
                    'itemable_id' => $product->id,
                    'itemable_type' => RetailProduct::class,
                    'quantity' => $item['cartQty'],
                    'unit_price' => $product->price,
                    'subtotal' => $subtotal,
                ];
            }

            $sale = Sale::create([
                'user_id' => $request->user()->id,
                'sale_date' => now(),
                'type' => 'retail',
                'status' => 'completed',
                'total_amount' => $totalAmount,
                'net_amount' => $totalAmount,
            ]);

            foreach ($itemsToCreate as $itemData) {
                $sale->items()->create($itemData);
                RetailProduct::whereKey($itemData['itemable_id'])->decrement('quantity', $itemData['quantity']);
            }

            return response()->json([
                'message' => 'Retail sale processed successfully',
                'sale' => $sale->load('items.itemable')
            ], 201);
        });
    }

    /**
     * Cashier completes a sale.
     *
     * Receives payment_method and amount_paid, calculates change_amount
     * automatically, generates a receipt_number, and saves all
     * payment information to the database.
     */
    public function updateStatus(Request $request, $id, SaleService $service)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:completed,cancelled',
            'payment_method' => 'required_if:status,completed|string|in:' . implode(',', array_keys(Sale::paymentMethods())),
            'amount_paid' => 'required_if:status,completed|numeric|min:0',
        ]);

        $sale = Sale::with('items')->findOrFail($id);

        if ($sale->status === 'completed') {
            return response()->json(['message' => 'Sale already completed'], 400);
        }

        DB::transaction(function () use ($sale, $validated, $service) {
            if ($validated['status'] === 'completed') {
                // Deduct stock for items when payment is confirmed
                foreach ($sale->items as $item) {
                    if ($item->itemable) {
                        $item->itemable->decrement('quantity', $item->quantity);
                    }
                }

                // Generate receipt number automatically
                if (!$sale->receipt_number) {
                    $sale->receipt_number = Sale::generateReceiptNumber();
                }

                // Set payment details
                $sale->payment_method = $validated['payment_method'];
                $sale->amount_paid = $validated['amount_paid'];

                // Calculate change amount based on payment method
                $sale->change_amount = $service->calculateChange(
                    (float) $sale->total_amount,
                    (float) $validated['amount_paid'],
                    $validated['payment_method']
                );

                $sale->payment_status = 'paid';
            }

            $sale->status = $validated['status'];
            $sale->save();
        });

        return response()->json([
            'message' => 'Sale status updated to ' . $validated['status'],
            'sale' => $sale->fresh()->load('items.itemable', 'user')
        ]);
    }

    /**
     * Get today's sales summary.
     */
    public function getTodaySales()
    {
        $todaySales = Sale::whereDate('sale_date', today())
            ->where('status', 'completed')
            ->with('items.itemable')
            ->get();

        return response()->json([
            'sales' => $todaySales,
            'total' => $todaySales->sum('total_amount'),
            'count' => $todaySales->count(),
        ]);
    }

    /**
     * Get sales statistics for dashboard.
     */
    public function getStats()
    {
        $today = today();

        $stats = [
            'today_sales_count' => Sale::whereDate('sale_date', $today)
                ->where('status', 'completed')
                ->count(),
            'today_revenue' => (float) Sale::whereDate('sale_date', $today)
                ->where('status', 'completed')
                ->sum('total_amount'),
            'cash_payments' => (float) Sale::whereDate('sale_date', $today)
                ->where('status', 'completed')
                ->where('payment_method', Sale::PAYMENT_CASH)
                ->sum('total_amount'),
            'telebirr_payments' => (float) Sale::whereDate('sale_date', $today)
                ->where('status', 'completed')
                ->where('payment_method', Sale::PAYMENT_TELEBIRR)
                ->sum('total_amount'),
            'bank_payments' => (float) Sale::whereDate('sale_date', $today)
                ->where('status', 'completed')
                ->whereIn('payment_method', Sale::bankPaymentMethods())
                ->sum('total_amount'),
            'total_transactions' => Sale::where('status', 'completed')->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get a sale for receipt display.
     */
    public function receipt(Sale $sale)
    {
        return response()->json($sale->load('items.itemable', 'user'));
    }

    /**
     * Download the receipt as a PDF file.
     */
    public function download(Sale $sale, SaleService $service)
    {
        $pdfContent = $service->generatePdf($sale);

        $filename = 'receipt-' . $sale->receipt_number . '.pdf';

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Print the receipt (print-friendly HTML).
     */
    public function print(Sale $sale)
    {
        $sale->load('items.itemable', 'user');
        $cashierName = $sale->cashier_name;

        $html = view('pdf.receipt', compact('sale', 'cashierName'))->render();

        return response($html, 200)
            ->header('Content-Type', 'text/html');
    }

    /**
     * Admin: Get all completed sales for history page.
     */
    public function history(Request $request)
    {
        $query = Sale::with(['items.itemable', 'user'])
            ->where('status', 'completed');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        // Filter by date
        if ($request->filled('date')) {
            $query->whereDate('sale_date', $request->date);
        }

        // Filter by cashier
        if ($request->filled('cashier')) {
            $query->where('user_id', $request->cashier);
        }

        // Filter by payment method
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sales = $query->latest()->paginate(15);

        return response()->json($sales);
    }

    /**
     * Export sales report in PDF or CSV format.
     */
    public function export(Request $request, SaleService $service)
    {
        $request->validate([
            'type' => 'required|in:sales,daily,monthly,payment_method',
            'format' => 'required|in:pdf,csv',
            'date' => 'nullable|date',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'payment_method' => 'nullable|string',
        ]);

        $query = Sale::with(['items.itemable', 'user'])
            ->where('status', 'completed');

        // Apply date filters based on report type
        if ($request->type === 'daily' && $request->filled('date')) {
            $query->whereDate('sale_date', $request->date);
        } elseif ($request->type === 'monthly') {
            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('sale_date', [$request->start_date, $request->end_date]);
            } else {
                $query->whereMonth('sale_date', now()->month)
                    ->whereYear('sale_date', now()->year);
            }
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $sales = $query->latest()->get();

        if ($request->format === 'pdf') {
            $html = view('pdf.report', compact('sales', 'request'))->render();
            $pdfContent = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->setPaper('a4', 'landscape')->output();

            $filename = 'sales-report-' . now()->format('Ymd-His') . '.pdf';

            return response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]);
        }

        // CSV export
        $filename = 'sales-report-' . now()->format('Ymd-His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($sales) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Receipt Number', 'Sale Number', 'Date', 'Cashier', 'Customer', 'Payment Method', 'Total', 'Status']);

            foreach ($sales as $sale) {
                fputcsv($file, [
                    $sale->receipt_number ?? '',
                    $sale->id,
                    $sale->sale_date ? \Carbon\Carbon::parse($sale->sale_date)->format('Y-m-d H:i') : '',
                    $sale->cashier_name,
                    $sale->customer_name ?? 'Walk-in Customer',
                    $sale->payment_method_label,
                    $sale->total_amount,
                    $sale->status_label,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
