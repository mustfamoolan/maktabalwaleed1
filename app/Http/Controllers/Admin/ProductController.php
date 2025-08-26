<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\SupplierCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::with(['supplier', 'supplier.category', 'category'])
            ->orderBy('created_at', 'desc')
            ->get();

        $suppliers = Supplier::where('is_active', true)
            ->with(['category', 'categories']) // إضافة الفئات الإضافية
            ->orderBy('name_ar')
            ->get()
            ->map(function ($supplier) {
                // إضافة جميع الفئات للمورد
                $supplier->all_categories = $supplier->getAllCategoriesAttribute();
                return $supplier;
            });

        $categories = SupplierCategory::where('is_active', true)
            ->orderBy('name_ar')
            ->get();

        // فئات المنتجات هي نفس فئات الموردين
        $productCategories = SupplierCategory::where('is_active', true)
            ->orderBy('name_ar')
            ->get();

        return Inertia::render('Admin/Products/IndexTable', [
            'products' => $products,
            'suppliers' => $suppliers,
            'categories' => $categories,
            'productCategories' => $productCategories
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $suppliers = Supplier::where('is_active', true)
            ->with(['category', 'categories']) // إضافة الفئات الإضافية
            ->orderBy('name_ar')
            ->get()
            ->map(function ($supplier) {
                // إضافة جميع الفئات للمورد
                $supplier->all_categories = $supplier->getAllCategoriesAttribute();
                return $supplier;
            });

        $categories = SupplierCategory::where('is_active', true)
            ->orderBy('name_ar')
            ->get();

        // فئات المنتجات هي نفس فئات الموردين
        $productCategories = SupplierCategory::where('is_active', true)
            ->orderBy('name_ar')
            ->get();

        return Inertia::render('Admin/Products/Create', [
            'suppliers' => $suppliers,
            'categories' => $categories,
            'productCategories' => $productCategories
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $product->load(['supplier', 'category']);

        return Inertia::render('Admin/Products/Show', [
            'product' => $product
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Debug: طباعة البيانات المرسلة
        \Log::info('Store Request Data:', $request->all());
        \Log::info('Store Request Files:', $request->allFiles());

        $validator = Validator::make($request->all(), [
            'name_ar' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'supplier_id' => 'required|exists:suppliers,id',
            'category_id' => 'nullable|exists:supplier_categories,id',
            'barcode' => 'nullable|string|max:50|unique:products,barcode',
            'barcode_type' => 'required|in:auto,manual',
            'cost_price' => 'nullable|numeric|min:0',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'wholesale_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'min_stock_level' => 'required|integer|min:0',
            'expiry_date' => 'nullable|date|after:today',
            'image' => 'nullable|file|mimes:jpeg,jpg,png,gif,webp|max:5120',
            'is_active' => 'nullable|in:0,1,true,false'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = $validator->validated();

        // معالجة الباركود
        if ($data['barcode_type'] === 'auto' || empty($data['barcode'])) {
            $data['barcode'] = $this->generateUniqueBarcode();
            $data['barcode_type'] = 'auto';
        } else {
            // التأكد من عدم وجود الباركود اليدوي
            if (Product::where('barcode', $data['barcode'])->exists()) {
                return back()->withErrors(['barcode' => 'رقم الباركود موجود مسبقاً'])->withInput();
            }
            $data['barcode_type'] = 'manual';
        }

        // معالجة رفع الصورة
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $image = $request->file('image');
            $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('products', $imageName, 'public');
            $data['image'] = $imagePath;
        } else {
            // إزالة حقل الصورة من البيانات إذا لم يتم رفع صورة
            unset($data['image']);
        }

        $data['barcode_generated_at'] = now();

        // تعيين القيم الافتراضية للحقول الفارغة
        $data['cost_price'] = $data['cost_price'] ?? 0;
        $data['wholesale_price'] = $data['wholesale_price'] ?? 0;

        $data['profit_margin'] = $data['selling_price'] - $data['cost_price'];

        // تحويل is_active إلى boolean
        if (isset($data['is_active'])) {
            $data['is_active'] = in_array($data['is_active'], ['1', 'true', true], true);
        }

        Product::create($data);

        return redirect()->route('admin.products.index')
            ->with('success', 'تم إضافة المنتج بنجاح');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        // Debug: طباعة البيانات المرسلة
        \Log::info('Update Request Data:', $request->all());
        \Log::info('Update Request Files:', $request->allFiles());

        $validator = Validator::make($request->all(), [
            'name_ar' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'supplier_id' => 'required|exists:suppliers,id',
            'category_id' => 'nullable|exists:supplier_categories,id',
            'barcode' => 'nullable|string|max:50|unique:products,barcode,' . $product->id,
            'barcode_type' => 'required|in:auto,manual',
            'cost_price' => 'nullable|numeric|min:0',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'wholesale_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'min_stock_level' => 'required|integer|min:0',
            'expiry_date' => 'nullable|date|after:today',
            'image' => 'nullable|file|mimes:jpeg,jpg,png,gif,webp|max:5120',
            'is_active' => 'nullable|in:0,1,true,false'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = $validator->validated();

        // معالجة الباركود عند التحديث
        if ($data['barcode_type'] === 'auto' || empty($data['barcode'])) {
            if (empty($product->barcode) || $product->barcode_type === 'auto') {
                $data['barcode'] = $this->generateUniqueBarcode();
                $data['barcode_generated_at'] = now();
            }
            $data['barcode_type'] = 'auto';
        } else {
            // التأكد من عدم وجود الباركود اليدوي
            if (Product::where('barcode', $data['barcode'])->where('id', '!=', $product->id)->exists()) {
                return back()->withErrors(['barcode' => 'رقم الباركود موجود مسبقاً'])->withInput();
            }
            $data['barcode_type'] = 'manual';
            if ($data['barcode'] !== $product->barcode) {
                $data['barcode_generated_at'] = now();
            }
        }

        // معالجة رفع الصورة
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            // حذف الصورة القديمة
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }

            $image = $request->file('image');
            $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('products', $imageName, 'public');
            $data['image'] = $imagePath;
        } else {
            // إزالة حقل الصورة من البيانات إذا لم يتم رفع صورة جديدة
            unset($data['image']);
        }

        // إضافة قيم افتراضية للحقول الرقمية
        $data['cost_price'] = $data['cost_price'] ?? 0;
        $data['selling_price'] = $data['selling_price'] ?? 0;
        $data['profit_margin'] = $data['selling_price'] - $data['cost_price'];

        // تحويل is_active إلى boolean
        if (isset($data['is_active'])) {
            $data['is_active'] = in_array($data['is_active'], ['1', 'true', true], true);
        }

        $product->update($data);

        return redirect()->route('admin.products.index')
            ->with('success', 'تم تحديث المنتج بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // حذف الصورة
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'تم حذف المنتج بنجاح');
    }

    /**
     * Toggle product status
     */
    public function toggleStatus(Product $product)
    {
        $product->update(['is_active' => !$product->is_active]);

        $status = $product->is_active ? 'تم تفعيل' : 'تم إلغاء تفعيل';

        return back()->with('success', $status . ' المنتج بنجاح');
    }

    /**
     * Generate unique barcode
     */
    private function generateUniqueBarcode()
    {
        do {
            $barcode = 'PRD' . date('Ymd') . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (Product::where('barcode', $barcode)->exists());

        return $barcode;
    }

    /**
     * Search products by barcode
     */
    public function searchByBarcode(Request $request)
    {
        $barcode = $request->get('barcode');

        $product = Product::where('barcode', $barcode)
            ->with(['supplier', 'supplier.category'])
            ->first();

        if ($product) {
            return response()->json([
                'found' => true,
                'product' => $product
            ]);
        }

        return response()->json([
            'found' => false,
            'message' => 'المنتج غير موجود'
        ]);
    }

    /**
     * Generate barcode image
     */
    public function generateBarcodeImage(Request $request)
    {
        $barcode = $request->get('barcode');

        if (empty($barcode)) {
            return response()->json(['error' => 'رقم الباركود مطلوب'], 400);
        }

        // سيتم إضافة منطق توليد صورة الباركود هنا
        return response()->json([
            'barcode' => $barcode,
            'image_url' => route('admin.products.barcode.image', ['barcode' => $barcode])
        ]);
    }

    /**
     * Search products for selection (API endpoint)
     */
    public function searchProducts(Request $request)
    {
        $query = $request->get('query');
        $all = $request->get('all', false);

        // If requesting all products for multi-product plans
        if ($all) {
            $products = Product::where('is_active', true)
                ->with(['supplier'])
                ->orderBy('name_ar')
                ->get();

            return response()->json($products);
        }

        if (empty($query) || strlen($query) < 2) {
            return response()->json([]);
        }

        $products = Product::where('is_active', true)
            ->with(['supplier'])
            ->where(function ($q) use ($query) {
                $q->where('name_ar', 'LIKE', '%' . $query . '%')
                  ->orWhere('name_en', 'LIKE', '%' . $query . '%')
                  ->orWhere('barcode', 'LIKE', '%' . $query . '%')
                  ->orWhereHas('supplier', function ($sq) use ($query) {
                      $sq->where('name_ar', 'LIKE', '%' . $query . '%')
                        ->orWhere('name_en', 'LIKE', '%' . $query . '%');
                  });
            })
            ->limit(10)
            ->get();

        return response()->json($products);
    }
}
