<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PurchaseInvoice;
use App\Models\PurchaseInvoiceItem;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class PurchaseInvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $invoices = PurchaseInvoice::with(['creator', 'items', 'supplier'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('admin.purchase-invoices.index', compact('invoices'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $invoiceNumber = PurchaseInvoice::generateInvoiceNumber();
        $suppliers = Supplier::orderBy('name')->get();
        $categories = Category::orderBy('name')->get();

        return view('admin.purchase-invoices.create', compact('invoiceNumber', 'suppliers', 'categories'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'invoice_number' => 'required|unique:purchase_invoices',
            'invoice_date' => 'required|date',
            'supplier_id' => 'required|exists:suppliers,id',
            'driver_cost' => 'required|numeric|min:0',
            'workers_cost' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_name' => 'required|string',
            'items.*.purchase_price' => 'required|numeric|min:0',
            'items.*.sale_price' => 'required|numeric|min:0',
            'items.*.wholesale_price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1'
        ]);

        DB::beginTransaction();
        try {
            // إنشاء الفاتورة
            $invoice = PurchaseInvoice::create([
                'invoice_number' => $request->invoice_number,
                'invoice_date' => $request->invoice_date,
                'supplier_id' => $request->supplier_id,
                'driver_cost' => $request->driver_cost,
                'workers_cost' => $request->workers_cost,
                'notes' => $request->notes,
                'created_by' => auth('admin')->id()
            ]);

            $totalAmount = 0;

            // إضافة المنتجات
            foreach ($request->items as $itemData) {
                $item = new PurchaseInvoiceItem([
                    'product_id' => $itemData['product_id'] ?? null,
                    'product_name' => $itemData['product_name'],
                    'supplier_name' => $itemData['supplier_name'] ?? '',
                    'category_name' => $itemData['category_name'] ?? '',
                    'purchase_price' => $itemData['purchase_price'],
                    'sale_price' => $itemData['sale_price'],
                    'wholesale_price' => $itemData['wholesale_price'],
                    'quantity' => $itemData['quantity'],
                    'notes' => $itemData['notes'] ?? ''
                ]);

                $invoice->items()->save($item);
                $totalAmount += $item->total_price;
            }

            // تحديث المجاميع
            $invoice->total_amount = $totalAmount;
            $invoice->calculateTotalCost();
            $invoice->save();

            // توزيع التكلفة على المنتجات
            $invoice->distributeCostToItems();

            // تحديث مخزون المنتجات إذا كان مرتبط
            foreach ($invoice->items as $item) {
                if ($item->product_id) {
                    $product = Product::find($item->product_id);
                    if ($product) {
                        $product->stock_quantity += $item->quantity;
                        $product->purchase_price = $item->purchase_price_after_cost;
                        $product->sale_price = $item->sale_price;
                        $product->save();
                    }
                }
            }

            DB::commit();
            return redirect()->route('admin.purchase-invoices.index')
                ->with('success', 'تم إنشاء فاتورة الشراء بنجاح');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'حدث خطأ أثناء حفظ الفاتورة: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(PurchaseInvoice $purchaseInvoice)
    {
        $purchaseInvoice->load(['items', 'creator']);
        return view('admin.purchase-invoices.show', compact('purchaseInvoice'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PurchaseInvoice $purchaseInvoice)
    {
        $purchaseInvoice->load('items');
        $suppliers = Supplier::orderBy('name')->get();
        $categories = Category::orderBy('name')->get();

        return view('admin.purchase-invoices.edit', compact('purchaseInvoice', 'suppliers', 'categories'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PurchaseInvoice $purchaseInvoice)
    {
        // منطق التحديث مشابه للـ store
        return redirect()->route('admin.purchase-invoices.index')
            ->with('success', 'تم تحديث فاتورة الشراء بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PurchaseInvoice $purchaseInvoice)
    {
        DB::beginTransaction();
        try {
            // إعادة تعديل مخزون المنتجات إذا كانت مرتبطة
            foreach ($purchaseInvoice->items as $item) {
                if ($item->product_id) {
                    $product = Product::find($item->product_id);
                    if ($product) {
                        $product->stock_quantity -= $item->quantity;
                        $product->save();
                    }
                }
            }

            $purchaseInvoice->delete();

            DB::commit();
            return redirect()->route('admin.purchase-invoices.index')
                ->with('success', 'تم حذف فاتورة الشراء بنجاح');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'حدث خطأ أثناء حذف الفاتورة: ' . $e->getMessage());
        }
    }

    /**
     * البحث عن المنتجات للإضافة للفاتورة (حسب المورد المحدد)
     */
    public function searchProducts(Request $request)
    {
        $search = $request->get('search');
        $supplierId = $request->get('supplier_id');

        if (!$supplierId) {
            return response()->json([]);
        }

        $products = Product::with(['supplier', 'category'])
            ->where('supplier_id', $supplierId)
            ->where(function($query) use ($search) {
                $query->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('code', 'LIKE', "%{$search}%");
            })
            ->limit(10)
            ->get();

        return response()->json($products->map(function($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'code' => $product->code,
                'supplier_name' => $product->supplier->name ?? '',
                'category_name' => $product->category->name ?? '',
                'current_purchase_price' => $product->purchase_price,
                'current_sale_price' => $product->sale_price,
                'stock_quantity' => $product->stock_quantity
            ];
        }));
    }
}
