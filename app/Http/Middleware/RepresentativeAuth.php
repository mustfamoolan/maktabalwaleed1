<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class RepresentativeAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // التحقق من تسجيل الدخول باستخدام guard
        if (!Auth::guard('representative')->check()) {
            // إذا كان الطلب API، إرجاع رسالة خطأ JSON
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            // إعادة توجيه لصفحة تسجيل الدخول
            return redirect()->route('representatives.login');
        }

        // التحقق من أن المندوب نشط
        $representative = Auth::guard('representative')->user();
        if (!$representative->is_active) {
            // تسجيل الخروج إذا كان المندوب غير نشط
            Auth::guard('representative')->logout();

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Account deactivated'], 403);
            }

            return redirect()->route('representatives.login')
                ->withErrors(['phone' => 'تم إلغاء تفعيل حسابك، يرجى التواصل مع الإدارة']);
        }

        return $next($request);
    }
}
