<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Representative;
use App\Models\SalesPlan;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class RepresentativeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $representatives = Representative::orderBy('created_at', 'desc')->paginate(20);
        $categories = Category::orderBy('name')->get();
        return view('admin.representatives.index', compact('representatives', 'categories'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('admin.representatives.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:representatives,phone|max:20',
            'password' => 'required|string|min:6|max:255'
        ]);

        DB::beginTransaction();
        try {
            Representative::create([
                'name' => $request->name,
                'phone' => $request->phone,
                'password' => $request->password,
                'is_active' => true
            ]);

            DB::commit();
            return redirect()->route('admin.representatives.index')
                ->with('success', 'تم إضافة المندوب بنجاح');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withInput()->with('error', 'حدث خطأ أثناء إضافة المندوب');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $representative = Representative::findOrFail($id);
        return view('admin.representatives.show', compact('representative'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $representative = Representative::findOrFail($id);
        return view('admin.representatives.edit', compact('representative'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $representative = Representative::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:representatives,phone,' . $id,
            'password' => 'nullable|string|min:6|max:255',
            'is_active' => 'boolean'
        ]);

        DB::beginTransaction();
        try {
            $data = [
                'name' => $request->name,
                'phone' => $request->phone,
                'is_active' => $request->has('is_active')
            ];

            if ($request->filled('password')) {
                $data['password'] = $request->password;
            }

            $representative->update($data);

            DB::commit();
            return redirect()->route('admin.representatives.index')
                ->with('success', 'تم تحديث بيانات المندوب بنجاح');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withInput()->with('error', 'حدث خطأ أثناء تحديث بيانات المندوب');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $representative = Representative::findOrFail($id);

        DB::beginTransaction();
        try {
            $representative->delete();

            DB::commit();
            return redirect()->route('admin.representatives.index')
                ->with('success', 'تم حذف المندوب بنجاح');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->with('error', 'حدث خطأ أثناء حذف المندوب');
        }
    }

    /**
     * جلب رواتب مندوب معين
     */
    public function getSalaries(Representative $representative)
    {
        $salaries = $representative->salaries()
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'salaries' => $salaries
        ]);
    }

    /**
     * جلب خطط مندوب معين
     */
    public function getPlans(Representative $representative)
    {
        $plans = $representative->salesPlans()
            ->with(['category', 'product', 'supplier'])
            ->get()
            ->map(function($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'plan_type' => $plan->plan_type,
                    'category_name' => $plan->target_name,
                    'target_quantity' => $plan->target_quantity,
                    'required_achievement_rate' => $plan->required_achievement_rate,
                    'bonus_per_extra_unit' => $plan->bonus_per_extra_unit,
                    'start_date' => $plan->start_date->format('Y-m-d'),
                    'end_date' => $plan->end_date->format('Y-m-d'),
                    'is_active' => $plan->is_active
                ];
            });

        return response()->json([
            'success' => true,
            'plans' => $plans
        ]);
    }
}
