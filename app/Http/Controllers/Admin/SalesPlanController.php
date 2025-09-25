<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SalesPlan;
use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Representative;
use Illuminate\Http\Request;

class SalesPlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $salesPlans = SalesPlan::with('targetable')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return view('admin.sales-plans.index', compact('salesPlans'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $products = Product::orderBy('name')->get();
        $categories = Category::orderBy('name')->get();
        $suppliers = Supplier::orderBy('name')->get();

        return view('admin.sales-plans.create', compact('products', 'categories', 'suppliers'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'representative_id' => 'required|exists:representatives,id',
            'category_id' => 'required|exists:categories,id',
            'target_quantity' => 'required|numeric|min:0',
            'commission_rate' => 'required|numeric|min:0|max:100',
            'achievement_bonus' => 'nullable|numeric|min:0',
            'period_type' => 'required|in:monthly,annual',
        ]);

        // إنشاء خطة البيع الجديدة
        $startDate = now()->startOfMonth();
        $endDate = $request->period_type === 'monthly' ?
            now()->endOfMonth() :
            now()->endOfYear();

        SalesPlan::create([
            'representative_id' => $request->representative_id,
            'name' => 'خطة ' . Category::find($request->category_id)->name . ' - ' . Representative::find($request->representative_id)->name,
            'plan_type' => 'category',
            'target_id' => $request->category_id,
            'target_quantity' => $request->target_quantity,
            'required_achievement_rate' => $request->commission_rate,
            'bonus_per_extra_unit' => $request->achievement_bonus ?? 0,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'is_active' => true,
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'تم حفظ الخطة بنجاح'
            ]);
        }

        return redirect()->route('admin.sales-plans.index')
            ->with('success', 'تم إضافة خطة البيع بنجاح');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $salesPlan = SalesPlan::with('targetable')->findOrFail($id);
        return view('admin.sales-plans.show', compact('salesPlan'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $salesPlan = SalesPlan::findOrFail($id);
        $products = Product::orderBy('name')->get();
        $categories = Category::orderBy('name')->get();
        $suppliers = Supplier::orderBy('name')->get();

        return view('admin.sales-plans.edit', compact('salesPlan', 'products', 'categories', 'suppliers'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $salesPlan = SalesPlan::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'plan_type' => 'required|in:product,category,supplier',
            'target_id' => 'required|integer',
            'target_quantity' => 'required|numeric|min:0',
            'required_achievement_rate' => 'required|numeric|min:0|max:100',
            'bonus_per_extra_unit' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
        ]);

        // تحديد نوع الهدف
        $targetClass = match($request->plan_type) {
            'product' => Product::class,
            'category' => SupplierCategory::class,
            'supplier' => Supplier::class,
        };

        // التحقق من وجود الهدف
        $target = $targetClass::findOrFail($request->target_id);

        $salesPlan->update([
            'name' => $request->name,
            'plan_type' => $request->plan_type,
            'targetable_type' => $targetClass,
            'targetable_id' => $request->target_id,
            'target_quantity' => $request->target_quantity,
            'required_achievement_rate' => $request->required_achievement_rate,
            'bonus_per_extra_unit' => $request->bonus_per_extra_unit ?? 0,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'is_active' => $request->boolean('is_active', $salesPlan->is_active),
        ]);

        return redirect()->route('admin.sales-plans.index')
            ->with('success', 'تم تحديث خطة البيع بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id, Request $request)
    {
        $salesPlan = SalesPlan::findOrFail($id);
        $salesPlan->delete();

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'تم حذف الخطة بنجاح'
            ]);
        }

        return redirect()->route('admin.sales-plans.index')
            ->with('success', 'تم حذف خطة البيع بنجاح');
    }

    /**
     * تفعيل/إلغاء تفعيل خطة البيع
     */
    public function toggleStatus(SalesPlan $plan, Request $request)
    {
        $plan->update([
            'is_active' => $request->boolean('is_active')
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث حالة الخطة بنجاح'
        ]);
    }
}
