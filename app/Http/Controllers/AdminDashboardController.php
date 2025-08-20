<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\SalesRepresentative;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Supplier;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // إحصائيات عامة
        $statistics = [
            // إحصائيات المبيعات
            'total_sales_today' => Invoice::whereDate('created_at', today())->sum('total_amount'),
            'total_sales_month' => Invoice::whereMonth('created_at', now()->month)->sum('total_amount'),
            'total_invoices_today' => Invoice::whereDate('created_at', today())->count(),
            'total_invoices_pending' => Invoice::where('status', 'pending')->count(),

            // إحصائيات المندوبين
            'total_representatives' => SalesRepresentative::where('is_active', true)->count(),
            'active_representatives_today' => Invoice::whereDate('invoice_date', today())
                ->distinct('sales_representative_id')->count(),

            // إحصائيات العملاء
            'total_customers' => Customer::where('is_active', true)->count(),
            'customers_with_debt' => Customer::where('current_balance', '>', 0)->count(),
            'total_debt_amount' => Customer::sum('current_balance'),

            // إحصائيات المخزن
            'total_products' => Product::where('is_active', true)->count(),
            'low_stock_products' => Product::whereColumn('current_stock', '<=', 'min_stock_level')->count(),
            'out_of_stock_products' => Product::where('current_stock', '<=', 0)->count(),
            'total_inventory_value' => Product::sum(DB::raw('purchase_price * current_stock')),
        ];

        // آخر الفواتير
        $recent_invoices = Invoice::with(['salesRepresentative', 'customer'])
            ->orderBy('invoice_date', 'desc')
            ->limit(10)
            ->get();

        // أداء المندوبين اليوم
        $representatives_performance = SalesRepresentative::with(['invoices' => function($query) {
                $query->whereDate('invoice_date', today());
            }])
            ->where('is_active', true)
            ->get()
            ->map(function($rep) {
                $todayInvoices = $rep->invoices;
                return [
                    'id' => $rep->id,
                    'name' => $rep->name_ar,
                    'phone' => $rep->phone,
                    'invoices_count' => $todayInvoices->count(),
                    'total_sales' => $todayInvoices->sum('total_amount'),
                    'total_collected' => $todayInvoices->sum('paid_amount'),
                ];
            });

                // المنتجات منخفضة المخزون
        $low_stock_products = Product::where('is_active', true)
            ->whereColumn('current_stock', '<=', 'min_stock_level')
            ->orderBy('current_stock', 'asc')
            ->limit(10)
            ->get();

        // العملاء بأعلى ديون
        $top_debtors = Customer::with('salesRepresentative')
            ->where('current_balance', '>', 0)
            ->orderBy('current_balance', 'desc')
            ->limit(10)
            ->get();

        // مبيعات آخر 7 أيام
        $sales_chart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $sales_chart[] = [
                'date' => $date->format('m-d'),
                'day' => $date->format('D'),
                'amount' => Invoice::whereDate('invoice_date', $date)->sum('total_amount'),
                'count' => Invoice::whereDate('invoice_date', $date)->count(),
            ];
        }

        return Inertia::render('Admin/Dashboard', [
            'statistics' => $statistics,
            'recent_invoices' => $recent_invoices,
            'representatives_performance' => $representatives_performance,
            'low_stock_products' => $low_stock_products,
            'top_debtors' => $top_debtors,
            'sales_chart' => $sales_chart,
        ]);
    }

    // إحصائيات مباشرة للتحديث عبر AJAX
    public function liveStats()
    {
        return response()->json([
            'total_sales_today' => Invoice::whereDate('created_at', today())->sum('total_amount'),
            'total_invoices_today' => Invoice::whereDate('created_at', today())->count(),
            'total_invoices_pending' => Invoice::where('status', 'pending')->count(),
            'total_debt_amount' => RepresentativeCustomer::sum('total_debt'),
            'low_stock_count' => Product::where('cartons_count', '<', 10)->count(),
            'last_update' => now()->format('H:i:s')
        ]);
    }

    // آخر الأنشطة
    public function recentActivity()
    {
        $recent_invoices = Invoice::with(['representative', 'customer'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($invoice) {
                return [
                    'type' => 'invoice',
                    'message' => "فاتورة جديدة #{$invoice->invoice_number} بقيمة " . number_format($invoice->total_amount) . " د.ع",
                    'representative' => $invoice->representative->name,
                    'customer' => $invoice->customer->customer_name,
                    'time' => $invoice->created_at->diffForHumans(),
                    'amount' => $invoice->total_amount,
                    'status' => $invoice->status,
                ];
            });

        return response()->json($recent_invoices);
    }
}
