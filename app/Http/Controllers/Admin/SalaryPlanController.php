<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SalaryPlan;
use App\Models\SalaryPlanTarget;
use App\Models\Representative;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalaryPlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $salaryPlans = SalaryPlan::with(['representative', 'targets.product'])
            ->orderBy('created_at', 'desc')
            ->get();

        $representatives = Representative::active()->get();

        return Inertia::render('Admin/SalaryPlans/Index', [
            'salaryPlans' => $salaryPlans,
            'representatives' => $representatives
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $representatives = Representative::select('id', 'name', 'phone')->get();
        $products = Product::with('supplier:id,name_ar,name_en')->get();

        return Inertia::render('Admin/SalaryPlans/Create', [
            'representatives' => $representatives,
            'products' => $products
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(SalaryPlan $salaryPlan)
    {
        $salaryPlan->load(['representative', 'targets.product.supplier']);

        return Inertia::render('Admin/SalaryPlans/Show', [
            'salaryPlan' => $salaryPlan
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SalaryPlan $salaryPlan)
    {
        $salaryPlan->load(['representative', 'targets.product']);
        $representatives = Representative::select('id', 'name', 'phone')->get();
        $products = Product::with('supplier:id,name_ar,name_en')->get();

        return Inertia::render('Admin/SalaryPlans/Edit', [
            'salaryPlan' => $salaryPlan,
            'representatives' => $representatives,
            'products' => $products
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'representative_id' => 'required|exists:representatives,id',
            'plan_name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'notes' => 'nullable|string|max:500',
            'targets' => 'required|array|min:1',
            'targets.*.product_id' => 'required|exists:products,id',
            'targets.*.target_quantity' => 'required|integer|min:1',
            'targets.*.required_percentage' => 'required|numeric|min:1|max:100'
        ]);

        $salaryPlan = SalaryPlan::create([
            'representative_id' => $validated['representative_id'],
            'plan_name' => $validated['plan_name'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'notes' => $validated['notes']
        ]);

        // إضافة الأهداف
        foreach ($validated['targets'] as $target) {
            SalaryPlanTarget::create([
                'salary_plan_id' => $salaryPlan->id,
                'product_id' => $target['product_id'],
                'target_quantity' => $target['target_quantity'],
                'required_percentage' => $target['required_percentage']
            ]);
        }

        return redirect()->back()->with('success', 'تم إنشاء خطة الراتب بنجاح');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SalaryPlan $salaryPlan)
    {
        $validated = $request->validate([
            'plan_name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'notes' => 'nullable|string|max:500',
            'is_active' => 'boolean'
        ]);

        $salaryPlan->update($validated);

        return redirect()->back()->with('success', 'تم تحديث خطة الراتب بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SalaryPlan $salaryPlan)
    {
        $salaryPlan->delete();

        return redirect()->back()->with('success', 'تم حذف خطة الراتب بنجاح');
    }

    /**
     * Get products for creating salary plan targets.
     */
    public function getProducts()
    {
        $products = Product::select('id', 'name', 'barcode', 'supplier_id')
            ->with('supplier:id,name_ar,name_en')
            ->get();

        return response()->json($products);
    }

    /**
     * Update target achievement manually.
     */
    public function updateTargetAchievement(Request $request, SalaryPlanTarget $target)
    {
        $validated = $request->validate([
            'achieved_quantity' => 'required|integer|min:0'
        ]);

        $target->updateAchievement($validated['achieved_quantity']);

        return redirect()->back()->with('success', 'تم تحديث إنجاز الهدف بنجاح');
    }

    /**
     * Toggle salary plan status.
     */
    public function toggleStatus(SalaryPlan $salaryPlan)
    {
        $salaryPlan->update([
            'is_active' => !$salaryPlan->is_active
        ]);

        $status = $salaryPlan->is_active ? 'تم تفعيل' : 'تم إلغاء تفعيل';
        return redirect()->back()->with('success', $status . ' خطة الراتب بنجاح');
    }
}
