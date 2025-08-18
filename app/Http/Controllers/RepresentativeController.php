<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Representative;
use Inertia\Inertia;

class RepresentativeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $representatives = Representative::orderBy('name')->get();

        return Inertia::render('Admin/Representatives', [
            'representatives' => $representatives,
            'admin_user' => session('admin_user')
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|size:11|unique:representatives,phone|regex:/^07[0-9]{9}$/',
            'password' => 'required|string|min:6',
            'notes' => 'nullable|string',
        ], [
            'name.required' => 'اسم المندوب مطلوب',
            'name.max' => 'اسم المندوب يجب أن يكون أقل من 255 حرف',
            'phone.required' => 'رقم الهاتف مطلوب',
            'phone.size' => 'رقم الهاتف يجب أن يكون 11 رقم',
            'phone.unique' => 'رقم الهاتف موجود مسبقاً',
            'phone.regex' => 'رقم الهاتف يجب أن يبدأ بـ 07',
            'password.required' => 'كلمة المرور مطلوبة',
            'password.min' => 'كلمة المرور يجب أن تكون على الأقل 6 أحرف',
        ]);

        Representative::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'password' => $request->password, // سيتم تشفيرها تلقائياً في الـ Model
            'notes' => $request->notes,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'تم إضافة المندوب بنجاح');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Representative $representative)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|size:11|unique:representatives,phone,' . $representative->id . '|regex:/^07[0-9]{9}$/',
            'password' => 'nullable|string|min:6',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ], [
            'name.required' => 'اسم المندوب مطلوب',
            'name.max' => 'اسم المندوب يجب أن يكون أقل من 255 حرف',
            'phone.required' => 'رقم الهاتف مطلوب',
            'phone.size' => 'رقم الهاتف يجب أن يكون 11 رقم',
            'phone.unique' => 'رقم الهاتف موجود مسبقاً',
            'phone.regex' => 'رقم الهاتف يجب أن يبدأ بـ 07',
            'password.min' => 'كلمة المرور يجب أن تكون على الأقل 6 أحرف',
        ]);

        $updateData = [
            'name' => $request->name,
            'phone' => $request->phone,
            'notes' => $request->notes,
            'is_active' => $request->boolean('is_active', true),
        ];

        // تحديث كلمة المرور فقط إذا تم إدخالها
        if ($request->filled('password')) {
            $updateData['password'] = $request->password;
        }

        $representative->update($updateData);

        return redirect()->back()->with('success', 'تم تحديث بيانات المندوب بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Representative $representative)
    {
        $representative->delete();
        return redirect()->back()->with('success', 'تم حذف المندوب بنجاح');
    }
}
