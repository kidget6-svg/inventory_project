# Task Progress: Role & Permission Rework

## Phase 1: Backend Infrastructure
- [ ] 1. Update `routes/web.php` — convert all `role:` middleware to `permission:`
- [ ] 2. Update `UserController.php` — add `purchasing_staff` to role validation rules

## Phase 2: Frontend Core Infrastructure
- [ ] 3. Update `AuthContext.jsx` — add `can()`, `canAny()`, `canAll()` + permissions storage
- [ ] 4. Update `axios.js` — add 403 response interceptor for global redirect
- [ ] 5. Create `Forbidden.jsx` — 403 error page

## Phase 3: Frontend Routing & Layout
- [ ] 6. Update `App.jsx` — permission-based `ProtectedRoute`, `DashboardRouter` for all roles, update routes
- [ ] 7. Update `SidebarLayout.jsx` — permission-based menus, purchasing_staff menu, role badges

## Phase 4: Purchasing Staff Dashboard
- [ ] 8. Create `PurchasingStaffDashboard.jsx`

## Phase 5: Frontend Pages — Permission Guards & Buttons
- [ ] 9. `Users.jsx` — add purchasing_staff to roleOptions & role filter
- [ ] 10. `PurchaseOrders.jsx` — permission checks for workflow buttons
- [ ] 11. `Suppliers.jsx` — permission checks for CRUD buttons
- [ ] 12. `Medicines.jsx` — replace `isAdmin` with `can('medicines.manage')`
- [ ] 13. `RetailProducts.jsx` — replace `isAdmin` with `can('retail_products.manage')`
- [ ] 14. `Categories.jsx` — replace `canWrite` with `can('categories.manage')`
- [ ] 15. `Inventory.jsx` — replace `canWrite` with `can('stock_movements.manage')`
- [ ] 16. `SalesHistory.jsx` — replace `isCashier` with `can()`
- [ ] 17. `LowStock.jsx` — permission check for order-now button
- [ ] 18. `MedicineDetails.jsx` — replace `isAdmin` with `can()`
- [ ] 19. `CategoryCreate.jsx` — replace `isAdmin` with `can()`
- [ ] 20. `CategoryEdit.jsx` — replace `isAdmin` with `can()`
- [ ] 21. `CategoryView.jsx` — replace `isAdmin` with `can()`
- [ ] 22. `SupplierCreate.jsx` — add permission guard
- [ ] 23. `SupplierEdit.jsx` — add permission guard
- [ ] 24. `SupplierView.jsx` — add permission guard
- [ ] 25. `PurchaseOrderCreate.jsx` — add permission guard
- [ ] 26. `PurchaseOrderEdit.jsx` — add permission guard
- [ ] 27. `PurchaseOrderView.jsx` — add permission guard

## Phase 6: Testing
- [ ] 28. Test admin, pharmacist, cashier, and purchasing_staff roles
