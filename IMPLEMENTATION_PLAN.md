# Sales (POS) Module Enhancement - Implementation Plan

## Current State Analysis
- Laravel 12 + React (Vite) pharmacy inventory system
- Sale model has: payment_method, receipt_number, but missing amount_paid, change_amount
- SaleController has: index, storePrescription, updateStatus (missing getTodaySales, getStats)
- CashierDashboard: cashier accepts payments via PATCH /sales/{id}/status
- barryvdh/laravel-dompdf already installed
- PDF template pattern exists in resources/views/pdf/purchase-order.blade.php
- Routes in routes/api.php (not web.php for API)

## Implementation Steps

### Backend
1. Migration: add amount_paid, change_amount to sales
2. Sale Model: payment method constants, receipt number gen, accessors
3. SaleService: PDF generation, receipt number, change calculation
4. SaleController: complete, receipt, download, print, getTodaySales, getStats, history, export
5. PDF Receipt Template: resources/views/pdf/receipt.blade.php
6. Routes: update api.php
7. DashboardController: payment breakdown cards
8. ReportController: export methods (PDF, CSV)
9. SaleFactory: update

### Frontend
10. CashierDashboard: payment method selection, success dialog
11. ReceiptPage: receipt view
12. SalesHistory: admin page
13. AdminDashboard: new cards
14. Reports: export buttons
15. app.jsx: new routes
16. SidebarLayout: Sales History link

### Tests
17. SaleTest.php
