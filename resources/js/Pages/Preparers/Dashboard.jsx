import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PreparerLayout from '../../Layouts/PreparerLayout';
import { FaEdit, FaCheckCircle, FaFileInvoice, FaClock, FaListAlt, FaChartLine } from 'react-icons/fa';

export default function Dashboard({ preparer, invoiceStats }) {
    // بيانات تجريبية إذا لم تكن متوفرة من الخادم
    const stats = invoiceStats || {
        preparing_invoices: 8,
        completed_invoices: 127,
        today_preparing: 3,
        total_pending: 12
    };

    // كروت الفواتير الرئيسية
    const mainCards = [
        {
            title: 'الفواتير الجديدة',
            subtitle: 'قيد التجهيز',
            count: stats.preparing_invoices,
            icon: <FaEdit className="w-6 h-6 sm:w-8 sm:h-8" />,
            color: 'bg-blue-500',
            bgGradient: 'from-blue-500 to-blue-600',
            href: '/preparer/invoices/preparing',
            description: 'الفواتير التي تحتاج للتجهيز',
            badge: 'جديد'
        },
        {
            title: 'الفواتير المكتملة',
            subtitle: 'تم الانتهاء منها',
            count: stats.completed_invoices,
            icon: <FaCheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />,
            color: 'bg-green-500',
            bgGradient: 'from-green-500 to-green-600',
            href: '/preparer/invoices/completed',
            description: 'الفواتير التي تم تجهيزها',
            badge: 'مكتمل'
        }
    ];

    // إحصائيات سريعة
    const quickStats = [
        {
            title: 'فواتير اليوم',
            value: stats.today_preparing,
            icon: <FaClock className="w-4 h-4 sm:w-5 sm:h-5" />,
            color: 'bg-yellow-500',
            change: '+2 من أمس'
        },
        {
            title: 'في الانتظار',
            value: stats.total_pending,
            icon: <FaListAlt className="w-4 h-4 sm:w-5 sm:h-5" />,
            color: 'bg-purple-500',
            change: 'جاهز للتجهيز'
        },
        {
            title: 'معدل الإنجاز',
            value: '94%',
            icon: <FaChartLine className="w-4 h-4 sm:w-5 sm:h-5" />,
            color: 'bg-emerald-500',
            change: '+5% هذا الأسبوع'
        }
    ];

    return (
        <PreparerLayout title="لوحة تحكم المجهز">
            <Head title="لوحة تحكم المجهز" />

            <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-2 sm:p-4 lg:p-0">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                        <div className="flex-1">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">مرحباً {preparer?.name || 'مجهز'}!</h2>
                            <p className="opacity-90 text-sm sm:text-base lg:text-lg">إدارة تجهيز الفواتير والطلبات</p>
                            <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm">
                                <FaClock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                آخر نشاط: {new Date().toLocaleString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    day: '2-digit',
                                    month: '2-digit'
                                })}
                            </div>
                        </div>
                        <div className="hidden sm:block">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <FaFileInvoice className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    {mainCards.map((card, index) => (
                        <Link
                            key={index}
                            href={card.href}
                            className="group transform hover:scale-105 transition-all duration-300 block"
                        >
                            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden">
                                {/* Card Header */}
                                <div className={`bg-gradient-to-r ${card.bgGradient} p-4 sm:p-6 text-white relative`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse">
                                            <div className="p-2 sm:p-3 bg-white bg-opacity-20 rounded-lg">
                                                {card.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-base sm:text-lg lg:text-xl font-bold">{card.title}</h3>
                                                <p className="text-xs sm:text-sm opacity-90">{card.subtitle}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{card.count}</div>
                                            <span className="inline-block px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                                                {card.badge}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Decorative elements - hidden on mobile */}
                                    <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white bg-opacity-10 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16"></div>
                                    <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-20 sm:h-20 bg-white bg-opacity-10 rounded-full -ml-6 sm:-ml-10 -mb-6 sm:-mb-10"></div>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 sm:p-6">
                                    <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{card.description}</p>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                                        <div className="flex items-center text-xs sm:text-sm text-gray-500">
                                            <FaClock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                            آخر تحديث: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 text-sm sm:text-base">
                                            <span className="ml-2">عرض الكل</span>
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {quickStats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-2 sm:space-y-0">
                                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
                                    <div className={`${stat.color} p-2 sm:p-3 rounded-lg text-white`}>
                                        {stat.icon}
                                    </div>
                                    <div className="text-center sm:text-right">
                                        <h4 className="text-xs sm:text-sm font-medium text-gray-700">{stat.title}</h4>
                                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 sm:mt-4">
                                <p className="text-xs text-gray-500 text-center sm:text-right">{stat.change}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">النشاط الأخير</h3>
                        <p className="text-xs sm:text-sm text-gray-500">آخر العمليات على الفواتير</p>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            {/* Sample recent activities */}
                            <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse p-3 sm:p-4 bg-blue-50 rounded-lg">
                                <div className="p-2 bg-blue-500 rounded-lg text-white flex-shrink-0">
                                    <FaEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm sm:text-base">بدء تجهيز فاتورة #INV-2025-001</p>
                                    <p className="text-xs sm:text-sm text-gray-500 truncate">تم تحويل الفاتورة إلى حالة التجهيز</p>
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse p-3 sm:p-4 bg-green-50 rounded-lg">
                                <div className="p-2 bg-green-500 rounded-lg text-white flex-shrink-0">
                                    <FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm sm:text-base">اكتمال تجهيز فاتورة #INV-2025-002</p>
                                    <p className="text-xs sm:text-sm text-gray-500 truncate">تم تجهيز الفاتورة وهي جاهزة للتسليم</p>
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                                    {new Date(Date.now() - 30 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse p-3 sm:p-4 bg-yellow-50 rounded-lg">
                                <div className="p-2 bg-yellow-500 rounded-lg text-white flex-shrink-0">
                                    <FaClock className="w-3 h-3 sm:w-4 sm:h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm sm:text-base">فاتورة جديدة في الانتظار #INV-2025-003</p>
                                    <p className="text-xs sm:text-sm text-gray-500 truncate">تم استلام فاتورة جديدة تحتاج للتجهيز</p>
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                                    {new Date(Date.now() - 60 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 sm:mt-6 text-center">
                            <Link
                                href="/preparer/activity"
                                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
                            >
                                عرض جميع الأنشطة
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PreparerLayout>
    );
}
