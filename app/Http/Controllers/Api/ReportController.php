<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Shelf;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Display general reports (inventory, sales, purchases, low stock, expiring).
     */
    public function index()
    {
        $medicines = Medicine::orderBy('name')->get();
        $sales = Sale::orderBy('sale_date', 'desc')->paginate(10);
        $purchases = PurchaseOrder::with('supplier')->orderBy('created_at', 'desc')->paginate(10);

        $expiring = Medicine::whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [
                today(),
                today()->addDays(90)
            ])
            ->orderBy('expiry_date')
            ->get();

        return response()->json([
            'medicines' => $medicines,
            'sales' => $sales,
            'purchases' => $purchases,
            'lowStock' => $lowStock,
            'expiring' => $expiring,
        ]);
    }

    /**
     * Report 1: Which shelf contains the most medicines?
     * Returns shelves ordered by medicine count (descending).
     */
    public function shelvesByMedicineCount()
    {
        $shelves = Shelf::withCount('medicines')
            ->orderBy('medicines_count', 'desc')
            ->get(['id', 'shelf_code', 'location', 'medicines_count']);

        return response()->json($shelves);
    }

    /**
     * Report 2: Which medicines on a given shelf sold the most this month?
     * Accepts an optional shelf_code query parameter.
     * If no shelf_code is provided, returns data for all shelves.
     */
    public function medicinesSoldByShelf(Request $request)
    {
        $shelfCode = $request->query('shelf_code');

        $query = Medicine::select(
            'medicines.id',
            'medicines.name',
            'medicines.generic_name',
            'medicines.shelf_id',
            'shelves.shelf_code',
            'shelves.location',
            DB::raw('SUM(sale_items.quantity) as total_quantity_sold'),
            DB::raw('SUM(sale_items.subtotal) as total_revenue')
        )
            ->leftJoin('shelves', 'medicines.shelf_id', '=', 'shelves.id')
            ->leftJoin('sale_items', 'medicines.id', '=', 'sale_items.medicine_id')
            ->leftJoin('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->where('sales.sale_date', '>=', today()->startOfMonth())
            ->where('sales.sale_date', '<=', today()->endOfMonth());

        if ($shelfCode) {
            $query->where('shelves.shelf_code', $shelfCode);
        }

        $medicines = $query
            ->groupBy('medicines.id', 'medicines.name', 'medicines.generic_name', 'medicines.shelf_id', 'shelves.shelf_code', 'shelves.location')
            ->orderBy('total_quantity_sold', 'desc')
            ->get();

        return response()->json($medicines);
    }

    /**
     * Report 3: How much revenue came from medicines stored on a given shelf?
     * Accepts an optional shelf_code query parameter.
     * If no shelf_code is provided, returns revenue for all shelves.
     */
    public function shelfRevenue(Request $request)
    {
        $shelfCode = $request->query('shelf_code');

        $query = Medicine::select(
            'shelves.id',
            'shelves.shelf_code',
            'shelves.location',
            DB::raw('SUM(sale_items.subtotal) as total_revenue'),
            DB::raw('SUM(sale_items.quantity) as total_units_sold')
        )
            ->join('shelves', 'medicines.shelf_id', '=', 'shelves.id')
            ->leftJoin('sale_items', 'medicines.id', '=', 'sale_items.medicine_id')
            ->leftJoin('sales', 'sale_items.sale_id', '=', 'sales.id');

        if ($shelfCode) {
            $query->where('shelves.shelf_code', $shelfCode);
        }

        $revenue = $query
            ->groupBy('shelves.id', 'shelves.shelf_code', 'shelves.location')
            ->orderBy('total_revenue', 'desc')
            ->get();

        return response()->json($revenue);
    }

    /**
     * Report 4: Which medicines have not sold this week?
     * Returns medicines with no sale items in the last 7 days.
     */
    public function medicinesNotSoldThisWeek()
    {
        $notSold = Medicine::whereDoesntHave('saleItems', function ($query) {
            $query->whereHas('sale', function ($q) {
                $q->where('sale_date', '>=', today()->subDays(6))
                  ->where('sale_date', '<=', today());
            });
        })
            ->with('shelf')
            ->orderBy('name')
            ->get(['id', 'name', 'generic_name', 'batch_number', 'quantity', 'shelf_id']);

        return response()->json($notSold);
    }

    /**
     * Report 5: Which shelves contain low-stock medicines?
     * Returns shelves that have at least one medicine at or below reorder level.
     */
    public function shelvesWithLowStock()
    {
        $shelves = Shelf::whereHas('medicines', function ($query) {
            $query->whereColumn('quantity', '<=', 'reorder_level');
        })
            ->with(['medicines' => function ($query) {
                $query->whereColumn('quantity', '<=', 'reorder_level')
                      ->orderBy('quantity');
            }])
            ->get(['id', 'shelf_code', 'location']);

        return response()->json($shelves);
    }

    /**
     * Get medicines sold today with shelf information.
     */
    public function todaySales()
    {
        $sales = SaleItem::with('medicine.shelf')
            ->whereDate('created_at', \Carbon\Carbon::today())
            ->get();

        return response()->json($sales);
    }
}
