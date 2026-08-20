<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Medicine;
use App\Models\RetailProduct;
use App\Models\Batch;
use App\Services\SaleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    /**
     * Fetch sales queue for Cashier.
     */
    public function index(Request $request)
    {
        $query = Sale::with(['items.itemable', 'user']);

        // Branch scoping: pharmacists/cashiers see only their branch's sales
        $user = $request->user();

        if ($user->shouldScopeToBranch()) {
            $query->where('branch_id', $user->branch_id);
        }

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
     * When payment information is provided, the sale is completed immediately.
     * Otherwise it is sent to the cashier queue.
     */
    public function storePrescription(Request $request, SaleService $service)
    {
        abort_if(
            ! $request->user()->hasPermission('prescription-sales.dispense'),
            403,
            'Unauthorized. Only pharmacists can process prescription sales.'
        );

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.quantity' => 'required|integer|min:1',

            'payment_method' => 'nullable|string|in:' .
                implode(',', array_keys(Sale::paymentMethods())),

            'amount_paid' => 'nullable|numeric|min:0',

            // Prescription / patient information
            'customer_name' => 'required|string|max:255',

            'customer_phone' => [
                'required',
                'string',
                'max:50',
                'regex:/^(\+2519\d{8}|09\d{8})$/'
            ],

            'customer_email' => 'nullable|email|max:255',

            'customer_tin' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^\d+$/'
            ],

            'notes' => 'nullable|string',

            // Discount
            'discount_type' => 'nullable|in:percentage,fixed',
            'discount' => 'nullable|numeric|min:0',
        ], [
            'customer_phone.regex' =>
                'The phone number must be a valid Ethiopian number (09XXXXXXXX or +2519XXXXXXXX).',

            'customer_tin.regex' =>
                'The TIN number must contain digits only.',
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

                $unitPrice = $medicine->selling_price
                    ?? $medicine->unit_price
                    ?? 0;

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

            /*
             * Calculate discount.
             */
            $discountAmount = $this->calculateDiscount(
                $totalAmount,
                $validated['discount_type'] ?? null,
                $validated['discount'] ?? 0
            );

            $netAmount = max(
                0,
                $totalAmount - $discountAmount
            );

            /*
             * Payment information is optional.
             */
            $hasPaymentInfo =
                ! empty($validated['payment_method']) &&
                isset($validated['amount_paid']);

            $sale = Sale::create([
                'user_id' => $request->user()->id,

                'sale_date' => now(),

                'type' => 'prescription',

                'status' => $hasPaymentInfo
                    ? 'completed'
                    : 'pending_cashier',

                'total_amount' => $totalAmount,

                'net_amount' => $netAmount,

                'discount_type' =>
                    $validated['discount_type'] ?? null,

                'discount' => $discountAmount,

                'payment_method' =>
                    $validated['payment_method'] ?? 'cash',

                'amount_paid' =>
                    $validated['amount_paid'] ?? 0,

                'change_amount' => $hasPaymentInfo
                    ? $service->calculateChange(
                        $netAmount,
                        (float) $validated['amount_paid'],
                        $validated['payment_method']
                    )
                    : 0,

                'payment_status' =>
                    $hasPaymentInfo ? 'paid' : 'pending',

                'receipt_number' => $hasPaymentInfo
                    ? Sale::generateReceiptNumber()
                    : null,

                'customer_name' =>
                    $validated['customer_name'] ?? null,

                'customer_phone' =>
                    $validated['customer_phone'] ?? null,

                'customer_email' =>
                    $validated['customer_email'] ?? null,

                'customer_tin' =>
                    $validated['customer_tin'] ?? null,

                'notes' =>
                    $validated['notes'] ?? null,
            ]);

            foreach ($itemsToCreate as $itemData) {

                $sale->items()->create($itemData);

                /*
                 * Only deduct stock when payment was completed immediately.
                 */
                if ($hasPaymentInfo) {
                    $this->deductMedicineStock(
                        $itemData['itemable_id'],
                        $itemData['quantity']
                    );
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
     * Pharmacist dispatches a retail/OTC draft to cashier queue.
     */
    public function storeRetailDraft(
        Request $request,
        SaleService $service
    ) {
        abort_if(
            ! $request->user()->hasPermission('retail-otc-sales.draft'),
            403,
            'Unauthorized. Only pharmacists can dispatch retail drafts.'
        );

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:retail_products,id',
            'items.*.cartQty' => 'required|integer|min:1',

            'customer_name' => 'nullable|string|max:255',

            'customer_phone' => [
                'required',
                'string',
                'max:50',
                'regex:/^(\+2519\d{8}|09\d{8})$/'
            ],

            'customer_email' => 'nullable|email|max:255',

            'customer_tin' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^\d+$/'
            ],

            'notes' => 'nullable|string',

            'discount_type' => 'nullable|in:percentage,fixed',
            'discount' => 'nullable|numeric|min:0',
        ], [
            'customer_phone.regex' =>
                'The phone number must be a valid Ethiopian number (09XXXXXXXX or +2519XXXXXXXX).',

            'customer_tin.regex' =>
                'The TIN number must contain digits only.',
        ]);

        return DB::transaction(function () use ($validated, $request) {

            $totalAmount = 0;
            $itemsToCreate = [];

            foreach ($validated['items'] as $item) {

                $product = RetailProduct::findOrFail($item['id']);

                if ($product->quantity < $item['cartQty']) {
                    return response()->json([
                        'message' =>
                            "Insufficient stock for {$product->name}"
                    ], 422);
                }

                $unitPrice = $product->price;

                $subtotal =
                    $unitPrice * $item['cartQty'];

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

            $discountAmount = $this->calculateDiscount(
                $totalAmount,
                $validated['discount_type'] ?? null,
                $validated['discount'] ?? 0
            );

            $netAmount =
                max(0, $totalAmount - $discountAmount);

            $sale = Sale::create([
                'user_id' => $request->user()->id,

                'sale_date' => now(),

                'type' => 'retail',

                'status' => 'pending_cashier',

                'total_amount' => $totalAmount,

                'net_amount' => $netAmount,

                'discount_type' =>
                    $validated['discount_type'] ?? null,

                'discount' => $discountAmount,

                'payment_method' => 'cash',

                'amount_paid' => 0,

                'change_amount' => 0,

                'payment_status' => 'pending',

                'receipt_number' => null,

                'customer_name' =>
                    $validated['customer_name'] ?? null,

                'customer_phone' =>
                    $validated['customer_phone'] ?? null,

                'customer_email' =>
                    $validated['customer_email'] ?? null,

                'customer_tin' =>
                    $validated['customer_tin'] ?? null,

                'notes' =>
                    $validated['notes'] ?? null,
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
     * Unified POS dispatch.
     *
     * Supports:
     * - Medicine
     * - Retail/OTC products
     * - Mixed orders
     * - Customer information
     * - Discounts
     */
    public function storeDispatch(
        Request $request,
        SaleService $service
    ) {
        abort_if(
            ! in_array(
                $request->user()->role,
                ['pharmacist', 'cashier'],
                true
            ),
            403,
            'Unauthorized. Only pharmacists and cashiers can dispatch orders.'
        );

        $validated = $request->validate([
            'items' => 'required|array|min:1',

            'items.*.type' =>
                'required|in:medicine,retail',

            'items.*.id' =>
                'required|integer',

            'items.*.quantity' =>
                'required|integer|min:1',

            'customer_name' =>
                'nullable|string|max:255',

            'customer_phone' =>
                'nullable|string|max:50',

            'customer_email' =>
                'nullable|email|max:255',

            'customer_tin' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^\d+$/'
            ],

            'notes' =>
                'nullable|string',

            'discount_type' =>
                'nullable|in:percentage,fixed',

            'discount' =>
                'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $request) {

            $totalAmount = 0;

            $itemsToCreate = [];

            $hasMedicine = false;

            foreach ($validated['items'] as $item) {

                if ($item['type'] === 'medicine') {

                    $medicine =
                        Medicine::findOrFail($item['id']);

                    $hasMedicine = true;

                    if (
                        $medicine->quantity <
                        $item['quantity']
                    ) {
                        return response()->json([
                            'message' =>
                                "Insufficient stock for {$medicine->name}"
                        ], 422);
                    }

                    $unitPrice =
                        $medicine->selling_price
                        ?? $medicine->unit_price
                        ?? 0;

                    $subtotal =
                        $unitPrice * $item['quantity'];

                    $totalAmount += $subtotal;

                    $itemsToCreate[] = [
                        'medicine_id' =>
                            $medicine->id,

                        'itemable_id' =>
                            $medicine->id,

                        'itemable_type' =>
                            Medicine::class,

                        'quantity' =>
                            $item['quantity'],

                        'unit_price' =>
                            $unitPrice,

                        'subtotal' =>
                            $subtotal,
                    ];

                } else {

                    $product =
                        RetailProduct::findOrFail($item['id']);

                    if (
                        $product->quantity <
                        $item['quantity']
                    ) {
                        return response()->json([
                            'message' =>
                                "Insufficient stock for {$product->name}"
                        ], 422);
                    }

                    $unitPrice =
                        $product->price;

                    $subtotal =
                        $unitPrice * $item['quantity'];

                    $totalAmount += $subtotal;

                    $itemsToCreate[] = [
                        'medicine_id' => null,

                        'itemable_id' =>
                            $product->id,

                        'itemable_type' =>
                            RetailProduct::class,

                        'quantity' =>
                            $item['quantity'],

                        'unit_price' =>
                            $unitPrice,

                        'subtotal' =>
                            $subtotal,
                    ];
                }
            }

            $discountAmount =
                $this->calculateDiscount(
                    $totalAmount,
                    $validated['discount_type'] ?? null,
                    $validated['discount'] ?? 0
                );

            $netAmount =
                max(
                    0,
                    $totalAmount - $discountAmount
                );

            $sale = Sale::create([
                'user_id' =>
                    $request->user()->id,

                'sale_date' =>
                    now(),

                'type' =>
                    $hasMedicine
                        ? 'prescription'
                        : 'retail',

                'status' =>
                    'pending_cashier',

                'total_amount' =>
                    $totalAmount,

                'net_amount' =>
                    $netAmount,

                'discount_type' =>
                    $validated['discount_type'] ?? null,

                'discount' =>
                    $discountAmount,

                'payment_method' =>
                    'cash',

                'amount_paid' =>
                    0,

                'change_amount' =>
                    0,

                'payment_status' =>
                    'pending',

                'receipt_number' =>
                    null,

                'customer_name' =>
                    $validated['customer_name'] ?? null,

                'customer_phone' =>
                    $validated['customer_phone'] ?? null,

                'customer_email' =>
                    $validated['customer_email'] ?? null,

                'customer_tin' =>
                    $validated['customer_tin'] ?? null,

                'notes' =>
                    $validated['notes'] ?? null,
            ]);

            foreach ($itemsToCreate as $itemData) {
                $sale->items()->create($itemData);
            }

            return response()->json([
                'message' =>
                    'Order sent to Checkout',

                'sale' =>
                    $sale->load('items.itemable')
            ], 201);
        });
    }

    /**
     * Calculate discount amount.
     */
    private function calculateDiscount(
        float $subtotal,
        ?string $type,
        float $value
    ): float {

        if (
            $type === 'percentage' &&
            $value > 0
        ) {
            return round(
                $subtotal *
                (min(100, $value) / 100),
                2
            );
        }

        if (
            $type === 'fixed' &&
            $value > 0
        ) {
            return round(
                min($subtotal, $value),
                2
            );
        }

        return 0.0;
    }

    /**
     * Cashier completes a retail sale.
     */
    public function storeRetail(
        Request $request,
        SaleService $service
    ) {
        abort_if(
            ! $request->user()->hasRole('cashier'),
            403,
            'Unauthorized. Only cashiers can process retail sales.'
        );

        $validated = $request->validate([
            'items' => 'required|array|min:1',

            'items.*.id' =>
                'required|exists:retail_products,id',

            'items.*.cartQty' =>
                'required|integer|min:1',

            'payment_method' =>
                'required|string|in:' .
                implode(',', array_keys(Sale::paymentMethods())),

            'amount_paid' =>
                'required|numeric|min:0',

            'discount_type' =>
                'nullable|in:percentage,fixed',

            'discount' =>
                'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use (
            $validated,
            $request,
            $service
        ) {

            $totalAmount = 0;

            $itemsToCreate = [];

            foreach ($validated['items'] as $item) {

                $product =
                    RetailProduct::findOrFail($item['id']);

                if (
                    $product->quantity <
                    $item['cartQty']
                ) {
                    return response()->json([
                        'message' =>
                            "Insufficient stock for {$product->name}"
                    ], 422);
                }

                $unitPrice =
                    $product->price;

                $subtotal =
                    $unitPrice * $item['cartQty'];

                $totalAmount += $subtotal;

                $itemsToCreate[] = [
                    'medicine_id' => null,

                    'itemable_id' =>
                        $product->id,

                    'itemable_type' =>
                        RetailProduct::class,

                    'quantity' =>
                        $item['cartQty'],

                    'unit_price' =>
                        $unitPrice,

                    'subtotal' =>
                        $subtotal,
                ];
            }

            $discountAmount =
                $this->calculateDiscount(
                    $totalAmount,
                    $validated['discount_type'] ?? null,
                    $validated['discount'] ?? 0
                );

            $netAmount =
                max(
                    0,
                    $totalAmount - $discountAmount
                );

            $changeAmount =
                $service->calculateChange(
                    $netAmount,
                    (float) $validated['amount_paid'],
                    $validated['payment_method']
                );

            $sale = Sale::create([
                'user_id' =>
                    $request->user()->id,

                'sale_date' =>
                    now(),

                'type' =>
                    'retail',

                'status' =>
                    'completed',

                'total_amount' =>
                    $totalAmount,

                'net_amount' =>
                    $netAmount,

                'discount_type' =>
                    $validated['discount_type'] ?? null,

                'discount' =>
                    $discountAmount,

                'payment_method' =>
                    $validated['payment_method'],

                'amount_paid' =>
                    $validated['amount_paid'],

                'change_amount' =>
                    $changeAmount,

                'payment_status' =>
                    'paid',

                'receipt_number' =>
                    Sale::generateReceiptNumber(),
            ]);

            foreach ($itemsToCreate as $itemData) {

                $sale->items()->create($itemData);

                RetailProduct::whereKey(
                    $itemData['itemable_id']
                )->decrement(
                    'quantity',
                    $itemData['quantity']
                );
            }

            return response()->json([
                'message' =>
                    'Retail sale completed successfully',

                'sale' =>
                    $sale->load('items.itemable')
            ], 201);
        });
    }

    /**
     * Cashier completes a pending sale.
     */
    public function updateStatus(
        Request $request,
        $id,
        SaleService $service
    ) {
        abort_if(
            ! $request->user()->hasRole('cashier') &&
            ! $request->user()->hasRole('admin'),
            403,
            'Unauthorized. Only cashiers can update sale status.'
        );

        $sale =
            Sale::findOrFail($id);

        $validated = $request->validate([
            'status' =>
                'required|string|in:pending,pending_cashier,completed,cancelled',

            'payment_method' =>
                'required|string|in:' .
                implode(',', array_keys(Sale::paymentMethods())),

            'amount_paid' =>
                'required|numeric|min:0',

            'change_amount' =>
                'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use (
            $sale,
            $validated,
            $service,
            $request
        ) {

            $totalAmount =
                (float) (
                    $sale->net_amount
                    ?? $sale->total_amount
                );

            $amountPaid =
                (float) $validated['amount_paid'];

            $paymentMethod =
                $validated['payment_method'];

            if ($amountPaid < $totalAmount) {
                return response()->json([
                    'message' =>
                        'Amount paid cannot be less than the total amount'
                ], 422);
            }

            $changeAmount =
                $service->calculateChange(
                    $totalAmount,
                    $amountPaid,
                    $paymentMethod
                );

            $sale->update([
                'user_id' =>
                    $request->user()->id,

                'status' =>
                    $validated['status'],

                'payment_method' =>
                    $paymentMethod,

                'amount_paid' =>
                    $amountPaid,

                'change_amount' =>
                    $changeAmount,

                'payment_status' =>
                    $validated['status'] === 'completed'
                        ? 'paid'
                        : 'pending',

                'receipt_number' =>
                    $validated['status'] === 'completed'
                        ? (
                            $sale->receipt_number
                            ?? Sale::generateReceiptNumber()
                        )
                        : $sale->receipt_number,
            ]);

            /*
             * Deduct stock only when the sale becomes completed.
             */
            if (
                $validated['status'] === 'completed'
            ) {

                foreach ($sale->items as $item) {

                    if (
                        $item->itemable_type === Medicine::class
                    ) {

                        $this->deductMedicineStock(
                            $item->itemable_id,
                            $item->quantity
                        );

                    } elseif (
                        $item->itemable_type === RetailProduct::class
                    ) {

                        RetailProduct::whereKey(
                            $item->itemable_id
                        )->decrement(
                            'quantity',
                            $item->quantity
                        );
                    }
                }
            }

            return response()->json([
                'message' =>
                    'Sale status updated successfully',

                'sale' =>
                    $sale->load(
                        'items.itemable',
                        'user'
                    ),
            ]);
        });
    }

    /**
     * Deduct medicine stock using FEFO.
     *
     * First Expired, First Out.
     */
    private function deductMedicineStock(
        int $medicineId,
        int $quantity
    ): void {

        $batches = Batch::where(
                'medicine_id',
                $medicineId
            )
            ->where('quantity', '>', 0)
            ->orderBy('expiry_date', 'asc')
            ->orderBy('id', 'asc')
            ->lockForUpdate()
            ->get();

        $remaining = $quantity;

        if ($batches->isNotEmpty()) {

            foreach ($batches as $batch) {

                if ($remaining <= 0) {
                    break;
                }

                $deduct =
                    min(
                        $remaining,
                        $batch->quantity
                    );

                $batch->decrement(
                    'quantity',
                    $deduct
                );

                $remaining -= $deduct;
            }
        }

        /*
         * If there are not enough batch records,
         * deduct the remaining amount from medicine stock.
         */
        if ($remaining > 0) {

            Medicine::whereKey(
                $medicineId
            )->decrement(
                'quantity',
                $remaining
            );
        }
    }

    /**
     * Get receipt data.
     */
    public function receipt(Sale $sale)
    {
        $sale->load(
            'items.itemable',
            'user'
        );

        return response()->json($sale);
    }

    /**
     * Download receipt as PDF.
     */
    public function download(
        Sale $sale,
        SaleService $service
    ) {

        $pdfContent =
            $service->generatePdf($sale);

        $filename =
            'receipt-' .
            ($sale->receipt_number ?? $sale->id) .
            '.pdf';

        return response(
            $pdfContent,
            200
        )
            ->header(
                'Content-Type',
                'application/pdf'
            )
            ->header(
                'Content-Disposition',
                'inline; filename=' . $filename
            )
            ->header(
                'Content-Transfer-Encoding',
                'binary'
            );
    }

    /**
     * Print receipt.
     */
    public function print(Sale $sale)
    {
        $sale->load(
            'items.itemable',
            'user'
        );

        $cashierName =
            $sale->cashier_name;

        $html =
            view(
                'pdf.receipt',
                compact(
                    'sale',
                    'cashierName'
                )
            )->render();

        $html .=
            '<script>window.print();</script>';

        return response(
            $html,
            200
        )->header(
            'Content-Type',
            'text/html; charset=utf-8'
        );
    }

    /**
     * Get today's sales.
     */
    public function getTodaySales(
        Request $request
    ) {

        $query = Sale::with([
            'items.itemable',
            'user'
        ])->whereDate(
            'sale_date',
            today()
        );

        $user = $request->user();

        if ($user->shouldScopeToBranch()) {
            $query->where(
                'branch_id',
                $user->branch_id
            );
        }

        return response()->json(
            $query->latest()->get()
        );
    }

    /**
     * Get sales statistics.
     */
    public function getStats(
        Request $request
    ) {

        $baseQuery = Sale::query()
            ->where('status', 'completed')
            ->whereDate(
                'sale_date',
                today()
            );

        $user = $request->user();

        if ($user->shouldScopeToBranch()) {
            $baseQuery->where(
                'branch_id',
                $user->branch_id
            );
        }

        $todaySalesCount =
            (clone $baseQuery)->count();

        $todayRevenue =
            (float) (
                (clone $baseQuery)
                    ->sum(
                        DB::raw(
                            'COALESCE(net_amount, total_amount)'
                        )
                    )
            );

        $cashPayments =
            (float) (
                (clone $baseQuery)
                    ->where(
                        'payment_method',
                        Sale::PAYMENT_CASH
                    )
                    ->sum(
                        DB::raw(
                            'COALESCE(net_amount, total_amount)'
                        )
                    )
            );

        $telebirrPayments =
            (float) (
                (clone $baseQuery)
                    ->where(
                        'payment_method',
                        Sale::PAYMENT_TELEBIRR
                    )
                    ->sum(
                        DB::raw(
                            'COALESCE(net_amount, total_amount)'
                        )
                    )
            );

        $bankMethods =
            Sale::bankPaymentMethods();

        $bankPayments =
            (float) (
                (clone $baseQuery)
                    ->whereIn(
                        'payment_method',
                        $bankMethods
                    )
                    ->sum(
                        DB::raw(
                            'COALESCE(net_amount, total_amount)'
                        )
                    )
            );

        return response()->json([
            'today_sales_count' =>
                $todaySalesCount,

            'today_revenue' =>
                $todayRevenue,

            'cash_payments' =>
                $cashPayments,

            'telebirr_payments' =>
                $telebirrPayments,

            'bank_payments' =>
                $bankPayments,

            'total_transactions' =>
                $todaySalesCount,
        ]);
    }

    /**
     * Get sales history.
     */
    public function history(
        Request $request
    ) {

        $query =
            Sale::with([
                'items.itemable',
                'user'
            ]);

        $user = $request->user();

        if ($user->shouldScopeToBranch()) {
            $query->where(
                'branch_id',
                $user->branch_id
            );
        }

        if ($user->hasRole('cashier')) {
            $query->where(
                'user_id',
                $user->id
            );
        }

        if ($request->filled('search')) {

            $search =
                $request->input('search');

            $query->where(function ($q) use ($search) {

                $q->where(
                    'receipt_number',
                    'like',
                    "%{$search}%"
                )
                ->orWhere(
                    'customer_name',
                    'like',
                    "%{$search}%"
                )
                ->orWhere(
                    'id',
                    'like',
                    "%{$search}%"
                );
            });
        }

        if ($request->filled('date')) {

            $query->whereDate(
                'sale_date',
                $request->input('date')
            );
        }

        if ($request->filled('cashier')) {

            $query->where(
                'user_id',
                $request->input('cashier')
            );
        }

        if ($request->filled('payment_method')) {

            $query->where(
                'payment_method',
                $request->input('payment_method')
            );
        }

        if ($request->filled('status')) {

            $query->where(
                'status',
                $request->input('status')
            );
        }

        return response()->json(
            $query->latest()->paginate(10)
        );
    }

    /**
     * Export sales report.
     */
    public function export(
        Request $request,
        SaleService $service
    ) {

        $format =
            $request->input(
                'format',
                'csv'
            );

        $query =
            Sale::with([
                'items.itemable',
                'user'
            ]);

        $user = $request->user();

        if ($user->shouldScopeToBranch()) {

            $query->where(
                'branch_id',
                $user->branch_id
            );
        }

        if ($user->hasRole('cashier')) {

            $query->where(
                'user_id',
                $user->id
            );
        }

        if ($request->filled('date')) {

            $query->whereDate(
                'sale_date',
                $request->input('date')
            );
        }

        if ($request->filled('payment_method')) {

            $query->where(
                'payment_method',
                $request->input('payment_method')
            );
        }

        $sales =
            $query->latest()->get();

        if ($format === 'csv') {

            $headers = [
                'Content-Type' =>
                    'text/csv; charset=utf-8',

                'Content-Disposition' =>
                    'attachment; filename=sales-report.csv',
            ];

            $callback =
                function () use ($sales) {

                    $file =
                        fopen(
                            'php://output',
                            'w'
                        );

                    fputcsv(
                        $file,
                        [
                            'Receipt Number',
                            'Date',
                            'Cashier',
                            'Customer',
                            'Payment Method',
                            'Total Amount',
                            'Net Amount',
                            'Discount',
                            'Status'
                        ]
                    );

                    foreach ($sales as $sale) {

                        fputcsv(
                            $file,
                            [
                                $sale->receipt_number ?? 'N/A',

                                $sale->sale_date
                                    ? \Carbon\Carbon::parse(
                                        $sale->sale_date
                                    )->format(
                                        'Y-m-d H:i'
                                    )
                                    : 'N/A',

                                $sale->cashier_name,

                                $sale->customer_name
                                    ?? 'Walk-in Customer',

                                $sale->payment_method_label,

                                number_format(
                                    $sale->total_amount,
                                    2
                                ),

                                number_format(
                                    $sale->net_amount
                                        ?? $sale->total_amount,
                                    2
                                ),

                                number_format(
                                    $sale->discount ?? 0,
                                    2
                                ),

                                $sale->status_label,
                            ]
                        );
                    }

                    fclose($file);
                };

            return response()->stream(
                $callback,
                200,
                $headers
            );
        }

        /*
         * PDF export.
         */
        $html =
            view(
                'pdf.report',
                compact('sales')
            )->render();

        $pdfContent =
            \Barryvdh\DomPDF\Facade\Pdf::loadHTML(
                $html
            )
            ->setPaper(
                'a4',
                'landscape'
            )
            ->output();

        return response(
            $pdfContent,
            200
        )
            ->header(
                'Content-Type',
                'application/pdf'
            )
            ->header(
                'Content-Disposition',
                'inline; filename=sales-report.pdf'
            );
    }
}