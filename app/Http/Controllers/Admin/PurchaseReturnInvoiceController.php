<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PurchaseReturnInvoice;
use App\Models\PurchaseReturnInvoiceItem;
use App\Models\Supplier;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PurchaseReturnInvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $invoices = PurchaseReturnInvoice::with(['supplier', 'creator'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('admin.purchase-return-invoices.index', compact('invoices'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $suppliers = Supplier::orderBy('name')->get();
        $invoiceNumber = PurchaseReturnInvoice::generateInvoiceNumber();

        return view('admin.purchase-return-invoices.create', compact('suppliers', 'invoiceNumber'));
    }

    /**
     * جلب جميع فواتير الشراء المؤكدة مع pagination وتصفية حسب المورد
     */
    public function getAllPurchaseInvoices(Request $request)
    {
        $page = $request->get('page', 1);
        $perPage = 10;
        $supplierFilter = $request->get('supplier', '');

        $query = \App\Models\PurchaseInvoice::with(['items'])
            ->where('status', 'confirmed');

        // تصفية حسب المورد إذا تم تحديده
        if (!empty($supplierFilter)) {
            $query->whereHas('items', function($itemQuery) use ($supplierFilter) {
                $itemQuery->where('supplier_name', 'like', "%{$supplierFilter}%");
            });
        }

        $invoices = $query->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $invoicesData = $invoices->map(function($invoice) {
            $supplierName = $invoice->items->first()?->supplier_name ?? 'غير محدد';
            return [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'invoice_date' => $invoice->invoice_date->format('Y-m-d'),
                'final_total' => $invoice->final_total,
                'items_count' => $invoice->items->count(),
                'supplier_name' => $supplierName
            ];
        });

        return response()->json([
            'data' => $invoicesData,
            'current_page' => $invoices->currentPage(),
            'last_page' => $invoices->lastPage(),
            'total' => $invoices->total(),
            'per_page' => $invoices->perPage()
        ]);
    }

    /**
     * جلب قائمة الموردين الذين لديهم فواتير شراء مؤكدة
     */
    public function getSuppliersWithInvoices()
    {
        $suppliers = \App\Models\PurchaseInvoice::with(['items'])
            ->where('status', 'confirmed')
            ->get()
            ->pluck('items')
            ->flatten()
            ->pluck('supplier_name')
            ->unique()
            ->filter()
            ->sort()
            ->values();

        return response()->json($suppliers);
    }

    /**
     * البحث عن فواتير الشراء
     */
    public function searchPurchaseInvoices(Request $request)
    {
        $search = $request->get('q', '');

        if (empty($search)) {
            return response()->json([]);
        }

        $invoices = \App\Models\PurchaseInvoice::with(['items.product'])
            ->where(function($query) use ($search) {
                $query->where('invoice_number', 'like', "%{$search}%")
                      ->orWhereHas('items', function($itemQuery) use ($search) {
                          $itemQuery->where('supplier_name', 'like', "%{$search}%");
                      });
            })
            ->where('status', 'confirmed') // فقط الفواتير المؤكدة
            ->limit(10)
            ->get()
            ->map(function($invoice) {
                $supplierName = $invoice->items->first()?->supplier_name ?? 'غير محدد';
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'invoice_date' => $invoice->invoice_date->format('Y-m-d'),
                    'final_total' => $invoice->final_total,
                    'items_count' => $invoice->items->count(),
                    'supplier_name' => $supplierName
                ];
            });

        return response()->json($invoices);
    }

    /**
     * جلب تفاصيل فاتورة الشراء مع منتجاتها
     */
    public function getPurchaseInvoiceDetails($id)
    {
        $invoice = \App\Models\PurchaseInvoice::with(['items.product.supplier', 'items.product.category'])
            ->findOrFail($id);

        return response()->json([
            'invoice' => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'invoice_date' => $invoice->invoice_date->format('Y-m-d'),
                'final_total' => $invoice->final_total,
                'supplier_name' => $invoice->items->first()?->supplier_name ?? 'غير محدد'
            ],
            'items' => $invoice->items->map(function($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'supplier_name' => $item->supplier_name,
                    'category_name' => $item->category_name,
                    'original_quantity' => $item->quantity,
                    'purchase_price' => $item->purchase_price,
                    'purchase_price_after_cost' => $item->purchase_price_after_cost,
                    'sale_price' => $item->sale_price,
                    'wholesale_price' => $item->wholesale_price,
                    'total_price' => $item->total_price,
                    'product' => $item->product ? [
                        'image' => $item->product->image ? asset('storage/' . $item->product->image) : null,
                        'code' => $item->product->code,
                        'stock_quantity' => $item->product->stock_quantity
                    ] : null
                ];
            })
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'invoice_number' => 'required|unique:purchase_return_invoices',
            'invoice_date' => 'required|date',
            'supplier_id' => 'required|exists:suppliers,id',
            'supplier_name' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.purchase_price' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // إنشاء الفاتورة
            $invoice = PurchaseReturnInvoice::create([
                'invoice_number' => $request->invoice_number,
                'invoice_date' => $request->invoice_date,
                'supplier_id' => $request->supplier_id,
                'supplier_name' => $request->supplier_name,
                'discount_amount' => $request->discount_amount ?? 0,
                'tax_amount' => $request->tax_amount ?? 0,
                'additional_costs' => $request->additional_costs ?? 0,
                'notes' => $request->notes,
                'created_by' => Auth::id(),
            ]);

            // إضافة العناصر
            foreach ($request->items as $item) {
                // التحقق من وجود كمية مرتجعة
                if (!isset($item['quantity']) || $item['quantity'] <= 0) {
                    continue; // تخطي العناصر بدون كمية مرتجعة
                }

                $product = Product::find($item['product_id']);

                // الحصول على بيانات من فاتورة الشراء الأصلية إذا توفرت
                $originalInvoiceItem = null;
                if (isset($item['original_invoice_item_id'])) {
                    $originalInvoiceItem = \App\Models\PurchaseInvoiceItem::find($item['original_invoice_item_id']);
                }

                PurchaseReturnInvoiceItem::create([
                    'purchase_return_invoice_id' => $invoice->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $originalInvoiceItem ? $originalInvoiceItem->product_name : $product->name,
                    'supplier_name' => $request->supplier_name,
                    'category_name' => $originalInvoiceItem ? $originalInvoiceItem->category_name : ($product->category ? $product->category->name : 'غير محدد'),
                    'purchase_price' => $item['purchase_price'],
                    'purchase_price_after_cost' => $originalInvoiceItem ? $originalInvoiceItem->purchase_price_after_cost : $item['purchase_price'],
                    'sale_price' => $originalInvoiceItem ? $originalInvoiceItem->sale_price : $product->sale_price,
                    'wholesale_price' => $originalInvoiceItem ? $originalInvoiceItem->wholesale_price : $product->wholesale_price,
                    'quantity' => $item['quantity'],
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            // إعادة حساب المجاميع
            $invoice->refresh();
            $invoice->save();

            // تأكيد الفاتورة إذا طُلب ذلك
            if ($request->confirm_invoice) {
                $invoice->confirm();
            }

            DB::commit();

            return redirect()->route('admin.purchase-return-invoices.show', $invoice)
                ->with('success', 'تم إنشاء فاتورة مرتجع الشراء بنجاح');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withInput()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(PurchaseReturnInvoice $purchaseReturnInvoice)
    {
        $purchaseReturnInvoice->load(['items', 'supplier', 'creator']);
        return view('admin.purchase-return-invoices.show', compact('purchaseReturnInvoice'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PurchaseReturnInvoice $purchaseReturnInvoice)
    {
        if ($purchaseReturnInvoice->status !== 'draft') {
            return redirect()->route('admin.purchase-return-invoices.show', $purchaseReturnInvoice)
                ->with('error', 'لا يمكن تعديل فاتورة مؤكدة أو ملغية');
        }

        $suppliers = Supplier::orderBy('name')->get();
        $purchaseReturnInvoice->load('items');

        return view('admin.purchase-return-invoices.edit', compact('purchaseReturnInvoice', 'suppliers'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PurchaseReturnInvoice $purchaseReturnInvoice)
    {
        if ($purchaseReturnInvoice->status !== 'draft') {
            return redirect()->route('admin.purchase-return-invoices.show', $purchaseReturnInvoice)
                ->with('error', 'لا يمكن تعديل فاتورة مؤكدة أو ملغية');
        }

        $request->validate([
            'invoice_date' => 'required|date',
            'supplier_id' => 'required|exists:suppliers,id',
            'supplier_name' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.purchase_price' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // تحديث الفاتورة
            $purchaseReturnInvoice->update([
                'invoice_date' => $request->invoice_date,
                'supplier_id' => $request->supplier_id,
                'supplier_name' => $request->supplier_name,
                'discount_amount' => $request->discount_amount ?? 0,
                'tax_amount' => $request->tax_amount ?? 0,
                'additional_costs' => $request->additional_costs ?? 0,
                'notes' => $request->notes,
            ]);

            // حذف العناصر القديمة
            $purchaseReturnInvoice->items()->delete();

            // إضافة العناصر الجديدة
            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);

                PurchaseReturnInvoiceItem::create([
                    'purchase_return_invoice_id' => $purchaseReturnInvoice->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $product->name,
                    'supplier_name' => $request->supplier_name,
                    'category_name' => $product->category ? $product->category->name : 'غير محدد',
                    'purchase_price' => $item['purchase_price'],
                    'purchase_price_after_cost' => $item['purchase_price_after_cost'] ?? $item['purchase_price'],
                    'sale_price' => $item['sale_price'] ?? $product->sale_price,
                    'wholesale_price' => $item['wholesale_price'] ?? $product->wholesale_price,
                    'quantity' => $item['quantity'],
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            // إعادة حساب المجاميع
            $purchaseReturnInvoice->refresh();
            $purchaseReturnInvoice->save();

            DB::commit();

            return redirect()->route('admin.purchase-return-invoices.show', $purchaseReturnInvoice)
                ->with('success', 'تم تحديث فاتورة مرتجع الشراء بنجاح');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withInput()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PurchaseReturnInvoice $purchaseReturnInvoice)
    {
        try {
            $purchaseReturnInvoice->delete();
            return redirect()->route('admin.purchase-return-invoices.index')
                ->with('success', 'تم حذف فاتورة مرتجع الشراء بنجاح');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * تأكيد الفاتورة
     */
    public function confirm(PurchaseReturnInvoice $purchaseReturnInvoice)
    {
        try {
            $purchaseReturnInvoice->confirm();
            return back()->with('success', 'تم تأكيد فاتورة مرتجع الشراء وخصم الكميات من المخزون');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * إلغاء الفاتورة
     */
    public function cancel(PurchaseReturnInvoice $purchaseReturnInvoice)
    {
        try {
            $purchaseReturnInvoice->cancel();
            return back()->with('success', 'تم إلغاء فاتورة مرتجع الشراء');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
