<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SalesRepresentative;
use App\Models\IncentivePlan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class SalesRepresentativeController extends Controller
{
    /**
     * عرض قائمة المندوبين
     */
    public function index()
    {
        $representatives = SalesRepresentative::with(['incentivePlans'])
            ->withCount(['customers', 'sales'])
            ->withSum('sales', 'total_amount')
            ->get()
            ->map(function ($rep) {
                return [
                    'id' => $rep->id,
                    'code' => $rep->code,
                    'name_ar' => $rep->name_ar,
                    'name_en' => $rep->name_en,
                    'email' => $rep->email,
                    'phone' => $rep->phone,
                    'national_id' => $rep->national_id,
                    'address' => $rep->address,
                    'city' => $rep->city,
                    'hire_date' => $rep->hire_date,
                    'birth_date' => $rep->birth_date,
                    'is_active' => $rep->is_active,
                    'base_salary' => $rep->base_salary,
                    'incentive_plan' => $rep->incentive_plan,
                    'monthly_target' => $rep->monthly_target,
                    'quarterly_target' => $rep->quarterly_target,
                    'annual_target' => $rep->annual_target,
                    'bank_account' => $rep->bank_account,
                    'bank_name' => $rep->bank_name,
                    'iban' => $rep->iban,
                    'customers_count' => $rep->customers_count ?? 0,
                    'sales_count' => $rep->sales_count ?? 0,
                    'total_sales' => $rep->sales_sum_total_amount ?? 0,
                    'total_commission' => $rep->total_commission,
                    'total_customers' => $rep->total_customers,
                    'avg_monthly_sales' => $rep->avg_monthly_sales,
                    'notes' => $rep->notes,
                    'incentive_plans' => $rep->incentivePlans->map(function ($plan) {
                        return [
                            'id' => $plan->id,
                            'name_ar' => $plan->name_ar,
                            'type' => $plan->type,
                            'configuration' => $plan->configuration,
                        ];
                    }),
                ];
            });

        $incentivePlans = IncentivePlan::where('is_active', true)
            ->select('id', 'name_ar', 'name_en', 'type', 'configuration', 'description')
            ->get();

        return Inertia::render('Admin/SalesRepresentatives/Index', [
            'representatives' => $representatives,
            'incentivePlans' => $incentivePlans,
        ]);
    }

    /**
     * إضافة مندوب جديد
     */
    public function store(Request $request)
    {
        // إضافة logging لمراقبة العملية
        \Log::info('بدء إضافة مندوب جديد', [
            'request_data' => $request->all(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        // التحقق من نوع الإضافة (سريعة أم كاملة)
        $isQuickAdd = $request->boolean('quick_add', false);

        // إذا لم يتم تحديد quick_add ولكن البيانات بسيطة، فهي إضافة سريعة
        if (!$isQuickAdd && !$request->has('hire_date') && !$request->has('national_id')) {
            $isQuickAdd = true;
        }

        \Log::info('نوع الإضافة', [
            'is_quick_add' => $isQuickAdd,
            'quick_add_raw' => $request->get('quick_add'),
            'all_request_keys' => array_keys($request->all()),
            'auto_detected_quick' => !$request->has('hire_date') && !$request->has('national_id')
        ]);

        if ($isQuickAdd) {
            // validation للإضافة السريعة
            $validated = $request->validate([
                'name_ar' => 'required|string|max:100',
                'phone' => 'required|string|max:20|unique:sales_representatives,phone',
                'password' => 'required|string|min:8',
                'address' => 'nullable|string',
                'is_active' => 'boolean',
            ]);

            \Log::info('نجح validation للإضافة السريعة', ['validated_data' => $validated]);

            // إضافة القيم الافتراضية للإضافة السريعة
            $validated['code'] = 'REP' . str_pad(SalesRepresentative::count() + 1, 4, '0', STR_PAD_LEFT);
            $validated['hire_date'] = now()->toDateString();
            $validated['base_salary'] = 0;
            $validated['incentive_plan'] = 'fixed_commission';
            $validated['incentive_settings'] = json_encode(['commission_rate' => 5.0]);
            $validated['monthly_target'] = 0;
            $validated['quarterly_target'] = 0;
            $validated['annual_target'] = 0;
            $validated['national_id'] = 'temp_' . time() . '_' . rand(1000, 9999);

            \Log::info('تم إضافة القيم الافتراضية للإضافة السريعة', ['final_data' => $validated]);

        } else {
            // validation للإضافة الكاملة
            $validated = $request->validate([
                'name_ar' => 'required|string|max:100',
                'name_en' => 'nullable|string|max:100',
                'email' => 'nullable|email|unique:sales_representatives,email',
                'phone' => 'required|string|max:20|unique:sales_representatives,phone',
                'password' => 'required|string|min:8',
                'national_id' => 'required|string|max:20|unique:sales_representatives,national_id',
                'address' => 'nullable|string',
                'city' => 'nullable|string|max:50',
                'hire_date' => 'required|date',
                'birth_date' => 'nullable|date',
                'base_salary' => 'required|numeric|min:0',
                'incentive_plan' => 'required|in:fixed_commission,tiered_commission,target_bonus',
                'incentive_settings' => 'nullable|json',
                'monthly_target' => 'required|numeric|min:0',
                'quarterly_target' => 'required|numeric|min:0',
                'annual_target' => 'required|numeric|min:0',
                'bank_account' => 'nullable|string|max:30',
                'bank_name' => 'nullable|string|max:100',
                'iban' => 'nullable|string|max:30',
                'is_active' => 'boolean',
                'notes' => 'nullable|string',
                'incentive_plans' => 'array',
                'incentive_plans.*' => 'exists:incentive_plans,id',
            ]);
        }

        // إضافة القيم المطلوبة في جميع الأحوال (حل للمشكلة الحالية)
        if (!isset($validated['hire_date'])) {
            $validated['hire_date'] = now()->toDateString();
        }
        if (!isset($validated['national_id'])) {
            $validated['national_id'] = 'temp_' . time() . '_' . rand(1000, 9999);
        }
        if (!isset($validated['code'])) {
            $validated['code'] = 'REP' . str_pad(SalesRepresentative::count() + 1, 4, '0', STR_PAD_LEFT);
        }

        try {
            DB::beginTransaction();

            \Log::info('بدء transaction لحفظ المندوب');

            // تحضير إعدادات الحوافز الافتراضية (للإضافة الكاملة فقط)
            if (!$isQuickAdd && empty($validated['incentive_settings'])) {
                switch ($validated['incentive_plan']) {
                    case 'fixed_commission':
                        $validated['incentive_settings'] = json_encode(['commission_rate' => 5.0]);
                        break;
                    case 'tiered_commission':
                        $validated['incentive_settings'] = json_encode([
                            'tiers' => [
                                ['min_amount' => 0, 'max_amount' => 100000, 'commission_rate' => 3.0],
                                ['min_amount' => 100001, 'max_amount' => 500000, 'commission_rate' => 5.0],
                                ['min_amount' => 500001, 'max_amount' => null, 'commission_rate' => 7.0],
                            ]
                        ]);
                        break;
                    case 'target_bonus':
                        $validated['incentive_settings'] = json_encode([
                            'base_commission_rate' => 3.0,
                            'bonus_commission_rate' => 2.0,
                            'achievement_threshold' => 100
                        ]);
                        break;
                }
            }

            // إنشاء المندوب
            $validated['password'] = Hash::make($validated['password']);

            // تسجيل البيانات بدون كلمة المرور للأمان
            $logData = $validated;
            unset($logData['password']);
            \Log::info('محاولة إنشاء المندوب', ['final_validated_data' => $logData]);

            $representative = SalesRepresentative::create($validated);

            \Log::info('تم إنشاء المندوب بنجاح', ['representative_id' => $representative->id, 'representative_code' => $representative->code]);

            // ربط خطط الحوافز (للإضافة الكاملة فقط)
            if (!$isQuickAdd && !empty($validated['incentive_plans'])) {
                $representative->incentivePlans()->attach($validated['incentive_plans']);
            }

            DB::commit();

            $message = $isQuickAdd
                ? 'تم إضافة المندوب بنجاح! يمكنك الآن إكمال بياناته.'
                : 'تم إضافة المندوب بنجاح';

            \Log::info('تمت العملية بنجاح', ['message' => $message, 'representative_id' => $representative->id]);

            // إعادة redirect back للحفاظ على الصفحة الحالية
            return redirect()->back()->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('خطأ في إضافة المندوب', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return redirect()->back()->with('error', 'حدث خطأ: ' . $e->getMessage());
        }
    }

    /**
     * تحديث بيانات مندوب
     */
    public function update(Request $request, SalesRepresentative $salesRepresentative)
    {
        $validated = $request->validate([
            'name_ar' => 'required|string|max:100',
            'name_en' => 'nullable|string|max:100',
            'email' => ['nullable', 'email', Rule::unique('sales_representatives')->ignore($salesRepresentative->id)],
            'phone' => ['required', 'string', 'max:20', Rule::unique('sales_representatives')->ignore($salesRepresentative->id)],
            'password' => 'nullable|string|min:8',
            'national_id' => ['required', 'string', 'max:20', Rule::unique('sales_representatives')->ignore($salesRepresentative->id)],
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:50',
            'hire_date' => 'required|date',
            'birth_date' => 'nullable|date',
            'base_salary' => 'required|numeric|min:0',
            'incentive_plan' => 'required|in:fixed_commission,tiered_commission,target_bonus',
            'incentive_settings' => 'nullable|json',
            'monthly_target' => 'required|numeric|min:0',
            'quarterly_target' => 'required|numeric|min:0',
            'annual_target' => 'required|numeric|min:0',
            'bank_account' => 'nullable|string|max:30',
            'bank_name' => 'nullable|string|max:100',
            'iban' => 'nullable|string|max:30',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
            'incentive_plans' => 'array',
            'incentive_plans.*' => 'exists:incentive_plans,id',
        ]);

        try {
            DB::beginTransaction();

            // تحديث بيانات المندوب
            $updateData = collect($validated)->except(['password', 'incentive_plans'])->toArray();

            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $salesRepresentative->update($updateData);

            // تحديث خطط الحوافز
            $salesRepresentative->incentivePlans()->sync($validated['incentive_plans'] ?? []);

            DB::commit();

            return redirect()->back()->with('success', 'تم تحديث بيانات المندوب بنجاح');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'حدث خطأ: ' . $e->getMessage());
        }
    }

    /**
     * تغيير حالة المندوب (نشط/غير نشط)
     */
    public function toggleStatus(SalesRepresentative $salesRepresentative)
    {
        try {
            $salesRepresentative->update([
                'is_active' => !$salesRepresentative->is_active
            ]);

            $status = $salesRepresentative->is_active ? 'نشط' : 'غير نشط';
            return redirect()->back()->with('success', "تم تغيير حالة المندوب إلى {$status}");

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'حدث خطأ: ' . $e->getMessage());
        }
    }

    /**
     * حذف مندوب
     */
    public function destroy(SalesRepresentative $salesRepresentative)
    {
        try {
            // التحقق من وجود عملاء أو مبيعات
            if ($salesRepresentative->customers()->count() > 0) {
                return redirect()->back()->with('error', 'لا يمكن حذف المندوب - يوجد عملاء مرتبطون به');
            }

            if ($salesRepresentative->sales()->count() > 0) {
                return redirect()->back()->with('error', 'لا يمكن حذف المندوب - يوجد مبيعات مرتبطة به');
            }

            // فصل خطط الحوافز
            $salesRepresentative->incentivePlans()->detach();

            // حذف المندوب
            $salesRepresentative->delete();

            return redirect()->back()->with('success', 'تم حذف المندوب بنجاح');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'حدث خطأ: ' . $e->getMessage());
        }
    }

    /**
     * عرض تفاصيل مندوب
     */
    public function show(SalesRepresentative $salesRepresentative)
    {
        $representative = $salesRepresentative->load([
            'customers' => function ($query) {
                $query->select('id', 'name_ar', 'name_en', 'phone', 'is_active', 'sales_representative_id');
            },
            'sales' => function ($query) {
                $query->select('id', 'invoice_number', 'total_amount', 'invoice_date', 'sales_representative_id')
                      ->latest('invoice_date')
                      ->limit(10);
            },
            'incentivePlans'
        ]);

        // حساب إحصائيات الأداء
        $currentMonth = now()->month;
        $currentYear = now()->year;

        $performance = [
            'total_customers' => $representative->customers()->count(),
            'active_customers' => $representative->customers()->where('is_active', true)->count(),
            'total_sales' => $representative->calculateAnnualSales($currentYear),
            'monthly_sales' => $representative->calculateMonthlySales($currentMonth, $currentYear),
            'quarterly_sales' => $representative->calculateQuarterlySales(ceil($currentMonth / 3), $currentYear),
            'sales_count' => $representative->sales()->count(),
            'monthly_sales_count' => $representative->sales()
                ->whereMonth('invoice_date', $currentMonth)
                ->whereYear('invoice_date', $currentYear)
                ->count(),
            'monthly_achievement' => $representative->getAchievementPercentage('monthly'),
            'quarterly_achievement' => $representative->getAchievementPercentage('quarterly'),
            'annual_achievement' => $representative->getAchievementPercentage('annual'),
        ];

        return Inertia::render('Admin/SalesRepresentatives/Show', [
            'representative' => $representative,
            'performance' => $performance,
        ]);
    }

    /**
     * تقرير أداء المندوبين
     */
    public function performanceReport(Request $request)
    {
        $month = $request->get('month', now()->format('Y-m'));
        $year = $request->get('year', now()->year);

        $representatives = SalesRepresentative::with(['incentivePlans'])
            ->withCount(['customers'])
            ->get()
            ->map(function ($rep) use ($month, $year) {
                $monthNum = (int) substr($month, -2);

                $monthlySales = $rep->calculateMonthlySales($monthNum, $year);
                $salesCount = $rep->sales()
                    ->whereMonth('invoice_date', $monthNum)
                    ->whereYear('invoice_date', $year)
                    ->count();

                // حساب الحوافز
                $totalIncentives = $rep->calculateCommission($monthlySales, 'monthly');

                // حساب نسب الإنجاز
                $monthlyAchievement = $rep->getAchievementPercentage('monthly', $monthNum, $year);
                $quarterlyAchievement = $rep->getAchievementPercentage('quarterly', $monthNum, $year);
                $annualAchievement = $rep->getAchievementPercentage('annual', $monthNum, $year);

                return [
                    'id' => $rep->id,
                    'code' => $rep->code,
                    'name_ar' => $rep->name_ar,
                    'name_en' => $rep->name_en,
                    'base_salary' => $rep->base_salary,
                    'customers_count' => $rep->customers_count,
                    'monthly_sales' => $monthlySales,
                    'sales_count' => $salesCount,
                    'total_incentives' => $totalIncentives,
                    'total_earnings' => $rep->base_salary + $totalIncentives,
                    'monthly_target' => $rep->monthly_target,
                    'quarterly_target' => $rep->quarterly_target,
                    'annual_target' => $rep->annual_target,
                    'monthly_achievement' => $monthlyAchievement,
                    'quarterly_achievement' => $quarterlyAchievement,
                    'annual_achievement' => $annualAchievement,
                    'is_active' => $rep->is_active,
                    'incentive_plan' => $rep->incentive_plan,
                ];
            });

        return Inertia::render('Admin/SalesRepresentatives/PerformanceReport', [
            'representatives' => $representatives,
            'selectedMonth' => $month,
            'selectedYear' => $year,
        ]);
    }
}
