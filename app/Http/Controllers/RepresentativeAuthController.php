<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Representative;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class RepresentativeAuthController extends Controller
{
    /**
     * عرض صفحة تسجيل الدخول
     */
    public function showLogin()
    {
        return inertia('RepresentativesPanel/Login');
    }

    /**
     * تسجيل دخول المندوب
     */
    public function login(Request $request)
    {
        // التحقق من صحة البيانات
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|min:11|max:11|regex:/^07[0-9]{9}$/',
            'password' => 'required|string',
        ], [
            'phone.required' => 'رقم الهاتف مطلوب',
            'phone.min' => 'رقم الهاتف يجب أن يكون 11 رقم',
            'phone.max' => 'رقم الهاتف يجب أن يكون 11 رقم',
            'phone.regex' => 'رقم الهاتف يجب أن يبدأ بـ 07 ويتكون من 11 رقم',
            'password.required' => 'كلمة المرور مطلوبة',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // البحث عن المندوب
        $representative = Representative::where('phone', $request->phone)
                                     ->where('is_active', true)
                                     ->first();

        if (!$representative) {
            return back()->withErrors([
                'phone' => 'رقم الهاتف غير مسجل أو المندوب غير مفعل'
            ])->withInput();
        }

        // تحقق من كلمة المرور
        if (!$representative->checkPassword($request->password)) {
            return back()->withErrors([
                'password' => 'كلمة المرور غير صحيحة'
            ])->withInput();
        }

        // حفظ بيانات المندوب في الجلسة
        session(['representative_user' => $representative]);

        return redirect()->route('representatives.dashboard')->with('success', 'تم تسجيل الدخول بنجاح');
    }

    /**
     * لوحة تحكم المندوب
     */
    public function dashboard()
    {
        // تحقق من تسجيل الدخول
        $representative = session('representative_user');

        if (!$representative) {
            return redirect()->route('representatives.login.form');
        }

        return inertia('RepresentativesPanel/Dashboard', [
            'representative_user' => $representative
        ]);
    }

    /**
     * تسجيل خروج المندوب
     */
    public function logout()
    {
        session()->forget('representative_user');
        return redirect()->route('representatives.login.form')->with('success', 'تم تسجيل الخروج بنجاح');
    }
}
