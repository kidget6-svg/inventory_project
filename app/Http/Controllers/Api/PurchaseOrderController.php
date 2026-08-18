<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Medicine;
use App\Models\Supplier;
use App\Services\PurchaseOrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            'medicine_name' => 'nullable|string|max:255',
            'medicine_id' => 'nullable|exists:medicines,id',
            'quantity' => 'required|integer|min:1',
        ]);

        if (empty($validated['medicine_name']) && empty($validated['medicine_id'])) {
            return response()->json(['message' => 'Medicine name or medicine ID is required'], 422);
        }

        DB::beginTransaction();

        try {
            $medicine = null;
            if (!empty($validated['medicine_id'])) {
                $medicine = Medicine::find($validated['medicine_id']);
            }
            if (!$medicine && !empty($validated['medicine_name'])) {
                $medName = trim($validated['medicine_name']);
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
            }

            $unitPrice = $request->input('unit_price', 0);
            $subtotal = $validated['quantity'] * $unitPrice;

            $order = PurchaseOrder::create([
                'supplier_id' => $validated['supplier_id'],
                'manufacturing_company' => $validated['manufacturing_company'],
                'order_date' => now()->toDateString(),
                'status' => 'draft',
                'total_amount' => $subtotal,
            ]);

            PurchaseOrderItem::create([
                'purchase_order_id' => $order->id,
                'medicine_id' => $medicine->id,
                'quantity' => $validated['quantity'],
                'unit_price' => $unitPrice,
                'subtotal' => $subtotal,
            ]);

            DB::commit();

            return response()->json($order->load('supplier', 'items.medicine'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error creating order: ' . $e->getMessage()], 500);
        }
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        return response()->json($purchaseOrder->load('supplier', 'items.medicine'));
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
            'medicine_name' => 'nullable|string|max:255',
            'medicine_id' => 'nullable|exists:medicines,id',
            'quantity' => 'required|integer|min:1',
        ]);

        if (empty($validated['medicine_name']) && empty($validated['medicine_id'])) {
            return response()->json(['message' => 'Medicine name or medicine ID is required'], 422);
        }

        DB::beginTransaction();

        try {
            $medicine = null;
            if (!empty($validated['medicine_id'])) {
                $medicine = Medicine::find($validated['medicine_id']);
            }
            if (!$medicine && !empty($validated['medicine_name'])) {
                $medName = trim($validated['medicine_name']);
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
            }

            $unitPrice = $request->input('unit_price', 0);
            $subtotal = $validated['quantity'] * $unitPrice;

            // Update the order header (status is NOT changed here - it's workflow-driven)
            // order_date is preserved from creation and not editable by the user
            $purchaseOrder->update([
                'supplier_id' => $validated['supplier_id'],
                'manufacturing_company' => $validated['manufacturing_company'],
                'total_amount' => $subtotal,
            ]);

            // Get the existing item (if any)
            $item = $purchaseOrder->items()->first();

            if ($item) {
                $item->update([
                    'medicine_id' => $medicine->id,
                    'quantity' => $validated['quantity'],
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);
            } else {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'medicine_id' => $medicine->id,
                    'quantity' => $validated['quantity'],
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);
            }

            DB::commit();

            return response()->json($purchaseOrder->load('supplier', 'items.medicine'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error updating order: ' . $e->getMessage()], 500);
        }
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

        return response()->json($purchaseOrder->fresh()->load('supplier', 'items.medicine'));
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
            'purchase_order' => $purchaseOrder->load('supplier', 'items.medicine'),
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
                'purchase_order' => $purchaseOrder->fresh()->load('supplier', 'items.medicine'),
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
                'purchase_order' => $purchaseOrder->fresh()->load('supplier', 'items.medicine'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error re-sending purchase order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send the Purchase Order PDF to the supplier via email.
     *
     * Workflow: After a PO is approved, the admin clicks "Send PDF/Email".
     * - If the email is sent successfully, the PO is automatically
     *   completed (stock is added, completed_at is recorded) and the
     *   Send button is hidden.
     * - If sending fails, the PO stays "approved" and the error is shown.
     *
     * Allowed statuses: pending, approved.
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

        DB::beginTransaction();

        try {
            // Send the email (throws on failure)
            $service->sendToSupplier($purchaseOrder);

            // Email sent successfully — automatically complete the PO
            $purchaseOrder->complete();

            DB::commit();

            return response()->json([
                'message' => 'Purchase Order PDF sent successfully and order completed.',
                'purchase_order' => $purchaseOrder->fresh()->load('supplier', 'items.medicine'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            report($e);

            // Keep the PO in its current status (approved/pending) and surface the error
            return response()->json([
                'message' => 'Error sending Purchase Order PDF: ' . $e->getMessage(),
                'purchase_order' => $purchaseOrder->fresh()->load('supplier', 'items.medicine'),
            ], 500);
        }
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

        return response()->json($purchaseOrder->fresh()->load('supplier', 'items.medicine'));
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

            return response()->json($purchaseOrder->fresh()->load('supplier', 'items.medicine'));
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

        return response()->json($purchaseOrder->load('supplier', 'items.medicine'));
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

        return response()->json($purchaseOrder->fresh()->load('supplier', 'items.medicine'));
    }
}
