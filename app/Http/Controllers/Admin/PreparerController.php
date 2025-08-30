<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Preparer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class PreparerController extends Controller
{
    public function index()
    {
        $preparers = Preparer::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Preparers/Index', [
            'preparers' => $preparers
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Preparers/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:preparers',
            'password' => 'required|string|min:6',
            'salary' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:1000'
        ]);

        Preparer::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'salary' => $request->salary,
            'is_active' => $request->is_active ?? true,
            'notes' => $request->notes
        ]);

        return redirect()->route('admin.preparers.index')
            ->with('success', 'تم إضافة المجهز بنجاح');
    }

    public function show(Preparer $preparer)
    {
        return Inertia::render('Admin/Preparers/Show', [
            'preparer' => $preparer
        ]);
    }

    public function edit(Preparer $preparer)
    {
        return Inertia::render('Admin/Preparers/Edit', [
            'preparer' => $preparer
        ]);
    }

    public function update(Request $request, Preparer $preparer)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:preparers,phone,' . $preparer->id,
            'password' => 'nullable|string|min:6',
            'salary' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:1000'
        ]);

        $updateData = [
            'name' => $request->name,
            'phone' => $request->phone,
            'salary' => $request->salary,
            'is_active' => $request->is_active ?? true,
            'notes' => $request->notes
        ];

        if ($request->password) {
            $updateData['password'] = Hash::make($request->password);
        }

        $preparer->update($updateData);

        return redirect()->route('admin.preparers.index')
            ->with('success', 'تم تحديث بيانات المجهز بنجاح');
    }

    public function destroy(Preparer $preparer)
    {
        $preparer->delete();

        return redirect()->route('admin.preparers.index')
            ->with('success', 'تم حذف المجهز بنجاح');
    }
}
