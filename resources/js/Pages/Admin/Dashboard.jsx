import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Dashboard() {
    const stats = [
        { title: 'إجمالي العملاء', value: '1,245', icon: '👥', color: 'bg-blue-500', change: '+12%' },
        { title: 'إجمالي المبيعات', value: '₺125,400', icon: '💰', color: 'bg-green-500', change: '+8%' },
        { title: 'الطلبات المعلقة', value: '23', icon: '📋', color: 'bg-yellow-500', change: '-5%' },
        { title: 'المندوبين النشطين', value: '18', icon: '🏃‍♂️', color: 'bg-purple-500', change: '+2%' }
    ];

    const recentActivities = [
        { user: 'أحمد محمد', action: 'أضاف عميل جديد', time: 'منذ 5 دقائق', type: 'success' },
        { user: 'فاطمة علي', action: 'أكملت طلب #1247', time: 'منذ 15 دقيقة', type: 'info' },
        { user: 'محمد أحمد', action: 'حدث خطأ في الطلب #1246', time: 'منذ 30 دقيقة', type: 'error' },
        { user: 'سارة حسن', action: 'أضافت منتج جديد', time: 'منذ ساعة', type: 'success' }
    ];

    return (
        <AdminLayout title="لوحة تحكم الإدارة">
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">مرحباً بك في لوحة تحكل الإدارة</h2>
                    <p className="opacity-90">مراقبة وإدارة جميع عمليات النظام</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                    <div className="flex items-center mt-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            stat.change.startsWith('+')
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                </div>
                                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">مبيعات الشهر الحالي</h3>
                        <div className="h-64 flex items-end justify-center space-x-2">
                            {[40, 60, 45, 80, 55, 70, 85].map((height, index) => (
                                <div key={index} className="bg-blue-500 rounded-t w-8" style={{height: `${height}%`}}></div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>السبت</span>
                            <span>الأحد</span>
                            <span>الاثنين</span>
                            <span>الثلاثاء</span>
                            <span>الأربعاء</span>
                            <span>الخميس</span>
                            <span>الجمعة</span>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">النشاطات الأخيرة</h3>
                        <div className="space-y-4">
                            {recentActivities.map((activity, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <div className={`w-2 h-2 rounded-full ${
                                        activity.type === 'success' ? 'bg-green-500' :
                                        activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                    }`}></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900">
                                            <span className="font-medium">{activity.user}</span> {activity.action}
                                        </p>
                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">إضافة موظف جديد</h3>
                        <p className="text-gray-600 mb-4">إضافة موظف جديد للنظام</p>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            إضافة موظف
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">إعداد نسخة احتياطية</h3>
                        <p className="text-gray-600 mb-4">إنشاء نسخة احتياطية من البيانات</p>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            إنشاء نسخة
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">تقرير شامل</h3>
                        <p className="text-gray-600 mb-4">إنشاء تقرير شامل للنظام</p>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                            إنشاء تقرير
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
