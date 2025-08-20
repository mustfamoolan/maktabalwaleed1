<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupplierCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = SupplierCategory::orderBy('sort_order')
            ->orderBy('name_ar')
            ->get();

        return Inertia::render('Admin/SupplierCategories/Index', [
            'categories' => $categories
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/SupplierCategories/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name_ar' => 'required|string|max:100',
            'name_en' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'color_code' => 'nullable|string|regex:/^#[a-fA-F0-9]{6}$/',
            'sort_order' => 'nullable|integer|min:0'
        ]);

        $category = SupplierCategory::create([
            'name_ar' => $request->name_ar,
            'name_en' => $request->name_en,
            'description' => $request->description,
            'commission_rate' => $request->commission_rate ?? 0,
            'color_code' => $request->color_code ?? '#007bff',
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => true
        ]);

        return redirect()->route('admin.supplier-categories.index')
            ->with('success', 'تم إنشاء فئة المورد بنجاح');
    }

    /**
     * Display the specified resource.
     */
    public function show(SupplierCategory $supplierCategory)
    {
        $supplierCategory->load('suppliers');

        return Inertia::render('Admin/SupplierCategories/Show', [
            'category' => $supplierCategory
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SupplierCategory $supplierCategory)
    {
        return Inertia::render('Admin/SupplierCategories/Edit', [
            'category' => $supplierCategory
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SupplierCategory $supplierCategory)
    {
        $request->validate([
            'name_ar' => 'required|string|max:100',
            'name_en' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'color_code' => 'nullable|string|regex:/^#[a-fA-F0-9]{6}$/',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean'
        ]);

        $supplierCategory->update([
            'name_ar' => $request->name_ar,
            'name_en' => $request->name_en,
            'description' => $request->description,
            'commission_rate' => $request->commission_rate ?? 0,
            'color_code' => $request->color_code ?? '#007bff',
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->is_active ?? true
        ]);

        return redirect()->route('admin.supplier-categories.index')
            ->with('success', 'تم تحديث فئة المورد بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SupplierCategory $supplierCategory)
    {
        // التحقق من وجود موردين مرتبطين
        if ($supplierCategory->suppliers()->count() > 0) {
            return redirect()->route('admin.supplier-categories.index')
                ->with('error', 'لا يمكن حذف فئة المورد لوجود موردين مرتبطين بها');
        }

        $supplierCategory->delete();

        return redirect()->route('admin.supplier-categories.index')
            ->with('success', 'تم حذف فئة المورد بنجاح');
    }
}
