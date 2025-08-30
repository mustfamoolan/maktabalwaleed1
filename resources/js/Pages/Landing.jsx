import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Landing() {
    const sections = [
        {
            title: 'لوحة المقر الرئيسي',
            description: 'إدارة النظام والعمليات الإدارية',
            href: '/admin/login',
            icon: '🏢',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'لوحة المندوبين',
            description: 'إدارة المبيعات والعملاء',
            href: '/representatives/login',
            icon: '👥',
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'لوحة المجهزين',
            description: 'إدارة المواد والتوريدات',
            href: '/preparer/login',
            icon: '🏭',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'لوحة السائقين',
            description: 'إدارة النقل والتوصيل',
            href: '/drivers/login',
            icon: '🚛',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'لوحة العملاء',
            description: 'تأكيد الطلبات والاستلام',
            href: '/customers',
            icon: '👤',
            color: 'from-red-500 to-red-600',
            bgColor: 'bg-red-50'
        }
    ];

    return (
        <>
            <Head title="نظام إدارة المبيعات" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="mb-8">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-6">
                                🏪
                            </div>
                        </div>
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            نظام إدارة المبيعات
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            نظام شامل ومتكامل لإدارة جميع عمليات المبيعات والعملاء والموردين والمخزون
                        </p>
                    </div>

                    {/* Sections Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {sections.map((section, index) => (
                            <Link
                                key={section.title}
                                href={section.href}
                                className="group block transform hover:scale-105 transition-all duration-300"
                            >
                                <div className={`${section.bgColor} rounded-2xl p-8 h-full border border-gray-200 hover:shadow-xl transition-all duration-300`}>
                                    <div className="text-center">
                                        <div className={`w-16 h-16 bg-gradient-to-r ${section.color} rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-6 group-hover:rotate-6 transition-transform duration-300`}>
                                            {section.icon}
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                                            {section.title}
                                        </h3>
                                        <p className="text-gray-600 mb-6 leading-relaxed">
                                            {section.description}
                                        </p>
                                        <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700 font-medium">
                                            <span>تسجيل الدخول</span>
                                            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Features Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-12 mb-16">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                            مميزات النظام
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">أمان عالي</h3>
                                <p className="text-gray-600">نظام حماية متقدم لضمان أمان بياناتك</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">سرعة عالية</h3>
                                <p className="text-gray-600">أداء سريع ومستجيب لجميع العمليات</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">تقارير شاملة</h3>
                                <p className="text-gray-600">تقارير مفصلة وإحصائيات دقيقة</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center">
                        <p className="text-gray-500 text-lg">
                            © 2025 نظام إدارة المبيعات. جميع الحقوق محفوظة.
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                            نظام متكامل لإدارة جميع عمليات البيع والشراء والمخزون
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
