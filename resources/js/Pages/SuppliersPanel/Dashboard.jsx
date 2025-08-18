import React from 'react';
import SupplierLayout from '../../Layouts/SupplierLayout';

export default function Dashboard() {
    const stats = [
        { title: 'منتجاتي', value: '85', icon: '📦', color: 'bg-orange-500' },
        { title: 'طلبات جديدة', value: '12', icon: '🔔', color: 'bg-blue-500' },
        { title: 'مبيعات الشهر', value: '₺45,200', icon: '💰', color: 'bg-green-500' },
        { title: 'في المخزون', value: '1,245', icon: '📊', color: 'bg-purple-500' }
    ];

    return (
        <SupplierLayout title="لوحة تحكم المورد">
            <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">مرحباً بك شركة الأمل للتوريدات</h2>
                    <p className="opacity-90">لوحة تحكم المورد - إدارة المنتجات والطلبات</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl mr-4`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">إضافة منتج جديد</h3>
                        <p className="text-gray-600 mb-4">إضافة منتج جديد إلى الكتالوج</p>
                        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                            إضافة منتج
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">تحديث الأسعار</h3>
                        <p className="text-gray-600 mb-4">تحديث أسعار المنتجات</p>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            تحديث الأسعار
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">تقرير المبيعات</h3>
                        <p className="text-gray-600 mb-4">عرض تقرير مبيعات الشهر</p>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            عرض التقرير
                        </button>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold">الطلبات الأخيرة</h3>
                    </div>
                    <div className="p-6">
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500">لا توجد طلبات حديثة</p>
                        </div>
                    </div>
                </div>
            </div>
        </SupplierLayout>
    );
}
