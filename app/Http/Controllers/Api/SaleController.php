<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Medicine;
use App\Models\RetailProduct;
use App\Models\SaleItem;
use App\Services\SaleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;

class SaleController extends Controller
{
    /**
     * Fetch sales queue for Cashier.
     */
    public function index(Request $request)
    {
        $query = Sale::with(['items.itemable', 'user']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Pharmacist dispatches prescription sale.
     *
     * When payment_method and amount_paid are provided, the sale is
     * completed immediately (stock deducted, receipt generated, payment
     * information saved).  When they are omitted the sale is created
     * in the pending_cashier state so the cashier can collect payment
     * later via the CashierDashboard.
     *
     * @policy Only pharmacists may dispatch prescription sales.
     */
    public function storePrescription(Request $request, SaleService $service)
    {
        abort_if(! $request->user()->hasRole('pharmacist'), 403, 'Unauthorized. Only pharmacists can process prescription sales.');

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'nullable|string|in:' . implode(',', array_keys(Sale::paymentMethods())),
            'amount_paid' => 'nullable|numeric|min:0',
            // Prescription / patient information
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'customer_email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request, $service) {
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

            $hasPaymentInfo = !empty($validated['payment_method']) && !empty($validated['amount_paid']);

            $sale = Sale::create([
                'user_id' => $request->user()->id,
                'sale_date' => now(),
                'type' => 'prescription',
                'status' => $hasPaymentInfo ? 'completed' : 'pending_cashier',
                'total_amount' => $totalAmount,
                'net_amount' => $totalAmount,
                'payment_method' => $validated['payment_method'] ?? 'cash',
                'amount_paid' => $validated['amount_paid'] ?? 0,
                'change_amount' => $hasPaymentInfo
                    ? $service->calculateChange($totalAmount, (float) $validated['amount_paid'], $validated['payment_method'])
                    : 0,
                'payment_status' => $hasPaymentInfo ? 'paid' : 'pending',
                'receipt_number' => $hasPaymentInfo ? Sale::generateReceiptNumber() : null,
                'customer_name' => $validated['customer_name'] ?? null,
                'customer_phone' => $validated['customer_phone'] ?? null,
                'customer_email' => $validated['customer_email'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($itemsToCreate as $itemData) {
                $sale->items()->create($itemData);
                if ($hasPaymentInfo) {
                    Medicine::whereKey($itemData['itemable_id'])->decrement('quantity', $itemData['quantity']);
                }
            }

            return response()->json([
                'message' => $hasPaymentInfo
                    ? 'Prescription sale completed successfully'
                    : 'Order sent to Cashier',
                'sale' => $sale->load('items.itemable')
            ], 201);
        });
    }

    /**
     * Pharmacist dispatches a retail/OTC draft to the cashier queue.
     *
     * Creates a pending_cashier sale without payment info or stock deduction.
     * The cashier will complete payment and deduct stock later via updateStatus.
     *
     * @policy Only pharmacists may dispatch retail drafts.
     */
    public function storeRetailDraft(Request $request, SaleService $service)
    {
        abort_if(! $request->user()->hasRole('pharmacist'), 403, 'Unauthorized. Only pharmacists can dispatch retail drafts.');

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:retail_products,id',
            'items.*.cartQty' => 'required|integer|min:1',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'customer_email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request, $service) {
            $totalAmount = 0;
            $itemsToCreate = [];

            foreach ($validated['items'] as $item) {
                $product = RetailProduct::findOrFail($item['id']);

                if ($product->quantity < $item['cartQty']) {
                    return response()->json([
                        'message' => "Insufficient stock for {$product->name}"
                    ], 422);
                }

                $unitPrice = $product->price;
                $subtotal = $unitPrice * $item['cartQty'];
                $totalAmount += $subtotal;

                $itemsToCreate[] = [
                    'medicine_id' => null,
                    'itemable_id' => $product->id,
                    'itemable_type' => RetailProduct::class,
                    'quantity' => $item['cartQty'],
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ];
            }

            $sale = Sale::create([
                'user_id' => $request->user()->id,
                'sale_date' => now(),
                'type' => 'retail',
                'status' => 'pending_cashier',
                'total_amount' => $totalAmount,
                'net_amount' => $totalAmount,
                'payment_method' => 'cash',
                'amount_paid' => 0,
                'change_amount' => 0,
                'payment_status' => 'pending',
                'receipt_number' => null,
                'customer_name' => $validated['customer_name'] ?? null,
                'customer_phone' => $validated['customer_phone'] ?? null,
                'customer_email' => $validated['customer_email'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($itemsToCreate as $itemData) {
                $sale->items()->create($itemData);
            }

            return response()->json([
                'message' => 'Retail order sent to Cashier',
                'sale' => $sale->load('items.itemable')
            ], 201);
        });
    }

    /**
     * Cashier completes a retail sale from the retail catalogue.
     *
     * Receives payment_method and amount_paid, calculates change_amount
     * automatically, generates a receipt_number, and saves all
     * payment information to the database.
     *
     * @policy Only cashiers may process retail sales.
     */
    public function storeRetail(Request $request, SaleService $service)
    {
        abort_if(! $request->user()->hasRole('cashier'), 403, 'Unauthorized. Only cashiers can process retail sales.');

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:retail_products,id',
            'items.*.cartQty' => 'required|integer|min:1',
            'payment_method' => 'required|string|in:' . implode(',', array_keys(Sale::paymentMethods())),
            'amount_paid' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $request, $service) {
            $totalAmount = 0;
            $itemsToCreate = [];

            foreach ($validated['items'] as $item) {
                $product = RetailProduct::findOrFail($item['id']);

                if ($product->quantity < $item['cartQty']) {
                    return response()->json([
                        'message' => "Insufficient stock for {$product->name}"
                    ], 422);
                }

                $unitPrice = $product->price;
                $subtotal = $unitPrice * $item['cartQty'];
                $totalAmount += $subtotal;

                $itemsToCreate[] = [
                    'medicine_id' => null,
                    'itemable_id' => $product->id,
                    'itemable_type' => RetailProduct::class,
                    'quantity' => $item['cartQty'],
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ];
            }

            $changeAmount = $service->calculateChange($totalAmount, (float) $validated['amount_paid'], $validated['payment_method']);

            $sale = Sale::create([
                'user_id' => $request->user()->id,
                'sale_date' => now(),
                'type' => 'retail',
                'status' => 'completed',
                'total_amount' => $totalAmount,
                'net_amount' => $totalAmount,
                'payment_method' => $validated['payment_method'],
                'amount_paid' => $validated['amount_paid'],
                'change_amount' => $changeAmount,
                'payment_status' => 'paid',
                'receipt_number' => Sale::generateReceiptNumber(),
            ]);

            foreach ($itemsToCreate as $itemData) {
                $sale->items()->create($itemData);
                RetailProduct::whereKey($itemData['itemable_id'])->decrement('quantity', $itemData['quantity']);
            }

            return response()->json([
                'message' => 'Retail sale completed successfully',
                'sale' => $sale->load('items.itemable')
            ], 201);
        });
    }

    /**
     * Cashier completes a pending prescription sale by collecting payment.
     *
     * Updates the sale status to completed, saves payment information,
     * generates a receipt number, and deducts stock.
     *
     * @policy Only cashiers may update sale status.
     */
    public function updateStatus(Request $request, $id, SaleService $service)
    {
        abort_if(! $request->user()->hasRole('cashier'), 403, 'Unauthorized. Only cashiers can update sale status.');

        $sale = Sale::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:pending,pending_cashier,completed,cancelled',
            'payment_method' => 'required|string|in:' . implode(',', array_keys(Sale::paymentMethods())),
            'amount_paid' => 'required|numeric|min:0',
            'change_amount' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($sale, $validated, $service) {
            $totalAmount = (float) $sale->total_amount;
            $amountPaid = (float) $validated['amount_paid'];
            $paymentMethod = $validated['payment_method'];

            if ($amountPaid < $totalAmount) {
                return response()->json([
                    'message' => 'Amount paid cannot be less than the total amount'
                ], 422);
            }

            $changeAmount = $service->calculateChange($totalAmount, $amountPaid, $paymentMethod);

            $sale->update([
                'user_id' => $request->user()->id,
                'status' => $validated['status'],
                'payment_method' => $paymentMethod,
                'amount_paid' => $amountPaid,
                'change_amount' => $changeAmount,
                'payment_status' => 'paid',
                'receipt_number' => $sale->receipt_number ?? Sale::generateReceiptNumber(),
            ]);

            // Deduct stock if transitioning to completed and not already deducted
            if ($validated['status'] === 'completed') {
                foreach ($sale->items as $item) {
                    if ($item->itemable_type === Medicine::class) {
                        Medicine::whereKey($item->itemable_id)->decrement('quantity', $item->quantity);
                    } elseif ($item->itemable_type === RetailProduct::class) {
                        RetailProduct::whereKey($item->itemable_id)->decrement('quantity', $item->quantity);
                    }
                }
            }

            return response()->json([
                'message' => 'Sale status updated successfully',
                'sale' => $sale->load('items.itemable', 'user'),
            ]);
        });
    }

    /**
     * Get receipt data for a sale (JSON for the React receipt page).
     */
    public function receipt(Sale $sale)
    {
        $sale->load('items.itemable', 'user');

        return response()->json($sale);
    }

    /**
     * Download receipt as PDF.
     */
    public function download(Sale $sale, SaleService $service)
    {
        $pdfContent = $service->generatePdf($sale);

        $filename = 'receipt-' . ($sale->receipt_number ?? $sale->id) . '.pdf';

        return response($pdfContent, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; ' . $filename)
            ->header('Content-Transfer-Encoding', 'binary');
    }

    /**
     * Print receipt (HTML page that triggers browser print dialog).
     */
    public function print(Sale $sale)
    {
        $sale->load('items.itemable', 'user');

        $cashierName = $sale->cashier_name;

        $html = view('pdf.receipt', compact('sale', 'cashierName'))->render();

        $html .= '<script>window.print();</script>';

        return response($html, 200)
            ->header('Content-Type', 'text/html; charset=utf-8');
    }

    /**
     * Get today's sales.
     */
    public function getTodaySales(Request $request)
    {
        $sales = Sale::with(['items.itemable', 'user'])
            ->whereDate('sale_date', today())
            ->latest()
            ->get();

        return response()->json($sales);
    }

    /**
     * Get sales statistics for the dashboard.
     */
    public function getStats(Request $request)
    {
        $todaySales = Sale::whereDate('sale_date', today())
            ->where('status', 'completed')
            ->get();

        $todaySalesCount = $todaySales->count();
        $todayRevenue = (float) $todaySales->sum('total_amount');

        $cashPayments = (float) Sale::where('payment_method', Sale::PAYMENT_CASH)
            ->where('status', 'completed')
            ->whereDate('sale_date', today())
            ->sum('total_amount');

        $telebirrPayments = (float) Sale::where('payment_method', Sale::PAYMENT_TELEBIRR)
            ->where('status', 'completed')
            ->whereDate('sale_date', today())
            ->sum('total_amount');

        $bankMethods = Sale::bankPaymentMethods();
        $bankPayments = (float) Sale::whereIn('payment_method', $bankMethods)
            ->where('status', 'completed')
            ->whereDate('sale_date', today())
            ->sum('total_amount');

        $totalTransactions = Sale::where('status', 'completed')
            ->whereDate('sale_date', today())
            ->count();

        return response()->json([
            'today_sales_count' => $todaySalesCount,
            'today_revenue' => $todayRevenue,
            'cash_payments' => $cashPayments,
            'telebirr_payments' => $telebirrPayments,
            'bank_payments' => $bankPayments,
            'total_transactions' => $totalTransactions,
        ]);
    }

    /**
     * Get sales history (paginated, with filters).
     */
    public function history(Request $request)
    {
        $query = Sale::with(['items.itemable', 'user']);

        if ($request->user()->hasRole('cashier')) {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('sale_date', $request->input('date'));
        }

        if ($request->filled('cashier')) {
            $query->where('user_id', $request->input('cashier'));
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->input('payment_method'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $sales = $query->latest()->paginate(10);

        return response()->json($sales);
    }

    /**
     * Export sales report (CSV or PDF).
     */
    public function export(Request $request, SaleService $service)
    {
        $type = $request->input('type', 'sales');
        $format = $request->input('format', 'csv');

        $query = Sale::with(['items.itemable', 'user']);

        if ($request->user()->hasRole('cashier')) {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->filled('date')) {
            $query->whereDate('sale_date', $request->input('date'));
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->input('payment_method'));
        }

        $sales = $query->latest()->get();

        if ($format === 'csv') {
            $headers = [
                'Content-Type' => 'text/csv; charset=utf-8',
                'Content-Disposition' => 'attachment; filename=sales-report.csv',
            ];

            $callback = function () use ($sales) {
                $file = fopen('php://output', 'w');
                fputcsv($file, ['Receipt Number', 'Date', 'Cashier', 'Customer', 'Payment Method', 'Total Amount', 'Status']);

                foreach ($sales as $sale) {
                    fputcsv($file, [
                        $sale->receipt_number ?? 'N/A',
                        $sale->sale_date ? \Carbon\Carbon::parse($sale->sale_date)->format('Y-m-d H:i') : 'N/A',
                        $sale->cashier_name,
                        $sale->customer_name ?? 'Walk-in Customer',
                        $sale->payment_method_label,
                        number_format($sale->total_amount, 2),
                        $sale->status_label,
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        // PDF export
        $html = view('pdf.report', compact('sales'))->render();
        $pdfContent = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->setPaper('a4', 'landscape')->output();

        $filename = 'sales-report.pdf';

        return response($pdfContent, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename=' . $filename);
    }
}
