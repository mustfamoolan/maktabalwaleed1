<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Supplier;
use App\Models\SupplierType;
use Inertia\Inertia;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $suppliers = Supplier::with('supplierTypes')->get();
        $supplierTypes = SupplierType::active()->get();

        return Inertia::render('Admin/Suppliers', [
            'suppliers' => $suppliers,
            'supplierTypes' => $supplierTypes,
            'admin_user' => session('admin_user')
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'supplier_type_ids' => 'required|array|min:1',
            'supplier_type_ids.*' => 'exists:supplier_types,id',
        ], [
            'company_name.required' => 'اسم الشركة مطلوب',
            'company_name.max' => 'اسم الشركة يجب أن يكون أقل من 255 حرف',
            'supplier_type_ids.required' => 'يجب اختيار نوع واحد على الأقل',
            'supplier_type_ids.min' => 'يجب اختيار نوع واحد على الأقل',
            'supplier_type_ids.*.exists' => 'نوع المورد المحدد غير صالح',
        ]);

        $supplier = Supplier::create([
            'company_name' => $request->company_name,
            'is_active' => true,
        ]);

        $supplier->supplierTypes()->attach($request->supplier_type_ids);

        return redirect()->route('admin.suppliers.index')->with('success', 'تم إضافة المورد بنجاح');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $supplier = Supplier::findOrFail($id);

        $request->validate([
            'company_name' => 'required|string|max:255',
            'supplier_type_ids' => 'required|array|min:1',
            'supplier_type_ids.*' => 'exists:supplier_types,id',
        ], [
            'company_name.required' => 'اسم الشركة مطلوب',
            'company_name.max' => 'اسم الشركة يجب أن يكون أقل من 255 حرف',
            'supplier_type_ids.required' => 'يجب اختيار نوع واحد على الأقل',
            'supplier_type_ids.min' => 'يجب اختيار نوع واحد على الأقل',
            'supplier_type_ids.*.exists' => 'نوع المورد المحدد غير صالح',
        ]);

        $supplier->update([
            'company_name' => $request->company_name,
        ]);

        $supplier->supplierTypes()->sync($request->supplier_type_ids);

        return redirect()->route('admin.suppliers.index')->with('success', 'تم تحديث المورد بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->supplierTypes()->detach();
        $supplier->delete();

        return redirect()->route('admin.suppliers.index')->with('success', 'تم حذف المورد بنجاح');
    }
}
