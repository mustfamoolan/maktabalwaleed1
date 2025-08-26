<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Debt;
use App\Models\Product;
use App\Models\Representative;
use App\Models\RepresentativeCustomer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class RepresentativePOSController extends Controller
{
    public function index()
    {
        $representative = Auth::guard('representative')->user();

        // تسجيل مؤقت للتشخيص
        \Log::info('POS Index - Representative:', ['id' => $representative->id, 'name' => $representative->name]);

        // جلب المنتجات المتاحة (مؤقتاً بدون شرط الكمية للاختبار)
        $products = Product::where('is_active', true)
            ->with('supplier')
            ->get()
            ->map(function ($product) {
                $stock = $product->stock_quantity ?? $product->current_stock ?? 0;
                return [
                    'id' => $product->id,
                    'name' => $product->name_ar,
                    'barcode' => $product->barcode,
                    'cost_price' => $product->purchase_price ?? $product->cost_price ?? 0,
                    'selling_price' => $product->selling_price,
                    'quantity' => $stock,
                    'unit' => $product->unit ?? 'قطعة',
                    'supplier_name' => $product->supplier->name ?? '',
                    'image' => $product->image,
                ];
            });

        // تسجيل عدد المنتجات
        \Log::info('POS Index - Products count:', ['count' => $products->count()]);
        if ($products->count() > 0) {
            \Log::info('POS Index - First product:', $products->first());
        }

        // جlb العملاء الخاصين بالمندوب
        $customers = RepresentativeCustomer::where('representative_id', $representative->id)
            ->where('is_active', true)
            ->select('id', 'name', 'phone')
            ->get();

        // جلب المندوبين الآخرين (للبيع للمندوبين)
        $representatives = Representative::where('id', '!=', $representative->id)
            ->where('is_active', true)
            ->select('id', 'name', 'phone')
            ->get();

        return Inertia::render('Representative/POS/Index', [
            'products' => $products,
            'customers' => $customers,
            'representatives' => $representatives,
        ]);
    }

    public function invoice(Request $request)
    {
        $representative = Auth::guard('representative')->user();

        // جلب العملاء الخاصين بالمندوب
        $customers = RepresentativeCustomer::where('representative_id', $representative->id)
            ->where('is_active', true)
            ->select('id', 'name', 'phone')
            ->get();

        // جلب المندوبين الآخرين (للبيع للمندوبين)
        $representatives = Representative::where('id', '!=', $representative->id)
            ->where('is_active', true)
            ->select('id', 'name', 'phone')
            ->get();

        // الحصول على بيانات السلة من الطلب (إما POST أو GET)
        $cart = $request->input('cart', []);
        $discountAmount = $request->input('discountAmount', 0);

        return Inertia::render('Representative/POS/Invoice', [
            'customers' => $customers,
            'representatives' => $representatives,
            'cart' => $cart,
            'discountAmount' => $discountAmount,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'sale_type' => 'required|in:customer,representative,cash',
            'customer_id' => 'nullable|exists:representative_customers,id',
            'representative_id' => 'nullable|exists:representatives,id',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_sale_price' => 'required|numeric|min:0',
            'items.*.unit_discount' => 'nullable|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
            'remaining_amount' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'payment_status' => 'required|in:paid,partial,debt',
            'notes' => 'nullable|string',
            'due_date' => 'nullable|date|after:today',
        ]);

        try {
            DB::beginTransaction();

            $representative = Auth::guard('representative')->user();

            // حساب المورد والقسم الرئيسي (الأكثر قيمة في الفاتورة)
            $supplierTotals = [];
            $categoryTotals = [];
            $totalProfit = 0;

            foreach ($request->items as $item) {
                $product = Product::with(['supplier', 'category'])->findOrFail($item['product_id']);
                $itemTotal = $item['quantity'] * $item['unit_sale_price'];
                $itemProfit = ($item['unit_sale_price'] - $product->purchase_price) * $item['quantity'];
                $totalProfit += $itemProfit;

                // تجميع المجاميع حسب المورد
                if ($product->supplier_id) {
                    $supplierTotals[$product->supplier_id] = ($supplierTotals[$product->supplier_id] ?? 0) + $itemTotal;
                }

                // تجميع المجاميع حسب القسم
                if ($product->category_id) {
                    $categoryTotals[$product->category_id] = ($categoryTotals[$product->category_id] ?? 0) + $itemTotal;
                }
            }

            // العثور على المورد والقسم الرئيسي
            $primarySupplierId = !empty($supplierTotals) ? array_keys($supplierTotals, max($supplierTotals))[0] : null;
            $primaryCategoryId = !empty($categoryTotals) ? array_keys($categoryTotals, max($categoryTotals))[0] : null;

            // إنشاء البيع
            $sale = Sale::create([
                'sale_type' => $request->sale_type,
                'seller_representative_id' => $representative->id,
                'customer_id' => $request->customer_id,
                'buyer_representative_id' => $request->representative_id,
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'subtotal' => $request->subtotal,
                'total_amount' => $request->total_amount,
                'paid_amount' => $request->paid_amount,
                'remaining_amount' => $request->remaining_amount,
                'discount_amount' => $request->discount_amount ?? 0,
                'payment_status' => $request->payment_status,
                'sale_status' => 'completed',
                'status' => 'pending',
                'sent_at' => now(),
                'primary_supplier_id' => $primarySupplierId,
                'primary_category_id' => $primaryCategoryId,
                'total_profit' => $totalProfit,
                'notes' => $request->notes,
                'sale_date' => now(),
                'due_date' => $request->due_date,
            ]);

            // إضافة أصناف البيع
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);

                // التحقق من توفر الكمية
                $availableStock = $product->stock_quantity ?? $product->current_stock ?? 0;
                if ($availableStock < $item['quantity']) {
                    throw new \Exception("الكمية المطلوبة من المنتج {$product->name_ar} غير متوفرة. المتوفر: {$availableStock}");
                }

                // حساب ربح الصنف
                $itemProfit = ($item['unit_sale_price'] - $product->purchase_price) * $item['quantity'];

                // إنشاء صنف البيع
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_cost_price' => $product->purchase_price,
                    'unit_sale_price' => $item['unit_sale_price'],
                    'unit_discount' => $item['unit_discount'] ?? 0,
                    'profit_amount' => $itemProfit,
                    'notes' => $item['notes'] ?? null,
                ]);

                // تحديث كمية المنتج
                if ($product->stock_quantity > 0) {
                    $product->decrement('stock_quantity', $item['quantity']);
                } else {
                    $product->decrement('current_stock', $item['quantity']);
                }
            }

            // إنشاء دين إذا كان هناك مبلغ متبقي
            if ($sale->remaining_amount > 0) {
                $debtorType = $request->sale_type === 'representative' ? 'representative' : 'customer';
                $customerId = $request->sale_type === 'customer' ? $request->customer_id : null;
                $representativeId = $request->sale_type === 'representative' ? $request->representative_id : null;

                Debt::create([
                    'sale_id' => $sale->id,
                    'debtor_type' => $debtorType,
                    'customer_id' => $customerId,
                    'representative_id' => $representativeId,
                    'original_amount' => $sale->remaining_amount,
                    'remaining_amount' => $sale->remaining_amount,
                    'status' => 'active',
                    'due_date' => $request->due_date ?? now()->addDays(30),
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم إنجاز البيع بنجاح',
                'sale_id' => $sale->id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function sendInvoice(Request $request, $saleId)
    {
        $representative = Auth::guard('representative')->user();

        $sale = Sale::where('seller_representative_id', $representative->id)
                   ->where('status', 'created')
                   ->findOrFail($saleId);

        try {
            // تحديث الحالة إلى "مرسل" ثم "في الانتظار"
            $sale->update([
                'status' => 'pending',
                'sent_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم إرسال الفاتورة بنجاح وهي الآن في حالة الانتظار',
                'sale' => [
                    'id' => $sale->id,
                    'status' => $sale->status,
                    'sent_at' => $sale->sent_at->format('Y-m-d H:i:s'),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في إرسال الفاتورة: ' . $e->getMessage()
            ], 422);
        }
    }

    public function receipt($saleId)
    {
        $representative = Auth::guard('representative')->user();

        $sale = Sale::with([
            'items.product',
            'customer',
            'buyerRepresentative',
            'debt',
            'primarySupplier',
            'primaryCategory'
        ])->where('seller_representative_id', $representative->id)
          ->findOrFail($saleId);

        return Inertia::render('Representative/POS/Receipt', [
            'sale' => [
                'id' => $sale->id,
                'sale_number' => $sale->sale_number,
                'sale_type' => $sale->sale_type,
                'customer_name' => $sale->customer_name,
                'customer_phone' => $sale->customer_phone,
                'total_amount' => $sale->total_amount,
                'paid_amount' => $sale->paid_amount,
                'remaining_amount' => $sale->remaining_amount,
                'discount_amount' => $sale->discount_amount,
                'total_profit' => $sale->total_profit,
                'payment_status' => $sale->payment_status,
                'status' => $sale->status,
                'sale_date' => $sale->sale_date->format('Y-m-d H:i:s'),
                'notes' => $sale->notes,
                'primary_supplier' => $sale->primarySupplier ? [
                    'id' => $sale->primarySupplier->id,
                    'name' => $sale->primarySupplier->name,
                ] : null,
                'primary_category' => $sale->primaryCategory ? [
                    'id' => $sale->primaryCategory->id,
                    'name' => $sale->primaryCategory->name,
                ] : null,
                'items' => $sale->items->map(function ($item) {
                    return [
                        'product_name' => $item->product->name,
                        'quantity' => $item->quantity,
                        'unit_sale_price' => $item->unit_sale_price,
                        'unit_discount' => $item->unit_discount,
                        'final_total' => $item->final_total,
                        'profit_amount' => $item->profit_amount,
                    ];
                }),
                'debt' => $sale->debt ? [
                    'debt_number' => $sale->debt->debt_number,
                    'due_date' => $sale->debt->due_date->format('Y-m-d'),
                    'remaining_amount' => $sale->debt->remaining_amount,
                ] : null,
            ]
        ]);
    }

    public function searchProduct(Request $request)
    {
        $query = $request->get('q');

        $products = Product::where('is_active', true)
            ->where(function($q) {
                $q->where('current_stock', '>', 0)
                  ->orWhere('stock_quantity', '>', 0);
            })
            ->where(function ($q) use ($query) {
                $q->where('name_ar', 'like', "%{$query}%")
                  ->orWhere('barcode', 'like', "%{$query}%");
            })
            ->with('supplier')
            ->limit(10)
            ->get()
            ->map(function ($product) {
                $stock = $product->stock_quantity ?? $product->current_stock ?? 0;
                return [
                    'id' => $product->id,
                    'name' => $product->name_ar,
                    'barcode' => $product->barcode,
                    'cost_price' => $product->purchase_price ?? $product->cost_price ?? 0,
                    'selling_price' => $product->selling_price,
                    'quantity' => $stock,
                    'unit' => $product->unit ?? 'قطعة',
                    'supplier_name' => $product->supplier->name ?? '',
                ];
            });

        return response()->json($products);
    }

    public function updateStatus(Request $request, $saleId)
    {
        $request->validate([
            'status' => 'required|in:created,sent,pending,preparing,ready_for_delivery,out_for_delivery,delivered,awaiting_approval,completed,partial_return,full_return,cancelled,partial_cancelled',
            'status_notes' => 'nullable|string',
        ]);

        $representative = Auth::guard('representative')->user();

        $sale = Sale::where('seller_representative_id', $representative->id)
                   ->findOrFail($saleId);

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
            case 'ready_for_delivery':
                $updateData['prepared_at'] = now();
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

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث حالة الفاتورة بنجاح',
            'sale' => [
                'id' => $sale->id,
                'status' => $sale->status,
                'sale_status' => $sale->sale_status,
                'sent_at' => $sale->sent_at,
                'prepared_at' => $sale->prepared_at,
                'delivered_at' => $sale->delivered_at,
                'approved_at' => $sale->approved_at,
                'status_notes' => $sale->status_notes,
            ]
        ]);
    }

    public function getProductByBarcode($barcode)
    {
        $product = Product::where('barcode', $barcode)
            ->where('is_active', true)
            ->where(function($query) {
                $query->where('current_stock', '>', 0)
                      ->orWhere('stock_quantity', '>', 0);
            })
            ->with('supplier')
            ->first();

        if (!$product) {
            return response()->json(['error' => 'المنتج غير موجود أو غير متوفر'], 404);
        }

        $stock = $product->stock_quantity ?? $product->current_stock ?? 0;

        return response()->json([
            'id' => $product->id,
            'name' => $product->name_ar,
            'barcode' => $product->barcode,
            'cost_price' => $product->purchase_price ?? $product->cost_price ?? 0,
            'selling_price' => $product->selling_price,
            'quantity' => $stock,
            'unit' => $product->unit ?? 'قطعة',
            'supplier_name' => $product->supplier->name ?? '',
        ]);
    }
}
