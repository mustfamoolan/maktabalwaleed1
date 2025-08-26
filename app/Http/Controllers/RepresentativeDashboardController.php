<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Representative;
use App\Models\SalaryPlanTarget;
use App\Models\MultiProductPlan;
use App\Models\RepresentativeCategoryPlan;
use Illuminate\Support\Facades\Auth;
use App\Models\RepresentativeSupplierPlan;
use App\Models\RepresentativeSalary;

class RepresentativeDashboardController extends Controller
{
    /**
     * عرض لوحة تحكم المندوب
     */
    public function index(Request $request)
    {
        // الحصول على بيانات المندوب من الجلسة
        $representative = Auth::guard('representative')->user();

        if (!$representative) {
            return redirect()->route('representatives.login');
        }

        // جلب الإحصائيات الأساسية للمندوب
        $statistics = [
            'total_customers' => 0, // سيتم تطويرها لاحقاً
            'total_orders' => 0,
            'total_sales' => 0,
            'monthly_achievement' => 0,
        ];

        return Inertia::render('RepresentativesPanel/Dashboard', [
            'representative_user' => $representative,
            'statistics' => $statistics
        ]);
    }

    /**
     * عرض صفحة الأهداف للمندوب
     */
    public function targets(Request $request)
    {
        // الحصول على بيانات المندوب من الجلسة
        $representative = Auth::guard('representative')->user();

        if (!$representative) {
            return redirect()->route('representatives.login');
        }

        // جلب جميع أنواع الأهداف والخطط للمندوب
        $representativeModel = Representative::find($representative->id);

        // الأهداف الفردية من SalaryPlanTargets
        $currentTargets = SalaryPlanTarget::with(['product', 'salaryPlan'])
            ->whereHas('salaryPlan', function($query) use ($representative) {
                $query->where('representative_id', $representative->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // الخطط متعددة المنتجات
        $multiProductPlans = MultiProductPlan::with(['products', 'planProducts'])
            ->where('representative_id', $representative->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // خطط الأقسام
        $categoryPlans = RepresentativeCategoryPlan::with('supplierCategory')
            ->where('representative_id', $representative->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // خطط الموردين
        $supplierPlans = RepresentativeSupplierPlan::with('supplier')
            ->where('representative_id', $representative->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('RepresentativesPanel/Targets', [
            'representative_user' => $representative,
            'currentTargets' => $currentTargets,
            'multiProductPlans' => $multiProductPlans,
            'categoryPlans' => $categoryPlans,
            'supplierPlans' => $supplierPlans
        ]);
    }

    /**
     * عرض صفحة الراتب والاستحقاقات للمندوب
     */
    public function salary(Request $request)
    {
        // الحصول على بيانات المندوب من الجلسة
        $representative = Auth::guard('representative')->user();

        if (!$representative) {
            return redirect()->route('representatives.login');
        }

        // جلب الراتب الحالي للمندوب
        $currentSalary = RepresentativeSalary::where('representative_id', $representative->id)
            ->where('is_active', true)
            ->first();

        // جلب جميع أنواع الأهداف لحساب الإنجاز العام
        $currentTargets = SalaryPlanTarget::with(['product', 'salaryPlan'])
            ->whereHas('salaryPlan', function($query) use ($representative) {
                $query->where('representative_id', $representative->id);
            })
            ->get();

        $multiProductPlans = MultiProductPlan::where('representative_id', $representative->id)->get();
        $categoryPlans = RepresentativeCategoryPlan::where('representative_id', $representative->id)->get();
        $supplierPlans = RepresentativeSupplierPlan::where('representative_id', $representative->id)->get();

        // حساب معدل الإنجاز العام
        $overallAchievement = $this->calculateOverallAchievement(
            $currentTargets,
            $multiProductPlans,
            $categoryPlans,
            $supplierPlans
        );

        // حساب الراتب المستحق بناءً على الإنجاز
        $earnedSalary = 0;
        $salaryPercentage = 0;

        if ($currentSalary) {
            $salaryPercentage = $overallAchievement;
            $earnedSalary = ($currentSalary->base_salary * $salaryPercentage) / 100;
        }

        return Inertia::render('RepresentativesPanel/Salary', [
            'representative_user' => $representative,
            'currentSalary' => $currentSalary,
            'overallAchievement' => $overallAchievement,
            'earnedSalary' => $earnedSalary,
            'salaryPercentage' => $salaryPercentage,
            'targetsCount' => [
                'individual' => $currentTargets->count(),
                'multiProduct' => $multiProductPlans->count(),
                'category' => $categoryPlans->count(),
                'supplier' => $supplierPlans->count(),
                'total' => $currentTargets->count() + $multiProductPlans->count() + $categoryPlans->count() + $supplierPlans->count()
            ]
        ]);
    }

    /**
     * حساب معدل الإنجاز العام لجميع أنواع الخطط
     */
    private function calculateOverallAchievement($currentTargets, $multiProductPlans, $categoryPlans, $supplierPlans)
    {
        $totalAchievement = 0;
        $totalPlans = 0;

        // حساب إنجاز الأهداف الفردية
        if ($currentTargets->count() > 0) {
            $targetsAchievement = $currentTargets->sum('achievement_percentage');
            $totalAchievement += $targetsAchievement;
            $totalPlans += $currentTargets->count();
        }

        // حساب إنجاز الخطط متعددة المنتجات
        if ($multiProductPlans->count() > 0) {
            $multiPlansAchievement = $multiProductPlans->sum('achievement_percentage');
            $totalAchievement += $multiPlansAchievement;
            $totalPlans += $multiProductPlans->count();
        }

        // حساب إنجاز خطط الأقسام
        if ($categoryPlans->count() > 0) {
            $categoryPlansAchievement = $categoryPlans->sum('achievement_percentage');
            $totalAchievement += $categoryPlansAchievement;
            $totalPlans += $categoryPlans->count();
        }

        // حساب إنجاز خطط الموردين
        if ($supplierPlans->count() > 0) {
            $supplierPlansAchievement = $supplierPlans->sum('achievement_percentage');
            $totalAchievement += $supplierPlansAchievement;
            $totalPlans += $supplierPlans->count();
        }

        // حساب المتوسط النهائي
        if ($totalPlans === 0) {
            return 0;
        }

        return round($totalAchievement / $totalPlans);
    }
}
