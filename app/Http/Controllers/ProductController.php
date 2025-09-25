<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Supplier;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::with(['supplier', 'category']);

        // البحث
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function($supplierQuery) use ($search) {
                      $supplierQuery->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('category', function($categoryQuery) use ($search) {
                      $categoryQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $products = $query->paginate(15);
        $suppliers = Supplier::all();
        $categories = Category::all();

        return view('admin.products.index', compact('products', 'suppliers', 'categories'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return redirect()->route('admin.products.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:255|unique:products,code',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'stock_quantity' => 'required|integer|min:0',
                'pieces_per_carton' => 'required|integer|min:1',
                'piece_weight' => 'required|numeric|min:0|max:99999.99',
                'carton_weight' => 'required|numeric|min:0',
                'supplier_id' => 'required|exists:suppliers,id',
                'category_id' => 'required|exists:categories,id',
                'purchase_price' => 'required|numeric|min:0',
                'sale_price' => 'required|numeric|min:0',
                'wholesale_price' => 'nullable|numeric|min:0',
                'last_purchase_date' => 'nullable|date',
                'last_sale_date' => 'nullable|date'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'errors' => $e->errors()
                ], 422);
            }
            throw $e;
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
            $validated['image'] = $imagePath;
        }

        $product = Product::create($validated);

        if ($request->ajax()) {
            return response()->json([
                'success' => true,
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'supplier_name' => $product->supplier->name ?? '',
                    'category_name' => $product->category->name ?? '',
                    'purchase_price' => $product->purchase_price,
                    'sale_price' => $product->sale_price,
                    'wholesale_price' => $product->wholesale_price ?? $product->sale_price
                ]
            ]);
        }

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'تم إضافة المادة بنجاح');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return redirect()->route('admin.products.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        return redirect()->route('admin.products.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:255|unique:products,code,' . $product->id,
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'stock_quantity' => 'required|integer|min:0',
                'pieces_per_carton' => 'required|integer|min:1',
                'piece_weight' => 'required|numeric|min:0|max:99999.99',
                'carton_weight' => 'required|numeric|min:0',
                'supplier_id' => 'required|exists:suppliers,id',
                'category_id' => 'required|exists:categories,id',
                'purchase_price' => 'required|numeric|min:0',
                'sale_price' => 'required|numeric|min:0',
                'wholesale_price' => 'nullable|numeric|min:0',
                'last_purchase_date' => 'nullable|date',
                'last_sale_date' => 'nullable|date'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'errors' => $e->errors()
                ], 422);
            }
            throw $e;
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image) {
                \Storage::disk('public')->delete($product->image);
            }
            $imagePath = $request->file('image')->store('products', 'public');
            $validated['image'] = $imagePath;
        }

        $product->update($validated);

        if ($request->ajax()) {
            return response()->json(['success' => true]);
        }

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'تم تحديث المادة بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Delete image if exists
        if ($product->image) {
            \Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'تم حذف المادة بنجاح');
    }

    public function search(Request $request)
    {
        $search = $request->get('q', '');

        if (empty($search)) {
            return response()->json([]);
        }

        $products = Product::with(['supplier', 'category'])
            ->where(function($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
            })
            ->limit(10)
            ->get()
            ->map(function($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'code' => $product->code,
                    'supplier_name' => $product->supplier->name ?? '',
                    'category_name' => $product->category->name ?? '',
                    'stock_quantity' => $product->stock_quantity,
                    'pieces_per_carton' => $product->pieces_per_carton,
                    'piece_weight' => $product->piece_weight,
                    'carton_weight' => $product->carton_weight,
                    'purchase_price' => $product->purchase_price,
                    'sale_price' => $product->sale_price,
                    'wholesale_price' => $product->wholesale_price ?? $product->sale_price,
                    'image' => $product->image ? asset('storage/' . $product->image) : null
                ];
            });

        return response()->json($products);
    }

    public function storeAjax(Request $request)
    {
        return $this->store($request);
    }

    public function productData(Product $product)
    {
        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'code' => $product->code,
            'image' => $product->image,
            'stock_quantity' => $product->stock_quantity,
            'pieces_per_carton' => $product->pieces_per_carton,
            'piece_weight' => $product->piece_weight,
            'carton_weight' => $product->carton_weight,
            'supplier_id' => $product->supplier_id,
            'supplier_name' => $product->supplier->name ?? '',
            'category_id' => $product->category_id,
            'category_name' => $product->category->name ?? '',
            'purchase_price' => $product->purchase_price,
            'sale_price' => $product->sale_price,
            'last_purchase_date' => $product->last_purchase_date?->format('Y-m-d'),
            'last_sale_date' => $product->last_sale_date?->format('Y-m-d'),
            'created_at' => $product->created_at->format('Y-m-d H:i:s')
        ]);
    }
}
