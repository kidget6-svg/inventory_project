# Pharmacy Inventory System - Team Task Breakdown

## SETUP (All members run this first)
```bash
composer install
npm install
php artisan key:generate
php artisan migrate --force
php artisan db:seed
npm run dev
```

## Default Login
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pharmacy.com | password |
| Pharmacist | pharmacist@pharmacy.com | password |
| Cashier | cashier@pharmacy.com | password |

---

## TEAM MEMBER 1: Auth + Dashboard + Categories
**Owns: Login, Register, all 3 Dashboards, Categories CRUD**

### Pages
- `resources/js/pages/Login.jsx`
- `resources/js/pages/Register.jsx`
- `resources/js/pages/AdminDashboard.jsx`
- `resources/js/pages/PharmacistDashboard.jsx`
- `resources/js/pages/CashierDashboard.jsx`
- `resources/js/pages/Categories.jsx`

### API Controllers
- `app/Http/Controllers/Api/AuthController.php`
- `app/Http/Controllers/Api/DashboardController.php`
- `app/Http/Controllers/Api/CategoryController.php`

### Tasks
1. Test login/register works for all 3 roles
2. Fix sidebar bug in `SidebarLayout.jsx`:
   ```js
   // DELETE this line (~line 30):
   cashier: cashierPage => cashierMenu,
   // REPLACE WITH:
   cashier: cashierMenu,
   ```
3. Make sure Admin Dashboard shows all stat cards with real data
4. Make sure Pharmacist Dashboard shows medicines, low stock, expiring
5. Make sure Cashier Dashboard shows today's sales and recent sales table
6. Test Categories create/edit/delete
7. Add success messages after actions
8. Add loading states when pages load

---

## TEAM MEMBER 2: Medicines + Stock Movements + Low Stock
**Owns: Medicine CRUD, Stock In/Out, Low Stock Alerts**

### Pages
- `resources/js/pages/Medicines.jsx`
- `resources/js/pages/StockMovements.jsx`
- `resources/js/pages/LowStock.jsx`

### API Controllers
- `app/Http/Controllers/Api/MedicineController.php`
- `app/Http/Controllers/Api/StockMovementController.php`
- `app/Http/Controllers/Api/LowStockController.php`

### Tasks
1. Test medicine create/edit/delete with all fields
2. Test that category dropdown loads in medicine form
3. Test stock in - medicine quantity should increase
4. Test stock out - medicine quantity should decrease
5. Test stock out fails when quantity is insufficient
6. Test low stock page shows medicines at/below reorder level
7. Add form validation error messages
8. Add confirmation dialog before delete
9. Make expiry date field work properly

---

## TEAM MEMBER 3: Suppliers + Purchase Orders + Reports
**Owns: Supplier CRUD, Purchase Orders, Reports page**

### Pages
- `resources/js/pages/Suppliers.jsx`
- `resources/js/pages/PurchaseOrders.jsx`
- `resources/js/pages/Reports.jsx`

### API Controllers
- `app/Http/Controllers/Api/SupplierController.php`
- `app/Http/Controllers/Api/PurchaseOrderController.php`
- `app/Http/Controllers/Api/ReportController.php`

### Tasks
1. Test supplier create/edit/delete
2. Test purchase order create - should show supplier dropdown, medicine dropdown
3. Test that creating purchase order increases medicine stock
4. Test delete purchase order
5. Test Reports page - click all 5 tabs:
   - Inventory tab shows all medicines
   - Sales tab shows all sales
   - Purchases tab shows all orders
   - Low Stock tab shows low stock items
   - Expiring tab shows medicines expiring within 90 days
6. Fix `PurchaseOrderController::update()` - add edit functionality
7. Add status badges with colors (pending=blue, completed=green, cancelled=red)
8. Make report tables sortable or searchable

---

## TEAM MEMBER 4: Sales + Styling + Polish
**Owns: Sales CRUD, Sidebar, Overall styling, Mobile responsive**

### Pages
- `resources/js/pages/Sales.jsx`

### Components
- `resources/js/components/SidebarLayout.jsx`
- `resources/js/components/StatCard.jsx`
- `resources/js/App.jsx`
- `resources/css/app.css`

### API Controllers
- `app/Http/Controllers/Api/SaleController.php`

### Tasks
1. Test sale create/edit/delete
2. Make sure sale total amount formats as currency ($0.00)
3. Make sidebar light blue (#E3F2FD) and white theme consistent
4. Make sidebar work on mobile (hamburger menu opens/closes)
5. Fix sidebar overlay click to close
6. Add loading spinner component for all pages
7. Add success/error toast notifications
8. Make all tables responsive on mobile
9. Test all pages on different screen sizes
10. Add proper page titles to each page
11. Test logout button works and redirects to login
12. Fix any color inconsistencies across all pages

---

## SHARED BUGS TO FIX (Anyone can fix)
1. `SidebarLayout.jsx` line ~30: remove `cashier: cashierPage => cashierMenu,`
2. `PurchaseOrderController::update()` is empty - needs implementation
3. `SaleController::store()` should validate properly
4. `resources/js/bootstrap.js` - remove old Alpine.js import if present

## FILES REFERENCE
```
resources/js/pages/          (13 page components)
resources/js/components/     (SidebarLayout, StatCard)
resources/js/context/        (AuthContext)
resources/js/App.jsx         (Router)
resources/js/axios.js        (API client)
app/Http/Controllers/Api/    (10 API controllers)
routes/api.php               (all routes)
database/seeders/            (user seeder)
```
