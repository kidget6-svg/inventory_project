<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Medicine;
use App\Models\RetailProduct;
use App\Models\Supplier;
use App\Services\PurchaseOrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PurchaseOrderController extends Controller
{
    public function index()
    {
        $orders = PurchaseOrder::with('supplier')->latest()->paginate(5);
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'manufacturing_company' => 'nullable|string|max:255',
            // Multi-item format (preferred)
            'items' => 'nullable|array|min:1',
            'items.*.medicine_id' => 'nullable|exists:medicines,id',
            'items.*.retail_product_id' => 'nullable|exists:retail_products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            // Legacy single-item format (backward compat)
            'medicine_name' => 'nullable|string|max:255',
            'medicine_id' => 'nullable|exists:medicines,id',
            'retail_product_id' => 'nullable|exists:retail_products,id',
            'quantity' => 'nullable|integer|min:1',
            'unit_price' => 'nullable|numeric|min:0',
        ]);

        // Build items array from either format
        $items = $this->buildItemsArray($validated);

        if (empty($items)) {
            throw ValidationException::withMessages([
                'items' => 'At least one medicine or retail product is required.',
            ]);
        }

        DB::beginTransaction();

        try {
            $totalAmount = 0;
            $poItems = [];

            foreach ($items as $item) {
                $product = $this->resolveProduct($item);
                $unitPrice = $item['unit_price'] ?? 0;
                $subtotal = $item['quantity'] * $unitPrice;
                $totalAmount += $subtotal;

                $poItems[] = [
                    'medicine_id' => $product instanceof Medicine ? $product->id : null,
                    'itemable_type' => get_class($product),
                    'itemable_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ];
            }

            $order = PurchaseOrder::create([
                'supplier_id' => $validated['supplier_id'],
                'manufacturing_company' => $validated['manufacturing_company'] ?? null,
                'order_date' => now()->toDateString(),
                'status' => 'draft',
                'total_amount' => $totalAmount,
            ]);

            foreach ($poItems as $poItem) {
                $poItem['purchase_order_id'] = $order->id;
                PurchaseOrderItem::create($poItem);
            }

            DB::commit();

            return response()->json($order->load('supplier', 'items.medicine', 'items.itemable'), 201);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error creating order: ' . $e->getMessage()], 500);
        }
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        return response()->json($purchaseOrder->load('supplier', 'items.medicine', 'items.itemable'));
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        // Only allow editing when status is draft, pending, or approved
        if (! $purchaseOrder->canEdit()) {
            return response()->json([
                'message' => 'Cannot edit order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'manufacturing_company' => 'nullable|string|max:255',
            'items' => 'nullable|array|min:1',
            'items.*.medicine_id' => 'nullable|exists:medicines,id',
            'items.*.retail_product_id' => 'nullable|exists:retail_products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            // Legacy single-item (backward compat)
            'medicine_name' => 'nullable|string|max:255',
            'medicine_id' => 'nullable|exists:medicines,id',
            'retail_product_id' => 'nullable|exists:retail_products,id',
            'quantity' => 'nullable|integer|min:1',
            'unit_price' => 'nullable|numeric|min:0',
        ]);

        $items = $this->buildItemsArray($validated);

        if (empty($items)) {
            throw ValidationException::withMessages([
                'items' => 'At least one medicine or retail product is required.',
            ]);
        }

        DB::beginTransaction();

        try {
            $totalAmount = 0;
            $newItems = [];

            foreach ($items as $item) {
                $product = $this->resolveProduct($item);
                $unitPrice = $item['unit_price'] ?? 0;
                $subtotal = $item['quantity'] * $unitPrice;
                $totalAmount += $subtotal;

                $newItems[] = [
                    'medicine_id' => $product instanceof Medicine ? $product->id : null,
                    'itemable_type' => get_class($product),
                    'itemable_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ];
            }

            $purchaseOrder->update([
                'supplier_id' => $validated['supplier_id'],
                'manufacturing_company' => $validated['manufacturing_company'] ?? null,
                'total_amount' => $totalAmount,
            ]);

            // Delete old items and recreate
            $purchaseOrder->items()->delete();
            foreach ($newItems as $ni) {
                $ni['purchase_order_id'] = $purchaseOrder->id;
                PurchaseOrderItem::create($ni);
            }

            DB::commit();

            return response()->json($purchaseOrder->load('supplier', 'items.medicine', 'items.itemable'));
        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error updating order: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Build a normalized items array from either multi-item or legacy single-item format.
     */
    private function buildItemsArray(array $validated): array
    {
        // Multi-item format
        if (!empty($validated['items'])) {
            return $validated['items'];
        }

        // Legacy single-item format
        $items = [];
        if (!empty($validated['medicine_id']) || !empty($validated['medicine_name']) || !empty($validated['retail_product_id'])) {
            $items[] = [
                'medicine_id' => $validated['medicine_id'] ?? null,
                'medicine_name' => $validated['medicine_name'] ?? null,
                'retail_product_id' => $validated['retail_product_id'] ?? null,
                'quantity' => $validated['quantity'] ?? 1,
                'unit_price' => $validated['unit_price'] ?? 0,
            ];
        }

        return $items;
    }

    /**
     * Resolve a Medicine or RetailProduct model from an item array.
     */
    private function resolveProduct(array $item): Medicine|RetailProduct
    {
        if (!empty($item['retail_product_id'])) {
            return RetailProduct::findOrFail($item['retail_product_id']);
        }

        if (!empty($item['medicine_id'])) {
            return Medicine::findOrFail($item['medicine_id']);
        }

        // Legacy: create medicine by name if needed
        if (!empty($item['medicine_name'])) {
            $medName = trim($item['medicine_name']);
            $medicine = Medicine::where('name', $medName)->first();
            if (!$medicine) {
                $defaultCategory = \App\Models\Category::first();
                $medicine = Medicine::create([
                    'name' => $medName,
                    'category_id' => $defaultCategory ? $defaultCategory->id : 1,
                    'quantity' => 0,
                    'unit_price' => 0,
                    'selling_price' => 0,
                    'status' => 'active',
                ]);
            }
            return $medicine;
        }

        throw ValidationException::withMessages([
            'items' => 'Each item must have a medicine_id or retail_product_id.',
        ]);
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        // Only allow deletion when status is draft
        if (! $purchaseOrder->canDelete()) {
            return response()->json([
                'message' => 'Cannot delete order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        DB::beginTransaction();

        try {
            // No stock to reverse since stock is only added on completion
            $purchaseOrder->delete();

            DB::commit();

            return response()->json(['message' => 'Purchase order deleted']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error deleting order: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Submit a purchase order (draft -> pending).
     */
    public function submit(PurchaseOrder $purchaseOrder)
    {
        if (! $purchaseOrder->canSubmit()) {
            return response()->json([
                'message' => 'Cannot submit order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        $purchaseOrder->submit();

        return response()->json($purchaseOrder->fresh()->load('supplier', 'items.medicine', 'items.itemable'));
    }

    /**
     * Preview the Purchase Order PDF.
     * Generates the PDF from database data and returns it as base64
     * so the admin can review it in a modal before emailing the supplier.
     *
     * PDF generation is available for ALL statuses (not just pending)
     * so the PDF remains accessible throughout the entire lifecycle.
     */
    public function preview(PurchaseOrder $purchaseOrder, PurchaseOrderService $service)
    {
        if (! $purchaseOrder->canGeneratePdf()) {
            return response()->json([
                'message' => 'Cannot generate PDF for order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        $pdfContent = $service->generatePdf($purchaseOrder);

        return response()->json([
            'pdf' => base64_encode($pdfContent),
            'purchase_order' => $purchaseOrder->load('supplier', 'items.medicine', 'items.itemable'),
        ]);
    }

    /**
     * Download the Purchase Order PDF as a file attachment.
     * Available for all statuses except draft.
     */
    public function download(PurchaseOrder $purchaseOrder, PurchaseOrderService $service)
    {
        if (! $purchaseOrder->canDownloadPdf()) {
            return response()->json([
                'message' => 'Cannot download PDF for order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        $pdfContent = $service->generatePdf($purchaseOrder);

        $filename = 'purchase-order-' . $purchaseOrder->id . '.pdf';

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Send a purchase order to the supplier (pending -> sent).
     * Generates a PDF, emails it to the supplier, and records the sent timestamp.
     * The email is sent synchronously so the status only changes after
     * the supplier has actually received the email.
     */
    public function send(PurchaseOrder $purchaseOrder, PurchaseOrderService $service)
    {
        if (! $purchaseOrder->canSend()) {
            return response()->json([
                'message' => 'Cannot send order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        if (! $purchaseOrder->supplier || ! $purchaseOrder->supplier->email) {
            return response()->json([
                'message' => 'Supplier does not have an email address'
            ], 422);
        }

        try {
            $service->sendToSupplier($purchaseOrder);

            $purchaseOrder->send();

            return response()->json([
                'message' => 'Purchase Order emailed successfully.',
                'purchase_order' => $purchaseOrder->fresh()->load('supplier', 'items.medicine', 'items.itemable'),
            ]);
        } catch (\Exception $e) {
            report($e);

            return response()->json([
                'message' => 'Error sending purchase order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Re-send a purchase order to the supplier (sent/approved/completed only).
     * Re-generates the PDF and re-emails it without changing the status.
     * This allows supplier communication after the initial send.
     */
    public function resend(PurchaseOrder $purchaseOrder, PurchaseOrderService $service)
    {
        if (! $purchaseOrder->canResend()) {
            return response()->json([
                'message' => 'Cannot resend order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        // Validate supplier has an email
        if (! $purchaseOrder->supplier || ! $purchaseOrder->supplier->email) {
            return response()->json([
                'message' => 'Supplier does not have an email address'
            ], 422);
        }

        try {
            // Re-generate PDF and re-send email to supplier
            $service->sendToSupplier($purchaseOrder);

            return response()->json([
                'message' => 'Purchase order re-sent to supplier successfully',
                'purchase_order' => $purchaseOrder->fresh()->load('supplier', 'items.medicine', 'items.itemable'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error re-sending purchase order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send the latest Purchase Order PDF to the supplier as an email attachment.
     */
    public function sendPdfToSupplier(PurchaseOrder $purchaseOrder, PurchaseOrderService $service)
    {
        if (! in_array($purchaseOrder->status, ['pending', 'approved'])) {
            return response()->json([
                'message' => 'Cannot send PDF for order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        if (! $purchaseOrder->supplier || ! $purchaseOrder->supplier->email) {
            return response()->json([
                'message' => 'Supplier does not have an email address'
            ], 422);
        }

        try {
            $service->sendToSupplier($purchaseOrder);

            return response()->json([
                'message' => 'Purchase Order PDF sent successfully.',
                'purchase_order' => $purchaseOrder->fresh()->load('supplier', 'items.medicine', 'items.itemable'),
            ]);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'message' => 'Error sending Purchase Order PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark a purchase order as delivered (sent -> delivered).
     * Does NOT update inventory yet.
     */
    public function deliver(PurchaseOrder $purchaseOrder)
    {
        if (! $purchaseOrder->canDeliver()) {
            return response()->json([
                'message' => 'Cannot mark as delivered in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        $purchaseOrder->deliver();

        return response()->json($purchaseOrder->fresh()->load('supplier', 'items.medicine', 'items.itemable'));
    }

    /**
     * Approve a purchase order (pending -> approved).
     */
    public function approve(PurchaseOrder $purchaseOrder)
    {
        if (! $purchaseOrder->canApprove()) {
            return response()->json([
                'message' => 'Cannot approve order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        $purchaseOrder->approve();

        return response()->json($purchaseOrder->fresh()->load('supplier', 'items.medicine', 'items.itemable'));
    }

    /**
     * Complete a purchase order (delivered/approved -> completed).
     * Updates medicine stock and creates stock movement records.
     */
    public function complete(PurchaseOrder $purchaseOrder)
    {
        if (! $purchaseOrder->canComplete()) {
            return response()->json([
                'message' => 'Cannot complete order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        try {
            $purchaseOrder->complete();

            return response()->json($purchaseOrder->fresh()->load('supplier', 'items.medicine', 'items.itemable'));
        } catch (\Exception $e) {
            report($e);
            return response()->json(['message' => 'Error completing order: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Cancel a purchase order (draft/pending/sent/delivered/approved -> cancelled).
     */
    public function cancel(PurchaseOrder $purchaseOrder)
    {
        if (! $purchaseOrder->canCancel()) {
            return response()->json([
                'message' => 'Cannot cancel order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        $purchaseOrder->cancel();

        return response()->json($purchaseOrder->load('supplier', 'items.medicine', 'items.itemable'));
    }

    /**
     * Reopen a cancelled purchase order (cancelled -> pending).
     */
    public function reopen(PurchaseOrder $purchaseOrder)
    {
        if (! $purchaseOrder->canReopen()) {
            return response()->json([
                'message' => 'Cannot reopen order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        $purchaseOrder->reopen();

        return response()->json($purchaseOrder->fresh()->load('supplier', 'items.medicine', 'items.itemable'));
    }
    /**
     * Purchasing history - completed/delivered purchase orders.
     */
    public function history(Request $request)
    {
        $query = PurchaseOrder::with('supplier');

        if ($request->filled('status')) {
            $statuses = is_array($request->input('status'))
                ? $request->input('status')
                : [$request->input('status')];
            $query->whereIn('status', $statuses);
        }

        if (! $request->filled('status')) {
            $query->whereIn('status', ['completed', 'delivered']);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->input('supplier_id'));
        }

        if ($request->filled('medicine_id')) {
            $query->whereHas('items', function ($q) use ($request) {
                $q->where('medicine_id', $request->input('medicine_id'));
            });
        }

        return response()->json($query->latest()->paginate(15));
    }

}