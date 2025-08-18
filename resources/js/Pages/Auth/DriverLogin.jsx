import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function DriverLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        phone: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/drivers/login');
    };

    return (
        <>
            <Head title="تسجيل دخول السائقين" />

            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Link
                        href="/"
                        className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        العودة للصفحة الرئيسية
                    </Link>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-purple-500 to-purple-600 flex flex-col items-center justify-center text-white">
                            <div className="text-4xl mb-2">🚛</div>
                            <h2 className="text-xl font-bold">لوحة السائقين</h2>
                            <p className="text-sm opacity-90">تسجيل دخول السائق</p>
                        </div>

                        <div className="p-8">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        رقم الهاتف
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-right"
                                        placeholder="01xxxxxxxxx"
                                        dir="ltr"
                                    />
                                    {errors.phone && <div className="text-red-600 text-sm mt-1">{errors.phone}</div>}
                                </div>

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
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                                        processing
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg transform hover:-translate-y-0.5'
                                    }`}
                                >
                                    {processing ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="mt-6 text-center text-gray-500 text-sm">
                        <p>لوحة تحكم السائقين - خاص بسائقي التوصيل</p>
                    </div>
                </div>
            </div>
        </>
    );
}
