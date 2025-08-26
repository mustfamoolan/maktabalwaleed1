<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Models\Representative;

class RepresentativeAuthController extends Controller
{
    /**
     * عرض صفحة تسجيل الدخول للمندوبين
     */
    public function showLogin()
    {
        return Inertia::render('RepresentativesPanel/Login');
    }

    /**
     * تسجيل دخول المندوب
     */
    public function login(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
        ], [
            'phone.required' => 'رقم الهاتف مطلوب',
            'password.required' => 'كلمة المرور مطلوبة',
        ]);

        // البحث عن المندوب برقم الهاتف
        $representative = Representative::where('phone', $request->phone)->first();

        if (!$representative) {
            return back()->withErrors([
                'phone' => 'رقم الهاتف غير مسجل في النظام'
            ]);
        }

        // التحقق من كلمة المرور
        if (!Hash::check($request->password, $representative->password)) {
            return back()->withErrors([
                'password' => 'كلمة المرور غير صحيحة'
            ]);
        }

        // التحقق من أن المندوب نشط
        if (!$representative->is_active) {
            return back()->withErrors([
                'phone' => 'حسابك غير مفعل، يرجى التواصل مع الإدارة'
            ]);
        }

        // تسجيل الدخول باستخدام Auth guard
        Auth::guard('representative')->login($representative);

        // إعادة توجيه لوحة تحكم المندوب
        return redirect()->route('representatives.dashboard');
    }

    /**
     * تسجيل خروج المندوب
     */
    public function logout(Request $request)
    {
        // تسجيل الخروج باستخدام Auth guard
        Auth::guard('representative')->logout();

        return redirect()->route('representatives.login');
    }
}
