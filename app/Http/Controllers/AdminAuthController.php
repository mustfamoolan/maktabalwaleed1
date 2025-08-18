<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AdminUser;
use Inertia\Inertia;

class AdminAuthController extends Controller
{
    /**
     * عرض صفحة تسجيل الدخول
     */
    public function showLogin()
    {
        return Inertia::render('Auth/AdminLogin');
    }

    /**
     * معالجة تسجيل الدخول
     */
    public function login(Request $request)
    {
        // التحقق من صحة البيانات
        $request->validate([
            'phone' => 'required|string|size:11|regex:/^07[0-9]{9}$/',
            'password' => 'required|string|min:6',
        ], [
            'phone.required' => 'رقم الهاتف مطلوب',
            'phone.size' => 'رقم الهاتف يجب أن يكون 11 رقم',
            'phone.regex' => 'رقم الهاتف يجب أن يبدأ بـ 07',
            'password.required' => 'كلمة المرور مطلوبة',
            'password.min' => 'كلمة المرور يجب أن تكون على الأقل 6 أحرف',
        ]);

        // البحث عن المستخدم
        $user = AdminUser::where('phone', $request->phone)
                         ->where('is_active', true)
                         ->first();

        // التحقق من وجود المستخدم وصحة كلمة المرور
        if (!$user || !$user->checkPassword($request->password)) {
            return back()->withErrors([
                'phone' => 'رقم الهاتف أو كلمة المرور غير صحيحة',
            ]);
        }

        // تحديث آخر تسجيل دخول
        $user->updateLastLogin();

        // حفظ بيانات المستخدم في الجلسة
        session([
            'admin_user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'role' => $user->role,
                'type' => 'admin'
            ]
        ]);

        // إعادة التوجيه إلى لوحة التحكم
        return redirect('/admin/dashboard')->with('success', 'تم تسجيل الدخول بنجاح');
    }

    /**
     * تسجيل الخروج
     */
    public function logout()
    {
        session()->forget('admin_user');
        session()->flush();
        return redirect('/')->with('success', 'تم تسجيل الخروج بنجاح');
    }

    /**
     * التحقق من حالة تسجيل الدخول
     */
    public function checkAuth()
    {
        $adminUser = session('admin_user');

        if (!$adminUser) {
            return response()->json(['authenticated' => false]);
        }

        return response()->json([
            'authenticated' => true,
            'user' => $adminUser
        ]);
    }
}
