<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use App\Models\RepresentativeCustomer;
use App\Models\Representative;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    // عرض قائمة الفواتير للمندوبين
    public function index(Request $request)
    {
        // الحصول على المندوب من الجلسة أو استخدام أول مندوب للاختبار
        $representative_user = session('representative_user');
        if (!$representative_user) {
            // استخدام أول مندوب للاختبار
            $representative = Representative::first();
            if (!$representative) {
                return response('لا توجد مندوبين في النظام', 404);
            }
            $representative_id = $representative->id;
        } else {
            $representative_id = $representative_user['id'];
        }

        $invoices = Invoice::with(['customer'])
            ->where('representative_id', $representative_id)
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->latest()
            ->paginate(20);

        return Inertia::render('RepresentativesPanel/Invoices/Index', [
            'invoices' => $invoices,
            'representative_user' => $representative_user ?? ['id' => $representative_id],
            'filters' => $request->only(['status'])
        ]);
    }

    // عرض قائمة الفواتير العامة (للإدارة)
    public function adminIndex(Request $request)
    {
        $invoices = Invoice::with(['representative', 'customer', 'items'])
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->representative_id, function ($query, $representative_id) {
                return $query->where('representative_id', $representative_id);
            })
            ->latest()
            ->paginate(20);

        $representatives = Representative::all();

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'representatives' => $representatives,
            'filters' => $request->only(['status', 'representative_id'])
        ]);
    }

    // عرض تفاصيل فاتورة
    public function show($id)
    {
        $invoice = Invoice::with(['representative', 'customer', 'items.product'])
            ->findOrFail($id);

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice
        ]);
    }

    // عرض تفاصيل فاتورة للمندوبين
    public function representativeShow($id)
    {
        // الحصول على المندوب من الجلسة
        $representative_user = session('representative_user');
        if (!$representative_user) {
            return redirect()->route('representatives.login.form');
        }

        $invoice = Invoice::with(['representative', 'customer', 'items.product'])
            ->where('representative_id', $representative_user['id'])
            ->findOrFail($id);

        return Inertia::render('RepresentativesPanel/Invoices/Show', [
            'invoice' => $invoice
        ]);
    }

    // نموذج إنشاء فاتورة جديدة (للمندوبين)
    public function create(Request $request)
    {
        // الحصول على المندوب من الجلسة
        $representative_user = session('representative_user');
        if (!$representative_user) {
            return redirect()->route('representatives.login.form');
        }

        $representative = Representative::findOrFail($representative_user['id']);
        $customers = RepresentativeCustomer::where('representative_id', $representative->id)
            ->where('status', 'active')
            ->get();
        $products = Product::with('supplierType')
            ->where('is_active', true)
            ->where('cartons_count', '>', 0)
            ->get();

        return Inertia::render('RepresentativesPanel/POS/CreateInvoice', [
            'representative' => $representative,
            'customers' => $customers,
            'products' => $products
        ]);
    }

    // حفظ فاتورة جديدة
    public function store(Request $request)
    {
        $request->validate([
            'representative_id' => 'required|exists:representatives,id',
            'customer_id' => 'required|exists:representative_customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'paid_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {
            // إنشاء الفاتورة
            $invoice = Invoice::create([
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'representative_id' => $request->representative_id,
                'customer_id' => $request->customer_id,
                'total_amount' => 0, // سيتم حسابه من العناصر
                'paid_amount' => $request->paid_amount ?? 0,
                'remaining_amount' => 0, // سيتم حسابه لاحقاً
                'status' => 'pending',
                'notes' => $request->notes,
                'invoice_date' => now(),
                'is_printed' => false
            ]);

            $totalAmount = 0;

            // إضافة عناصر الفاتورة
            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);

                // حساب الأسعار - نحن نبيع كراتين وليس قطع منفردة
                $cartons_quantity = $item['quantity']; // الكمية المطلوبة هي كراتين
                $unit_price = $product->selling_price / $product->units_per_carton; // سعر القطعة الواحدة
                $carton_price = $product->selling_price; // سعر الكرتون
                $total_units = $cartons_quantity * $product->units_per_carton; // إجمالي القطع
                $total_price = $cartons_quantity * $carton_price; // إجمالي السعر

                $invoiceItem = InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $item['product_id'],
                    'cartons_quantity' => $cartons_quantity,
                    'units_per_carton' => $product->units_per_carton,
                    'total_units' => $total_units,
                    'unit_price' => $unit_price,
                    'carton_price' => $carton_price,
                    'total_price' => $total_price
                ]);

                $totalAmount += $invoiceItem->total_price;

                // تحديث المخزون بعدد الكراتين المستخدمة
                $product->decrement('cartons_count', $cartons_quantity);
            }            // تحديث إجمالي الفاتورة والمبلغ المتبقي
            $invoice->update([
                'total_amount' => $totalAmount,
                'remaining_amount' => $totalAmount - ($request->paid_amount ?? 0)
            ]);
        });

        return redirect()->route('representatives.invoices')
            ->with('success', 'تم إنشاء الفاتورة بنجاح');
    }

    // تحديث حالة الفاتورة
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,preparing,shipping,delivered,returned,cancelled'
        ]);

        $invoice = Invoice::findOrFail($id);
        $invoice->update(['status' => $request->status]);

        return redirect()->back()
            ->with('success', 'تم تحديث حالة الفاتورة بنجاح');
    }

    // تحديث المدفوعات
    public function updatePayment(Request $request, $id)
    {
        $request->validate([
            'paid_amount' => 'required|numeric|min:0'
        ]);

        $invoice = Invoice::findOrFail($id);

        if ($request->paid_amount > $invoice->total_amount) {
            return redirect()->back()
                ->withErrors(['paid_amount' => 'المبلغ المدفوع لا يمكن أن يكون أكبر من إجمالي الفاتورة']);
        }

        $invoice->update([
            'paid_amount' => $request->paid_amount,
            'remaining_amount' => $invoice->total_amount - $request->paid_amount
        ]);

        return redirect()->back()
            ->with('success', 'تم تحديث المدفوعات بنجاح');
    }

    // طباعة الفاتورة
    public function print($id)
    {
        $invoice = Invoice::with(['representative', 'customer', 'items.product'])
            ->findOrFail($id);

        $invoice->update(['is_printed' => true]);

        return Inertia::render('Invoices/Print', [
            'invoice' => $invoice
        ]);
    }

    // احصائيات المندوب
    public function representativeStats($representativeId)
    {
        $representative = Representative::findOrFail($representativeId);

        $stats = [
            'total_invoices' => Invoice::where('representative_id', $representativeId)->count(),
            'pending_invoices' => Invoice::where('representative_id', $representativeId)->pending()->count(),
            'delivered_invoices' => Invoice::where('representative_id', $representativeId)->delivered()->count(),
            'total_sales' => Invoice::where('representative_id', $representativeId)->sum('total_amount'),
            'total_collected' => Invoice::where('representative_id', $representativeId)->sum('paid_amount'),
            'outstanding_amount' => Invoice::where('representative_id', $representativeId)->sum('remaining_amount')
        ];

        return response()->json([
            'representative' => $representative,
            'stats' => $stats
        ]);
    }
}
