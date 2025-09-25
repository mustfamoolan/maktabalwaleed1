<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Representative;
use App\Models\RepresentativeSalary;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SalaryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $salaries = RepresentativeSalary::with('representative')
            ->orderBy('effective_from', 'desc')
            ->paginate(10);

        return view('admin.salaries.index', compact('salaries'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $representatives = Representative::where('is_active', true)
            ->orderBy('name')
            ->get();

        return view('admin.salaries.create', compact('representatives'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'representative_id' => 'required|exists:representatives,id',
            'year' => 'required|integer|min:2020|max:2050',
            'month' => 'required|integer|min:1|max:12',
            'base_salary' => 'required|numeric|min:0',
            'total_commission' => 'nullable|numeric|min:0',
            'bonus' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        // التحقق من عدم وجود راتب لنفس الشهر والسنة
        $exists = RepresentativeSalary::where('representative_id', $request->representative_id)
            ->where('year', $request->year)
            ->where('month', $request->month)
            ->exists();

        if ($exists) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'يوجد بالفعل راتب مسجل لهذا الشهر'
                ]);
            }
            return back()->withErrors(['error' => 'يوجد بالفعل راتب مسجل لهذا الشهر']);
        }

        // حساب الراتب الصافي
        $baseSalary = $request->base_salary ?? 0;
        $commission = $request->total_commission ?? 0;
        $bonus = $request->bonus ?? 0;
        $deductions = $request->deductions ?? 0;
        $netSalary = $baseSalary + $commission + $bonus - $deductions;

        // إنشاء الراتب الجديد
        RepresentativeSalary::create([
            'representative_id' => $request->representative_id,
            'year' => $request->year,
            'month' => $request->month,
            'base_salary' => $baseSalary,
            'total_commission' => $commission,
            'bonus' => $bonus,
            'deductions' => $deductions,
            'net_salary' => $netSalary,
            'notes' => $request->notes,
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'تم حفظ الراتب بنجاح'
            ]);
        }

        return redirect()->route('admin.salaries.index')
            ->with('success', 'تم إضافة الراتب بنجاح');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $salary = RepresentativeSalary::with('representative')->findOrFail($id);
        return view('admin.salaries.show', compact('salary'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $salary = RepresentativeSalary::findOrFail($id);
        $representatives = Representative::where('is_active', true)
            ->orderBy('name')
            ->get();

        return view('admin.salaries.edit', compact('salary', 'representatives'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $salary = RepresentativeSalary::findOrFail($id);

        $request->validate([
            'representative_id' => 'required|exists:representatives,id',
            'basic_salary' => 'required|numeric|min:0|max:999999999999.99',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'boolean',
        ]);

        // إنهاء الراتب الحالي للمندوب إذا تم تفعيل راتب جديد
        if ($request->is_active && $salary->representative_id != $request->representative_id) {
            RepresentativeSalary::where('representative_id', $request->representative_id)
                ->where('is_active', true)
                ->where('id', '!=', $salary->id)
                ->update(['is_active' => false, 'effective_to' => now()]);
        }

        $salary->update([
            'representative_id' => $request->representative_id,
            'basic_salary' => $request->basic_salary,
            'effective_from' => $request->effective_from,
            'effective_to' => $request->effective_to,
            'is_active' => $request->boolean('is_active', $salary->is_active),
        ]);

        return redirect()->route('admin.salaries.index')
            ->with('success', 'تم تحديث الراتب بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id, Request $request)
    {
        $salary = RepresentativeSalary::findOrFail($id);
        $salary->delete();

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'تم حذف الراتب بنجاح'
            ]);
        }

        return redirect()->route('admin.salaries.index')
            ->with('success', 'تم حذف الراتب بنجاح');
    }
}
