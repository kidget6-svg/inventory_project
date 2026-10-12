# Task: Fix "Unauthorized action" error for Cashier completing prescription sale

## Analysis
- **Error source**: `EnsureUserHasRole` middleware returns "Unauthorized action." (403)
- **Route**: `PATCH /sales/{id}/status` → `updateStatus` with middleware `role:cashier` (api.php:204-207)
- **Controller**: `SaleController::updateStatus` checks `hasRole('cashier')` (line 295)
- **Frontend**: `/prescription-sales-cashier` requires `prescription-checkout.view` perm; "Complete Sale" button requires `prescription-checkout.complete` perm
- **Seeder**: Cashier has `prescription-checkout.complete`; Admin gets ALL permissions automatically (User::permissions())
- **Problem**: Only `cashier` role allowed; Admin blocked. Task requires both Cashier AND Admin.

## Fix Applied
- [x] Analyze route, controller, middleware, policy/gate, role/permission
- [x] Fix api.php: `role:cashier` → `role:admin,cashier` for updateStatus route
- [x] Fix SaleController.php: allow admin in updateStatus authorization check
- [x] Fix syntax errors (leftover diff markers)
- [x] Fix web.php: `role:cashier` → `role:admin,cashier` for updateStatus route
- [x] Run tests to verify fix (33/33 SaleTest tests pass)
- [x] Add tests for Admin allowed & Pharmacist blocked
- [x] Test complete-payment flow

## Test Results
- All 33 SaleTest tests pass (31 original + 2 new)
- New test: `it_allows_admin_to_complete_prescription_sale` - Admin can complete sale ✓
- New test: `it_prevents_pharmacist_from_completing_prescription_sale` - Pharmacist blocked ✓
- Pre-existing test failures in Auth/PurchaseOrder/Supplier tests are unrelated to this fix
