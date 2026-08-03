# Purchase Order Workflow Improvement Tasks

## Status Flow: Draft → Pending → Sent → Delivered → Completed → Cancelled

## Workflow Implementation

The Purchase Order workflow has been implemented with the following steps:

1. **Draft** — Purchase order is created with a single medicine item
2. **Pending** — Admin submits the order (draft → pending)
3. **Preview PDF** — Admin previews the generated PDF in a modal before sending
4. **Edit if needed** — Admin can edit the order from the preview modal (pending orders are editable)
5. **Send to Supplier** — Admin clicks "Send to Supplier" in the preview modal:
   - PDF is generated from database data using Laravel DOMPDF
   - PDF is emailed to the supplier using Laravel Mail (synchronous, not queued)
   - `sent_at` timestamp is recorded
   - Status changes from Pending → Sent
6. **Supplier delivers medicines** — Supplier delivers the ordered medicines
7. **Mark as Delivered** — Admin marks the order as delivered (sent → delivered):
   - `delivered_at` timestamp is recorded
8. **Complete Purchase Order** — Admin completes the order (delivered → completed):
   - Medicine stock quantities are automatically updated
   - Stock movement records are created
   - `completed_at` timestamp is recorded
   - Duplicate stock additions are prevented
9. **Inventory updates automatically** — Stock is incremented and stock movements are recorded

## PDF Lifecycle (Updated)

PDF generation, viewing, and downloading are now available across ALL active statuses:

- **Pending**: Admin can review, generate/upload PDF, and send the purchase order to the supplier by email.
- **Sent (Approved)**: PDF remains available for viewing/downloading. Admin can re-send the PO to the supplier (supplier communication).
- **Delivered**: PDF remains available for viewing/downloading.
- **Completed**: PDF history remains available for records.
- **Cancelled**: PDF record is kept but editing/sending actions are disabled.
- **Draft**: PDF is not yet available (order must be submitted first).

### New Permission Methods (Model)
- `canGeneratePdf()` — true for all statuses (PDF is generated from DB data)
- `canViewPdf()` — true for all statuses except draft
- `canDownloadPdf()` — true for all statuses except draft
- `canResend()` — true for sent status only (re-send email without status change)

### New Controller Methods
- `download()` — Downloads the PDF as a file attachment (all statuses except draft)
- `resend()` — Re-sends the PO PDF to the supplier via email (sent status only)

### New Routes
- `GET /purchase-orders/{purchaseOrder}/download` — Download PDF
- `POST /purchase-orders/{purchaseOrder}/resend` — Re-send PO to supplier

### Updated Controller Method
- `preview()` — Now uses `canGeneratePdf()` instead of `canSend()`, allowing PDF generation for ALL statuses

## Completed Tasks

- [x] 1. Install barryvdh/laravel-dompdf package
- [x] 2. Create migration to add `sent_at` column to purchase_orders table
- [x] 3. Update PurchaseOrder model (new statuses, can* methods, action methods)
- [x] 4. Create PurchaseOrderMail mailable class
- [x] 5. Create PurchaseOrderService (PDF generation + email sending)
- [x] 6. Create SendPurchaseOrderEmail queue job (retained for future use)
- [x] 7. Create professional PDF template (resources/views/pdf/purchase-order.blade.php)
- [x] 8. Update PurchaseOrderController (submit, send, deliver, complete, cancel)
- [x] 9. Update routes (add custom action routes)
- [x] 10. Update PurchaseOrders.jsx (new actions, status badges, notifications)
- [x] 11. Update PurchaseOrderFactory (new statuses)
- [x] 12. Update PurchaseOrderTest (new status flow tests)
- [x] 13. Run migrations and tests to verify

## Improvements Made

