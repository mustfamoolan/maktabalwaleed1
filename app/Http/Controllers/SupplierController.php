<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\Category;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Supplier::query();

        // البحث
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('categories', function($categoryQuery) use ($search) {
                      $categoryQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // فلتر حسب الفئات المتعددة
        if ($request->filled('category_id')) {
            $query->whereHas('categories', function($q) use ($request) {
                $q->where('categories.id', $request->category_id);
            });
        }

        $suppliers = $query->with('categories')->orderBy('created_at', 'desc')->paginate(15);
        $categories = Category::orderBy('name')->get();

        return view('admin.suppliers.index', compact('suppliers', 'categories'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Redirect to index since we're using modals
        return redirect()->route('admin.suppliers.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'categories' => 'array',
                'categories.*' => 'exists:categories,id'
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

        $supplier = Supplier::create([
            'name' => $validated['name'],
        ]);

        if ($request->has('categories')) {
            $supplier->categories()->attach($request->categories);
        }

        if ($request->ajax()) {
            return response()->json(['success' => true]);
        }

        return redirect()
            ->route('admin.suppliers.index')
            ->with('success', 'تم إضافة المورد بنجاح');
    }

    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier)
    {
        // Redirect to index since we're using modals
        return redirect()->route('admin.suppliers.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Supplier $supplier)
    {
        // Redirect to index since we're using modals
        return redirect()->route('admin.suppliers.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Supplier $supplier)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'categories' => 'array',
                'categories.*' => 'exists:categories,id'
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

        $supplier->update([
            'name' => $validated['name'],
        ]);

        // Update categories
        if ($request->has('categories')) {
            $supplier->categories()->sync($request->categories);
        } else {
            $supplier->categories()->detach();
        }

        if ($request->ajax()) {
            return response()->json(['success' => true]);
        }

        return redirect()
            ->route('admin.suppliers.index')
            ->with('success', 'تم تحديث المورد بنجاح');
    }

    public function editData(Supplier $supplier)
    {
        try {
            return response()->json([
                'id' => $supplier->id,
                'name' => $supplier->name,
                'categories' => $supplier->categories()->pluck('id')->toArray(),
                'category_names' => $supplier->categories()->pluck('name')->toArray(),
                'created_at' => $supplier->created_at->format('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'حدث خطأ في جلب البيانات',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return redirect()->route('admin.suppliers.index')
            ->with('success', 'تم حذف المورد بنجاح');
    }
}
