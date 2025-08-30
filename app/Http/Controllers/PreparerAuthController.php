<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Preparer;
use Inertia\Inertia;

class PreparerAuthController extends Controller
{
    /**
     * عرض صفحة تسجيل الدخول للمجهزين
     */
    public function showLoginForm()
    {
        return Inertia::render('Auth/PreparerLogin');
    }

    /**
     * تسجيل دخول المجهز
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

        // البحث عن المجهز برقم الهاتف
        $preparer = Preparer::where('phone', $request->phone)->first();

        if (!$preparer) {
            return back()->withErrors([
                'phone' => 'رقم الهاتف غير مسجل في النظام'
            ]);
        }

        // التحقق من كلمة المرور
        if (!Hash::check($request->password, $preparer->password)) {
            return back()->withErrors([
                'password' => 'كلمة المرور غير صحيحة'
            ]);
        }

        // التحقق من أن المجهز نشط
        if (!$preparer->is_active) {
            return back()->withErrors([
                'phone' => 'حسابك غير مفعل، يرجى التواصل مع الإدارة'
            ]);
        }

        // تسجيل الدخول باستخدام Auth guard
        Auth::guard('preparer')->login($preparer);

        // إعادة توجيه لوحة تحكم المجهز
        return redirect()->route('preparer.dashboard');
    }

    /**
     * تسجيل خروج المجهز
     */
    public function logout(Request $request)
    {
        // تسجيل الخروج باستخدام Auth guard
        Auth::guard('preparer')->logout();

        return redirect()->route('preparer.login');
    }
}
