<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Representative;
use App\Models\RepresentativeSalary;
use App\Models\SalaryPlan;
use App\Models\Product;
use App\Models\MultiProductPlan;
use App\Models\MultiProductPlanProduct;
use App\Models\RepresentativeCategoryPlan;
use App\Models\RepresentativeSupplierPlan;
use App\Models\SupplierCategory;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RepresentativeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $representatives = Representative::with(['salaryPlans.targets'])
            ->orderBy('name')
            ->get()
            ->map(function ($representative) {
                // حساب نسبة الإنجاز الإجمالية لجميع الأهداف
                $totalTargets = 0;
                $totalAchievement = 0;

                foreach ($representative->salaryPlans as $plan) {
                    // جلب الأهداف من جميع الخطط (النشطة وغير النشطة)
                    foreach ($plan->targets as $target) {
                        $totalTargets++;
                        $totalAchievement += $target->achievement_percentage ?? 0;
                    }
                }

                // حساب المتوسط
                $representative->overall_achievement_percentage = $totalTargets > 0
                    ? round($totalAchievement / $totalTargets, 1)
                    : 0;

                // إضافة عدد الأهداف للمندوب
                $representative->total_targets_count = $totalTargets;

                return $representative;
            });

        return Inertia::render('Admin/Representatives/Index', [
            'representatives' => $representatives
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:representatives,phone|max:20',
            'password' => 'required|string|min:6',
            'address' => 'nullable|string|max:500',
            'is_active' => 'boolean'
        ]);

        // تشفير كلمة المرور
        $validated['password'] = bcrypt($validated['password']);

        Representative::create($validated);

        return redirect()->back()->with('success', 'تم إضافة المندوب بنجاح');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Representative $representative)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:representatives,phone,' . $representative->id . '|max:20',
            'password' => 'nullable|string|min:6', // اختياري في التعديل
            'address' => 'nullable|string|max:500',
            'is_active' => 'boolean'
        ]);

        // إذا تم إدخال كلمة مرور جديدة، قم بتشفيرها
        if (!empty($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            // إذا لم يتم إدخال كلمة مرور، احذف المفتاح من البيانات المراد تحديثها
            unset($validated['password']);
        }

        $representative->update($validated);

        return redirect()->back()->with('success', 'تم تحديث المندوب بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Representative $representative)
    {
        $representative->delete();

        return redirect()->back()->with('success', 'تم حذف المندوب بنجاح');
    }

    /**
     * Toggle representative status.
     */
    public function toggleStatus(Representative $representative)
    {
        $representative->update([
            'is_active' => !$representative->is_active
        ]);

        $status = $representative->is_active ? 'تم تفعيل' : 'تم إلغاء تفعيل';
        return redirect()->back()->with('success', $status . ' المندوب بنجاح');
    }

    /**
     * Show representative profile page with all details.
     */
    public function profile(Representative $representative)
    {
        $representative->load([
            'salaries' => function($query) {
                $query->orderBy('created_at', 'desc');
            },
            'salaryPlans' => function($query) {
                $query->with(['targets' => function($targetQuery) {
                    $targetQuery->with(['product' => function($productQuery) {
                        $productQuery->with('supplier:id,name_ar,name_en');
                    }]);
                }])
                ->orderBy('created_at', 'desc');
            },
            'multiProductPlans' => function($query) {
                $query->with(['planProducts.product.supplier'])
                ->orderBy('created_at', 'desc');
            },
            'categoryPlans' => function($query) {
                $query->with('supplierCategory')
                ->orderBy('created_at', 'desc');
            },
            'supplierPlans' => function($query) {
                $query->with('supplier')
                ->orderBy('created_at', 'desc');
            }
        ]);

        $products = Product::with('supplier:id,name_ar,name_en')->get();

        // استخراج جميع الأهداف من جميع الخطط (النشطة وغير النشطة)
        $currentTargets = collect();
        foreach($representative->salaryPlans as $plan) {
            // جلب الأهداف من جميع الخطط بغض النظر عن حالة النشاط
            foreach($plan->targets as $target) {
                $currentTargets->push([
                    'id' => $target->id,
                    'product_id' => $target->product_id,
                    'product' => $target->product,
                    'quantity' => $target->target_quantity,
                    'required_percentage' => $target->required_percentage,
                    'target_date' => $target->target_date ?? $plan->end_date->format('Y-m-d'),
                    'achieved_quantity' => $target->achieved_quantity ?? 0,
                    'achievement_percentage' => $target->achievement_percentage ?? 0,
                    'is_achieved' => $target->is_achieved ?? false,
                    'plan_name' => $plan->plan_name,
                    'plan_active' => $plan->is_active,
                    'type' => 'single' // نوع الهدف
                ]);
            }
        }

        // تحديث نسبة الإنجاز للخطط متعددة المنتجات
        foreach($representative->multiProductPlans as $multiPlan) {
            $multiPlan->updateCompletionStatus();
        }

        return Inertia::render('Admin/Representatives/Profile', [
            'representative' => $representative,
            'products' => $products->toArray(),
            'currentTargets' => $currentTargets->values()->toArray(),
            'multiProductPlans' => $representative->multiProductPlans ? $representative->multiProductPlans->toArray() : [],
            'categoryPlans' => $representative->categoryPlans ? $representative->categoryPlans->toArray() : [],
            'supplierPlans' => $representative->supplierPlans ? $representative->supplierPlans->toArray() : []
        ]);
    }

    /**
     * Store salary for representative.
     */
    public function storeSalary(Request $request, Representative $representative)
    {
        $validated = $request->validate([
            'base_salary' => 'required|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'effective_date' => 'required|date',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:500'
        ]);

        $validated['representative_id'] = $representative->id;

        RepresentativeSalary::create($validated);

        return redirect()->back()->with('success', 'تم إضافة الراتب بنجاح');
    }

    /**
     * Update salary for representative.
     */
    public function updateSalary(Request $request, Representative $representative, RepresentativeSalary $salary)
    {
        $validated = $request->validate([
            'base_salary' => 'required|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'effective_date' => 'required|date',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:500'
        ]);

        $salary->update($validated);

        return redirect()->back()->with('success', 'تم تحديث الراتب بنجاح');
    }

    /**
     * Delete salary for representative.
     */
    public function destroySalary(Representative $representative, RepresentativeSalary $salary)
    {
        $salary->delete();

        return redirect()->back()->with('success', 'تم حذف الراتب بنجاح');
    }

    /**
     * Store plan for representative.
     */
    public function storePlan(Request $request, Representative $representative)
    {
        $validated = $request->validate([
            'plan_name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'notes' => 'nullable|string|max:500',
            'targets' => 'required|array|min:1',
            'targets.*.product_id' => 'required|exists:products,id',
            'targets.*.target_quantity' => 'required|integer|min:1',
            'targets.*.required_percentage' => 'required|numeric|min:1|max:100'
        ]);

        $validated['representative_id'] = $representative->id;

        $salaryPlan = SalaryPlan::create([
            'representative_id' => $validated['representative_id'],
            'plan_name' => $validated['plan_name'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'notes' => $validated['notes']
        ]);

        foreach ($validated['targets'] as $targetData) {
            $salaryPlan->targets()->create($targetData);
        }

        return redirect()->back()->with('success', 'تم إضافة الخطة بنجاح');
    }

    /**
     * Update plan for representative.
     */
    public function updatePlan(Request $request, Representative $representative, SalaryPlan $plan)
    {
        $validated = $request->validate([
            'plan_name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'notes' => 'nullable|string|max:500',
            'is_active' => 'boolean'
        ]);

        $plan->update($validated);

        return redirect()->back()->with('success', 'تم تحديث الخطة بنجاح');
    }

    /**
     * Delete plan for representative.
     */
    public function destroyPlan(Representative $representative, SalaryPlan $plan)
    {
        $plan->delete();

        return redirect()->back()->with('success', 'تم حذف الخطة بنجاح');
    }

    /**
     * Show salary plans for a specific representative.
     */
    public function salaryPlans(Representative $representative)
    {
        $salaryPlans = SalaryPlan::with(['targets.product'])
            ->where('representative_id', $representative->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Representatives/SalaryPlans', [
            'representative' => $representative,
            'salaryPlans' => $salaryPlans
        ]);
    }

    /**
     * Store targets for representative.
     */
    public function storeTargets(Request $request, $id)
    {
        // محاولة كتابة ملف log للتأكد من وصول الطلب
        $logFile = storage_path('logs/targets_debug.log');

        // التأكد من وجود المجلد
        if (!file_exists(dirname($logFile))) {
            mkdir(dirname($logFile), 0755, true);
        }

        file_put_contents($logFile, "========== NEW REQUEST ==========\n", FILE_APPEND);
        file_put_contents($logFile, "Request received at: " . now() . "\n", FILE_APPEND);
        file_put_contents($logFile, "Representative ID: " . $id . "\n", FILE_APPEND);
        file_put_contents($logFile, "Request method: " . $request->method() . "\n", FILE_APPEND);
        file_put_contents($logFile, "Request URL: " . $request->url() . "\n", FILE_APPEND);
        file_put_contents($logFile, "Request data: " . json_encode($request->all()) . "\n", FILE_APPEND);
        file_put_contents($logFile, "Headers: " . json_encode($request->headers->all()) . "\n", FILE_APPEND);

        try {
            $representative = Representative::findOrFail($id);
            file_put_contents($logFile, "Representative found: " . $representative->name . "\n", FILE_APPEND);

            // تحقق بسيط
            if (!$request->has('targets') || empty($request->targets)) {
                file_put_contents($logFile, "No targets found in request\n", FILE_APPEND);
                return response()->json([
                    'success' => false,
                    'message' => 'لا توجد أهداف للحفظ'
                ], 400);
            }

            file_put_contents($logFile, "Targets found: " . count($request->targets) . "\n", FILE_APPEND);

            // البحث عن الخطة النشطة أو إنشاء واحدة جديدة
            $activePlan = $representative->salaryPlans()->where('is_active', true)->first();

            if (!$activePlan) {
                file_put_contents($logFile, "No active plan found, creating new one\n", FILE_APPEND);
                $activePlan = $representative->salaryPlans()->create([
                    'plan_name' => 'خطة الأهداف الافتراضية - ' . now()->format('Y-m-d'),
                    'start_date' => now(),
                    'end_date' => now()->addMonth(),
                    'is_active' => true
                ]);
                file_put_contents($logFile, "New plan created with ID: " . $activePlan->id . "\n", FILE_APPEND);
            } else {
                file_put_contents($logFile, "Active plan found with ID: " . $activePlan->id . "\n", FILE_APPEND);
            }

            // إضافة الأهداف الجديدة بدون حذف القديمة
            file_put_contents($logFile, "Adding new targets without deleting old ones\n", FILE_APPEND);

            // إنشاء الأهداف الجديدة
            $savedTargets = [];
            foreach ($request->targets as $targetData) {
                file_put_contents($logFile, "Creating target for product: " . $targetData['product_id'] . "\n", FILE_APPEND);

                $target = $activePlan->targets()->create([
                    'product_id' => $targetData['product_id'],
                    'target_quantity' => $targetData['quantity'],
                    'required_percentage' => $targetData['required_percentage'],
                    'target_date' => $targetData['target_date'],
                    'achieved_quantity' => 0,
                    'achievement_percentage' => 0,
                    'is_achieved' => false
                ]);

                $savedTargets[] = $target;
                file_put_contents($logFile, "Target created with ID: " . $target->id . "\n", FILE_APPEND);
            }

            file_put_contents($logFile, "All targets saved successfully. Total: " . count($savedTargets) . "\n", FILE_APPEND);

            // إرجاع استجابة نجاح
            return response()->json([
                'success' => true,
                'message' => 'تم حفظ الأهداف بنجاح',
                'targets_count' => count($savedTargets)
            ]);

        } catch (\Exception $e) {
            file_put_contents($logFile, "Error: " . $e->getMessage() . "\n", FILE_APPEND);
            file_put_contents($logFile, "Error trace: " . $e->getTraceAsString() . "\n", FILE_APPEND);

            return response()->json([
                'success' => false,
                'message' => 'خطأ في الخادم: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إنشاء خطة متعددة المنتجات
     */
    public function storeMultiProductPlan(Request $request, $id)
    {
        try {
            $representative = Representative::findOrFail($id);

            $validated = $request->validate([
                'plan_name' => 'required|string|max:255',
                'total_target_quantity' => 'required|integer|min:1',
                'required_percentage' => 'required|numeric|min:1|max:100',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'product_ids' => 'required|array|min:1',
                'product_ids.*' => 'exists:products,id',
                'notes' => 'nullable|string'
            ]);

            // إنشاء الخطة
            $plan = $representative->multiProductPlans()->create([
                'plan_name' => $validated['plan_name'],
                'total_target_quantity' => $validated['total_target_quantity'],
                'required_percentage' => $validated['required_percentage'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'notes' => $validated['notes'] ?? null,
                'status' => 'active'
            ]);

            // إضافة المنتجات للخطة
            foreach ($validated['product_ids'] as $productId) {
                $plan->planProducts()->create([
                    'product_id' => $productId,
                    'achieved_quantity' => 0
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء الخطة متعددة المنتجات بنجاح',
                'plan' => $plan->load('planProducts.product')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في إنشاء الخطة: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * الحصول على الخطط متعددة المنتجات
     */
    public function getMultiProductPlans($id)
    {
        try {
            $representative = Representative::findOrFail($id);

            $plans = $representative->multiProductPlans()
                ->with(['planProducts.product'])
                ->orderBy('created_at', 'desc')
                ->get();

            // حساب نسبة الإنجاز لكل خطة
            foreach ($plans as $plan) {
                $plan->updateCompletionStatus();
            }

            return response()->json([
                'success' => true,
                'plans' => $plans
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب الخطط: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحديث كمية محققة لمنتج في خطة
     */
    public function updateMultiPlanProductQuantity(Request $request, $planId, $productId)
    {
        try {
            $validated = $request->validate([
                'achieved_quantity' => 'required|integer|min:0'
            ]);

            $planProduct = MultiProductPlanProduct::where('multi_product_plan_id', $planId)
                ->where('product_id', $productId)
                ->firstOrFail();

            $planProduct->update([
                'achieved_quantity' => $validated['achieved_quantity']
            ]);

            // تحديث الكمية الإجمالية للخطة
            $plan = $planProduct->multiProductPlan;
            $totalAchieved = $plan->planProducts()->sum('achieved_quantity');

            $plan->update([
                'achieved_quantity' => $totalAchieved
            ]);

            $plan->updateCompletionStatus();

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث الكمية بنجاح',
                'plan' => $plan->load('planProducts.product')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تحديث الكمية: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إنشاء خطة فئات جديدة
     */
    public function storeCategoryPlan(Request $request, $id)
    {
        try {
            $representative = Representative::findOrFail($id);

            $validated = $request->validate([
                'plan_name' => 'required|string|max:255',
                'supplier_category_id' => 'required|exists:supplier_categories,id',
                'target_quantity' => 'required|integer|min:1',
                'required_percentage' => 'required|numeric|min:1|max:100',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'notes' => 'nullable|string'
            ]);

            $plan = $representative->categoryPlans()->create($validated);

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء خطة الفئة بنجاح',
                'categoryPlan' => $plan->load('supplierCategory')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في إنشاء خطة الفئة: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إنشاء خطة مورد جديدة
     */
    public function storeSupplierPlan(Request $request, $id)
    {
        try {
            $representative = Representative::findOrFail($id);

            $validated = $request->validate([
                'plan_name' => 'required|string|max:255',
                'supplier_id' => 'required|exists:suppliers,id',
                'target_quantity' => 'required|integer|min:1',
                'required_percentage' => 'required|numeric|min:1|max:100',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'notes' => 'nullable|string'
            ]);

            $plan = $representative->supplierPlans()->create($validated);

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء خطة المورد بنجاح',
                'supplierPlan' => $plan->load('supplier')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في إنشاء خطة المورد: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * جلب الفئات المتاحة
     */
    public function getSupplierCategories()
    {
        try {
            $categories = SupplierCategory::where('is_active', true)
                ->orderBy('name_ar')
                ->get();

            return response()->json([
                'success' => true,
                'categories' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب الفئات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * جلب الموردين المتاحين
     */
    public function getSuppliers()
    {
        try {
            $suppliers = Supplier::where('is_active', true)
                ->orderBy('name_ar')
                ->get();

            return response()->json([
                'success' => true,
                'suppliers' => $suppliers
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب الموردين: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * جلب خطط الأقسام للمندوب
     */
    public function getCategoryPlans($id)
    {
        try {
            $representative = Representative::findOrFail($id);

            $categoryPlans = $representative->categoryPlans()
                ->with('supplierCategory')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'categoryPlans' => $categoryPlans
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب خطط الأقسام: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * جلب خطط الموردين للمندوب
     */
    public function getSupplierPlans($id)
    {
        try {
            $representative = Representative::findOrFail($id);

            $supplierPlans = $representative->supplierPlans()
                ->with('supplier')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'supplierPlans' => $supplierPlans
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب خطط الموردين: ' . $e->getMessage()
            ], 500);
        }
    }
}
