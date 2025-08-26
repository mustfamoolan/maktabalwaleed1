<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\SupplierCategory;
use App\Models\Representative;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // إحصائيات عامة متاحة حالياً
        $statistics = [
            'total_products' => Product::count(),
            'total_suppliers' => Supplier::count(),
            'total_supplier_categories' => SupplierCategory::count(),
            'total_representatives' => Representative::count(),
            'active_suppliers' => Supplier::where('is_active', true)->count(),
            'active_representatives' => Representative::where('is_active', true)->count(),
            'low_stock_products' => Product::where('stock_quantity', '<=', 10)->count(),
        ];

        // أحدث المنتجات المضافة
        $recent_products = Product::with(['supplier', 'category'])
            ->latest()
            ->take(5)
            ->get();

        // أحدث الموردين المضافين
        $recent_suppliers = Supplier::latest()
            ->take(5)
            ->get();

        // أحدث المندوبين المضافين
        $recent_representatives = Representative::latest()
            ->take(5)
            ->get();

        // إحصائيات المخزون
        $inventory_stats = [
            'total_stock_value' => Product::sum(DB::raw('cost_price * stock_quantity')),
            'total_stock_quantity' => Product::sum('stock_quantity'),
            'products_in_stock' => Product::where('stock_quantity', '>', 0)->count(),
            'products_out_of_stock' => Product::where('stock_quantity', '=', 0)->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'statistics' => $statistics,
            'recent_products' => $recent_products,
            'recent_suppliers' => $recent_suppliers,
            'recent_representatives' => $recent_representatives,
            'inventory_stats' => $inventory_stats,
        ]);
    }

    public function getQuickStats()
    {
        return response()->json([
            'total_products' => Product::count(),
            'total_suppliers' => Supplier::count(),
            'total_representatives' => Representative::count(),
            'low_stock_alerts' => Product::where('stock_quantity', '<=', 10)->count(),
        ]);
    }
}
