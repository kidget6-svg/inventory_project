# Role-Based Access Control Implementation

## Backend Changes
- [ ] 1. Update api.php - reorganize sales routes with correct role middleware
- [ ] 2. Update web.php - update sales middleware
- [ ] 3. Add role checks in SaleController.php (defense in depth)
- [ ] 4. Add role check in RetailProductController.php (defense in depth)

## Frontend Changes
- [ ] 5. Update app.jsx - update ProtectedRoute roles for prescription-sales and retail-sales
- [ ] 6. Update SidebarLayout.jsx - update menus for all roles
- [ ] 7. Update QuickActions.jsx - update actions for all roles

## Test Changes
- [ ] 8. Update SaleTest.php - update tests to use correct roles
- [ ] 9. Run tests to verify