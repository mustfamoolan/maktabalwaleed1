<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Representative;
use App\Models\RepresentativeCustomer;
use App\Models\Supplier;
use App\Models\SupplierCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with([
            'sellerRepresentative:id,name,phone',
            'customer:id,name,phone',
            'buyerRepresentative:id,name,phone',
            'primarySupplier:id,name_ar,name_en',
            'primaryCategory:id,name_ar,name_en',
            'items:id,sale_id,product_id,quantity,unit_sale_price,unit_discount,profit_amount',
            'items.product:id,name_ar,barcode',
            'debt:id,sale_id,remaining_amount,status'
        ]);

        // تطبيق الفلاتر
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('sale_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhereHas('sellerRepresentative', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('representative_id')) {
            $query->where('seller_representative_id', $request->representative_id);
        }

        if ($request->filled('supplier_id')) {
            $query->where('primary_supplier_id', $request->supplier_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('sale_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('sale_date', '<=', $request->date_to);
        }

        // ترتيب النتائج
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // الصفحات
        $perPage = $request->get('per_page', 15);
        $sales = $query->paginate($perPage);

        // الإحصائيات
        $stats = [
            'total_sales' => Sale::count(),
            'total_amount' => Sale::sum('total_amount'),
            'total_profit' => Sale::sum('total_profit'),
            'pending_invoices' => Sale::where('status', 'pending')->count(),
            'today_sales' => Sale::whereDate('created_at', today())->count(),
            'today_amount' => Sale::whereDate('created_at', today())->sum('total_amount'),
        ];

        // بيانات الفلاتر
        $representatives = Representative::where('is_active', true)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $suppliers = Supplier::select('id', 'name_ar', 'name_en')
            ->orderBy('name_ar')
            ->get();

        return Inertia::render('Admin/Invoices/Index', [
            'sales' => $sales,
            'stats' => $stats,
            'representatives' => $representatives,
            'suppliers' => $suppliers,
            'filters' => $request->only(['search', 'status', 'payment_status', 'representative_id', 'supplier_id', 'date_from', 'date_to', 'sort_by', 'sort_order', 'per_page']),
        ]);
    }

    public function show($id)
    {
        $sale = Sale::with([
            'sellerRepresentative:id,name,phone,email',
            'customer:id,name,phone,address,gps_latitude,gps_longitude',
            'buyerRepresentative:id,name,phone,email',
            'primarySupplier:id,name_ar,name_en,phone,address',
            'primaryCategory:id,name_ar,name_en',
            'items:id,sale_id,product_id,quantity,unit_cost_price,unit_sale_price,unit_discount,profit_amount,notes',
            'items.product:id,name_ar,name_en,barcode,unit,image',
            'debt:id,sale_id,original_amount,remaining_amount,status,due_date',
            'debt.payments:id,amount,payment_date,notes'
        ])->findOrFail($id);

        return Inertia::render('Admin/Invoices/Show', [
            'sale' => $sale
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:created,sent,pending,preparing,ready_for_delivery,out_for_delivery,delivered,awaiting_approval,completed,partial_return,full_return,cancelled,partial_cancelled',
            'status_notes' => 'nullable|string',
        ]);

        $sale = Sale::findOrFail($id);
        $status = $request->status;

        $updateData = [
            'status' => $status,
            'status_notes' => $request->status_notes,
        ];

        // تحديد التواريخ حسب الحالة
        switch ($status) {
            case 'sent':
                $updateData['sent_at'] = now();
                break;
            case 'preparing':
                $updateData['prepared_at'] = now();
                break;
            case 'ready_for_delivery':
                $updateData['prepared_at'] = $updateData['prepared_at'] ?? now();
                break;
            case 'delivered':
                $updateData['delivered_at'] = now();
                break;
            case 'completed':
                $updateData['approved_at'] = now();
                $updateData['sale_status'] = 'completed';
                break;
            case 'cancelled':
            case 'partial_cancelled':
                $updateData['sale_status'] = 'cancelled';
                break;
        }

        $sale->update($updateData);

        return redirect()->back()->with('success', 'تم تحديث حالة الفاتورة بنجاح');
    }

    public function exportExcel(Request $request)
    {
        // TODO: تصدير إلى Excel
        return response()->json(['message' => 'Export functionality coming soon']);
    }

    public function printInvoice($id)
    {
        $sale = Sale::with([
            'sellerRepresentative',
            'customer',
            'items.product',
            'debt'
        ])->findOrFail($id);

        return Inertia::render('Admin/Invoices/Print', [
            'sale' => $sale
        ]);
    }
}
