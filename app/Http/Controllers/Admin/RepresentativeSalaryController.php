<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RepresentativeSalary;
use App\Models\Representative;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RepresentativeSalaryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $salaries = RepresentativeSalary::with('representative')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Admin/Salaries/Index', [
            'salaries' => $salaries
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $representatives = Representative::all();

        return Inertia::render('Admin/Salaries/Create', [
            'representatives' => $representatives
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'representative_id' => 'required|exists:representatives,id',
            'basic_salary' => 'required|numeric|min:0',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'allowances' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:500'
        ]);

        RepresentativeSalary::create($validated);

        return redirect()->route('admin.salaries.index')
            ->with('success', 'تم إنشاء الراتب بنجاح');
    }

    /**
     * Display the specified resource.
     */
    public function show(RepresentativeSalary $salary)
    {
        $salary->load('representative');

        return Inertia::render('Admin/Salaries/Show', [
            'salary' => $salary
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(RepresentativeSalary $salary)
    {
        $representatives = Representative::all();

        return Inertia::render('Admin/Salaries/Edit', [
            'salary' => $salary,
            'representatives' => $representatives
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RepresentativeSalary $salary)
    {
        $validated = $request->validate([
            'representative_id' => 'required|exists:representatives,id',
            'basic_salary' => 'required|numeric|min:0',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'allowances' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:500'
        ]);

        $salary->update($validated);

        return redirect()->route('admin.salaries.index')
            ->with('success', 'تم تحديث الراتب بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RepresentativeSalary $salary)
    {
        $salary->delete();

        return redirect()->route('admin.salaries.index')
            ->with('success', 'تم حذف الراتب بنجاح');
    }
}
