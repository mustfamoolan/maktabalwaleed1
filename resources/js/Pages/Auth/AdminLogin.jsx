import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function AdminLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        phone: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/login');
    };

    return (
        <>
            <Head title="تسجيل دخول المقر الرئيسي" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Back to Home Button */}
                    <Link
                        href="/"
                        className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        العودة للصفحة الرئيسية
                    </Link>

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 flex flex-col items-center justify-center text-white">
                            <div className="text-4xl mb-2">🏢</div>
                            <h2 className="text-xl font-bold">لوحة المقر الرئيسي</h2>
                            <p className="text-sm opacity-90">تسجيل دخول المدير</p>
                        </div>

                        {/* Form */}
                        <div className="p-8">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Phone */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        رقم الهاتف
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => {
                                                // السماح بالأرقام فقط و إزالة أي أحرف أخرى
                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                // تحديد الحد الأقصى إلى 11 رقم
                                                if (value.length <= 11) {
                                                    setData('phone', value);
                                                }
                                            }}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="07701234567"
                                            maxLength="11"
                                            dir="ltr"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 text-sm">🇮🇶</span>
                                        </div>
                                        {errors.phone && <div className="text-red-600 text-sm mt-1">{errors.phone}</div>}
                                        {data.phone && data.phone.length < 11 && (
                                            <div className="text-amber-600 text-sm mt-1">
                                                رقم الهاتف يجب أن يكون 11 رقم ({data.phone.length}/11)
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        كلمة المرور
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="أدخل كلمة المرور"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 left-0 pl-3 flex items-center"
                                        >
                                            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {showPassword ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.758 7.758M12 12l2.122 2.122m-2.122-2.122L14.242 9.878M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                )}
                                            </svg>
                                        </button>
                                        {errors.password && <div className="text-red-600 text-sm mt-1">{errors.password}</div>}
                                    </div>
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember" className="mr-2 block text-sm text-gray-900">
                                        تذكرني
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                                        processing
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg transform hover:-translate-y-0.5'
                                    }`}
                                >
                                    {processing ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            جاري تسجيل الدخول...
                                        </div>
                                    ) : (
                                        'تسجيل الدخول'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className="mt-6 text-center text-gray-500 text-sm">
                        <p>لوحة تحكم المقر الرئيسي - وصول محدود للمدراء فقط</p>
                    </div>
                </div>
            </div>
        </>
    );
}
