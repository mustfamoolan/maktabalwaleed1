<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\SupplierType;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::with(['supplier', 'supplierType'])->get();
        $suppliers = Supplier::active()->with('supplierTypes')->get();
        $supplierTypes = SupplierType::active()->get();

        return Inertia::render('Admin/Warehouse', [
            'products' => $products,
            'suppliers' => $suppliers,
            'supplierTypes' => $supplierTypes,
            'admin_user' => session('admin_user')
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'supplier_type_id' => 'required|exists:supplier_types,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'cartons_count' => 'required|integer|min:1',
            'units_per_carton' => 'required|integer|min:1',
            'weight' => 'nullable|numeric|min:0',
            'barcode' => 'required|string|unique:products,barcode',
            'purchase_date' => 'required|date',
            'image' => 'nullable|image|max:2048',
        ], [
            'name.required' => 'اسم المنتج مطلوب',
            'supplier_type_id.required' => 'نوع المنتج مطلوب',
            'supplier_id.required' => 'المورد مطلوب',
            'purchase_price.required' => 'سعر الشراء مطلوب',
            'selling_price.required' => 'سعر البيع مطلوب',
            'cartons_count.required' => 'عدد الكراتين مطلوب',
            'units_per_carton.required' => 'عدد العلب في الكارتون مطلوب',
            'barcode.required' => 'الباركود مطلوب',
            'barcode.unique' => 'هذا الباركود موجود مسبقاً',
            'purchase_date.required' => 'تاريخ الشراء مطلوب',
            'image.image' => 'يجب أن يكون الملف صورة',
            'image.max' => 'حجم الصورة يجب أن يكون أقل من 2MB',
        ]);

        $data = $request->except('image');

        // رفع الصورة إذا كانت موجودة
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
            $data['image'] = $imagePath;
        }

        Product::create($data);

        return redirect()->route('admin.warehouse.index')->with('success', 'تم إضافة المنتج بنجاح');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'supplier_type_id' => 'required|exists:supplier_types,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'cartons_count' => 'required|integer|min:1',
            'units_per_carton' => 'required|integer|min:1',
            'weight' => 'nullable|numeric|min:0',
            'barcode' => 'required|string|unique:products,barcode,' . $product->id,
            'purchase_date' => 'required|date',
            'image' => 'nullable|image|max:2048',
        ], [
            'name.required' => 'اسم المنتج مطلوب',
            'supplier_type_id.required' => 'نوع المنتج مطلوب',
            'supplier_id.required' => 'المورد مطلوب',
            'purchase_price.required' => 'سعر الشراء مطلوب',
            'selling_price.required' => 'سعر البيع مطلوب',
            'cartons_count.required' => 'عدد الكراتين مطلوب',
            'units_per_carton.required' => 'عدد العلب في الكارتون مطلوب',
            'barcode.required' => 'الباركود مطلوب',
            'barcode.unique' => 'هذا الباركود موجود مسبقاً',
            'purchase_date.required' => 'تاريخ الشراء مطلوب',
            'image.image' => 'يجب أن يكون الملف صورة',
            'image.max' => 'حجم الصورة يجب أن يكون أقل من 2MB',
        ]);

        $data = $request->except('image');

        // رفع الصورة الجديدة إذا كانت موجودة
        if ($request->hasFile('image')) {
            // حذف الصورة القديمة
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }

            $imagePath = $request->file('image')->store('products', 'public');
            $data['image'] = $imagePath;
        }

        $product->update($data);

        return redirect()->route('admin.warehouse.index')->with('success', 'تم تحديث المنتج بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // حذف الصورة إذا كانت موجودة
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->route('admin.warehouse.index')->with('success', 'تم حذف المنتج بنجاح');
    }
}