- [x] 14. Fix send() method to send email synchronously via PurchaseOrderService (not queued job)
- [x] 15. Add `delivered_at` and `completed_at` timestamp columns (migration + model)
- [x] 16. Record `delivered_at` in deliver() method
- [x] 17. Record `completed_at` in complete() method
- [x] 18. Update PDF template to display all workflow timestamps
- [x] 19. Update email template to display sent_at timestamp
- [x] 20. Update DashboardController to use most specific timestamp for activity tracking
- [x] 21. Add Mail::assertSent() verification to send test
- [x] 22. Add delivered_at and completed_at assertions to workflow tests
- [x] 23. Remove unused SendPurchaseOrderEmail import from controller

## PDF Lifecycle Improvements (New)

- [x] 24. Add `canGeneratePdf()`, `canViewPdf()`, `canDownloadPdf()`, `canResend()` methods to PurchaseOrder model
- [x] 25. Update `preview()` controller to use `canGeneratePdf()` instead of `canSend()` — PDF now available for ALL statuses
- [x] 26. Add `download()` controller method for direct PDF file download
- [x] 27. Add `resend()` controller method for re-sending PO to supplier (sent status only)
- [x] 28. Add `GET /purchase-orders/{purchaseOrder}/download` route
- [x] 29. Add `POST /purchase-orders/{purchaseOrder}/resend` route
- [x] 30. Update PurchaseOrders.jsx: show PDF preview/download icons for all statuses except draft
- [x] 31. Update PurchaseOrders.jsx: add Resend button for sent status (supplier communication)
- [x] 32. Update PurchaseOrders.jsx: status-aware action buttons in preview modal
- [x] 33. Update PurchaseOrders.jsx: add handleDownloadPdf() and handleResend() functions
- [x] 34. Update tests: change `test_cannot_preview_non_pending_order` to `test_can_preview_non_pending_order`
- [x] 35. Add `test_can_preview_pdf_in_all_active_statuses` test
- [x] 36. Add `test_can_download_pdf_in_all_active_statuses` test
- [x] 37. Add `test_cannot_download_pdf_for_draft_order` test
- [x] 38. Add `test_admin_can_resend_a_sent_purchase_order` test
- [x] 39. Add `test_cannot_resend_non_sent_order` test

## Summary of Changes

### New Files Created:
- `database/migrations/2026_08_01_000000_add_sent_at_to_purchase_orders_table.php`
- `database/migrations/2026_08_02_000000_add_delivered_at_and_completed_at_to_purchase_orders_table.php`
- `app/Mail/PurchaseOrderMail.php`
- `app/Services/PurchaseOrderService.php`
- `app/Jobs/SendPurchaseOrderEmail.php`
- `resources/views/pdf/purchase-order.blade.php`
- `resources/views/emails/purchase-order.blade.php`

### Files Modified:
- `app/Models/PurchaseOrder.php` — New status flow, can* methods, action methods, delivered_at/completed_at timestamps, **NEW: canGeneratePdf(), canViewPdf(), canDownloadPdf(), canResend()**
- `app/Http/Controllers/Api/PurchaseOrderController.php` — New actions: submit, send, deliver, complete, cancel; send() now uses service directly for synchronous email; **NEW: download() and resend() methods; preview() now uses canGeneratePdf()**
- `routes/web.php` — Added custom action routes; **NEW: download and resend routes**
- `resources/js/pages/PurchaseOrders.jsx` — New UI actions, status badges, toast notifications, PDF preview modal; **NEW: PDF actions for all statuses, resend button, status-aware modal buttons**
- `resources/views/pdf/purchase-order.blade.php` — Added sent_at, delivered_at, completed_at display
- `resources/views/emails/purchase-order.blade.php` — Added sent_at display
- `database/factories/PurchaseOrderFactory.php` — Updated statuses
- `tests/Feature/PurchaseOrderTest.php` — Updated tests for new workflow, added Mail::assertSent and timestamp assertions; **NEW: PDF lifecycle tests, resend tests**
- `tests/Feature/PurchaseOrderWorkflowTest.php` — Updated workflow test with timestamp assertions
- `app/Http/Controllers/Api/DashboardController.php` — Updated activity labels and timestamp tracking
- `composer.json` — Added barryvdh/laravel-dompdf dependency
