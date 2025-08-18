<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Representative;
use App\Models\RepresentativeSalaryPlan;
use App\Models\RepresentativeTarget;
use App\Models\RepresentativeSale;
use App\Models\Supplier;
use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class RepresentativeManagementController extends Controller
{
    /**
     * عرض صفحة إدارة المندوب مع خطط الراتب والأهداف
     */
    public function show(Representative $representative)
    {
        $representative->load([
            'currentSalaryPlan',
            'currentTargets.supplier',
            'sales' => function($q) {
                $q->latest()->take(10);
            }
        ]);

        $monthlyPerformance = $representative->monthlyPerformance();

        return inertia('Admin/Representatives/Management', [
            'representative' => $representative,
            'salary_plan' => $representative->currentSalaryPlan,
            'targets' => $representative->currentTargets,
            'recent_sales' => $representative->sales,
            'monthly_performance' => $monthlyPerformance,
            'suppliers' => Supplier::active()->get(['id', 'company_name'])->map(function($supplier) {
                return [
                    'id' => $supplier->id,
                    'name' => $supplier->company_name
                ];
            }),
            'product_categories' => [
                'food' => 'مواد غذائية',
                'cleaning' => 'مواد تنظيف',
                'mixed' => 'مختلط',
                'other' => 'أخرى'
            ]
        ]);
    }

    /**
     * حفظ أو تحديث خطة الراتب
     */
    public function storeSalaryPlan(Request $request, Representative $representative)
    {
        $validator = Validator::make($request->all(), [
            'base_salary' => 'required|numeric|min:0',
            'minimum_achievement_percentage' => 'required|numeric|min:0|max:100',
            'incentive_plan_type' => 'required|in:specific_targets,total_target,commission,mixed',
            'total_target_boxes' => 'nullable|integer|min:1',
            'amount_per_box' => 'nullable|numeric|min:0',
            'commission_enabled' => 'boolean',
            'default_commission_percentage' => 'nullable|numeric|min:0|max:100',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'notes' => 'nullable|string|max:1000'
        ], [
            'base_salary.required' => 'الراتب الأساسي مطلوب',
            'base_salary.numeric' => 'الراتب الأساسي يجب أن يكون رقماً',
            'minimum_achievement_percentage.required' => 'نسبة التحقيق المطلوبة مطلوبة',
            'incentive_plan_type.required' => 'نوع خطة الحوافز مطلوب',
            'effective_from.required' => 'تاريخ بداية الخطة مطلوب'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // إلغاء تفعيل الخطط السابقة
        $representative->salaryPlans()->where('is_active', true)->update(['is_active' => false]);

        // إنشاء خطة جديدة
        $salaryPlan = $representative->salaryPlans()->create($request->all());

        return back()->with('success', 'تم حفظ خطة الراتب بنجاح');
    }

    /**
     * حفظ هدف جديد
     */
    public function storeTarget(Request $request, Representative $representative)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'nullable|exists:suppliers,id',
            'product_category' => 'required|in:food,cleaning,mixed,other',
            'category_name' => 'nullable|string|max:255',
            'target_quantity' => 'required|integer|min:1',
            'unit_type' => 'required|string|max:50',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start',
            'period_type' => 'required|in:monthly,quarterly,custom',
            'incentive_amount' => 'nullable|numeric|min:0',
            'bonus_percentage' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string|max:1000'
        ], [
            'product_category.required' => 'تصنيف المنتج مطلوب',
            'target_quantity.required' => 'الكمية المستهدفة مطلوبة',
            'period_start.required' => 'تاريخ بداية الفترة مطلوب',
            'period_end.required' => 'تاريخ نهاية الفترة مطلوب'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $target = $representative->targets()->create($request->all());
        $target->updateAchievement(); // تحديث التحقيق الحالي

        return back()->with('success', 'تم إضافة الهدف بنجاح');
    }

    /**
     * تحديث هدف موجود
     */
    public function updateTarget(Request $request, Representative $representative, RepresentativeTarget $target)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'nullable|exists:suppliers,id',
            'product_category' => 'required|in:food,cleaning,mixed,other',
            'category_name' => 'nullable|string|max:255',
            'target_quantity' => 'required|integer|min:1',
            'unit_type' => 'required|string|max:50',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start',
            'period_type' => 'required|in:monthly,quarterly,custom',
            'incentive_amount' => 'nullable|numeric|min:0',
            'bonus_percentage' => 'nullable|numeric|min:0|max:100',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $target->update($request->all());
        $target->updateAchievement(); // إعادة حساب التحقيق

        return back()->with('success', 'تم تحديث الهدف بنجاح');
    }

    /**
     * حذف هدف
     */
    public function deleteTarget(Representative $representative, RepresentativeTarget $target)
    {
        $target->delete();
        return back()->with('success', 'تم حذف الهدف بنجاح');
    }

    /**
     * إضافة مبيعة جديدة
     */
    public function storeSale(Request $request, Representative $representative)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'nullable|exists:products,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'invoice_number' => 'nullable|string|max:100',
            'sale_date' => 'required|date',
            'customer_name' => 'required|string|max:255',
            'customer_address' => 'nullable|string|max:500',
            'customer_phone' => 'nullable|string|max:20',
            'product_name' => 'required|string|max:255',
            'product_category' => 'required|in:food,cleaning,mixed,other',
            'quantity_sold' => 'required|integer|min:1',
            'unit_type' => 'required|string|max:50',
            'unit_cost_price' => 'required|numeric|min:0',
            'unit_selling_price' => 'required|numeric|min:0',
            'commission_amount' => 'nullable|numeric|min:0',
            'sale_status' => 'required|in:pending,confirmed,delivered,returned,cancelled',
            'payment_status' => 'required|in:pending,partial,paid,overdue',
            'paid_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000'
        ], [
            'sale_date.required' => 'تاريخ البيع مطلوب',
            'customer_name.required' => 'اسم العميل مطلوب',
            'product_name.required' => 'اسم المنتج مطلوب',
            'quantity_sold.required' => 'الكمية المباعة مطلوبة',
            'unit_cost_price.required' => 'سعر التكلفة مطلوب',
            'unit_selling_price.required' => 'سعر البيع مطلوب'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $saleData = $request->all();
        $saleData['representative_id'] = $representative->id;

        $sale = RepresentativeSale::create($saleData);
        $sale->calculateAmounts(); // حساب المبالغ تلقائياً

        return back()->with('success', 'تم إضافة المبيعة بنجاح');
    }

    /**
     * تحديث جميع الأهداف للمندوب
     */
    public function refreshTargets(Representative $representative)
    {
        $targets = $representative->targets()->active()->get();

        foreach ($targets as $target) {
            $target->updateAchievement();
        }

        return back()->with('success', 'تم تحديث جميع الأهداف بنجاح');
    }

    /**
     * تقرير أداء المندوب
     */
    public function performanceReport(Representative $representative, Request $request)
    {
        $year = $request->get('year', now()->year);
        $month = $request->get('month', now()->month);

        $performance = $representative->monthlyPerformance($year, $month);

        return inertia('Admin/Representatives/PerformanceReport', [
            'representative' => $representative,
            'performance' => $performance,
            'year' => $year,
            'month' => $month
        ]);
    }
}
