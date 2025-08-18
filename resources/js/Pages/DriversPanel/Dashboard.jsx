import React from 'react';
import { Head } from '@inertiajs/react';
import DriversLayout from '@/Layouts/DriversLayout';

export default function Dashboard() {
    // بيانات تجريبية للسائق
    const driverStats = {
        totalTrips: 45,
        completedTrips: 42,
        pendingTrips: 3,
        totalEarnings: 15750,
        thisMonthEarnings: 4200,
        averageRating: 4.8,
        totalDistance: 2850
    };

    const recentTrips = [
        {
            id: 1,
            date: '2025-08-18',
            time: '14:30',
            from: 'مركز التوزيع الرئيسي',
            to: 'حي النزهة - الرياض',
            status: 'مكتملة',
            earnings: 85,
            distance: 15
        },
        {
            id: 2,
            date: '2025-08-18',
            time: '11:15',
            from: 'مخزن الجملة',
            to: 'حي الملز - الرياض',
            status: 'مكتملة',
            earnings: 120,
            distance: 22
        },
        {
            id: 3,
            date: '2025-08-18',
            time: '09:00',
            from: 'مركز التوزيع الفرعي',
            to: 'حي القدس - الرياض',
            status: 'قيد التنفيذ',
            earnings: 95,
            distance: 18
        }
    ];

    const upcomingTrips = [
        {
            id: 1,
            scheduledTime: '16:00',
            from: 'مركز التوزيع الرئيسي',
            to: 'حي الروضة - الرياض',
            estimatedEarnings: 110,
            estimatedDistance: 25
        },
        {
            id: 2,
            scheduledTime: '17:30',
            from: 'مخزن الأجهزة',
            to: 'حي الياسمين - الرياض',
            estimatedEarnings: 75,
            estimatedDistance: 12
        }
    ];

    return (
        <DriversLayout>
            <Head title="لوحة السائقين - الرئيسية" />

            <div className="space-y-6">
                {/* مرحباً بالسائق */}
                <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">مرحباً محمد! 👋</h1>
                            <p className="text-purple-100">
                                لديك {upcomingTrips.length} رحلة مجدولة اليوم
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">{driverStats.averageRating}</div>
                            <div className="text-sm text-purple-200">تقييم العملاء</div>
                        </div>
                    </div>
                </div>

                {/* الإحصائيات الرئيسية */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">الرحلات المكتملة</dt>
                                    <dd className="text-lg font-medium text-gray-900">{driverStats.completedTrips}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">رحلات معلقة</dt>
                                    <dd className="text-lg font-medium text-gray-900">{driverStats.pendingTrips}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">الأرباح الشهرية</dt>
                                    <dd className="text-lg font-medium text-gray-900">{driverStats.thisMonthEarnings.toLocaleString()} ريال</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">المسافة الكلية</dt>
                                    <dd className="text-lg font-medium text-gray-900">{driverStats.totalDistance} كم</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* الرحلات القادمة */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">الرحلات القادمة</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {upcomingTrips.map((trip) => (
                                    <div key={trip.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center text-sm text-purple-600 font-medium">
                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {trip.scheduledTime}
                                            </div>
                                            <div className="mt-1 text-sm text-gray-900">
                                                <span className="font-medium">من:</span> {trip.from}
                                            </div>
                                            <div className="text-sm text-gray-900">
                                                <span className="font-medium">إلى:</span> {trip.to}
                                            </div>
                                            <div className="mt-2 flex items-center text-xs text-gray-500">
                                                <span>{trip.estimatedDistance} كم</span>
                                                <span className="mx-2">•</span>
                                                <span>{trip.estimatedEarnings} ريال</span>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                                            بدء الرحلة
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* الرحلات الأخيرة */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">الرحلات الأخيرة</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentTrips.map((trip) => (
                                    <div key={trip.id} className="border-r-4 border-green-400 pl-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <span>{trip.date}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{trip.time}</span>
                                                </div>
                                                <div className="mt-1 text-sm text-gray-900">
                                                    <span className="font-medium">من:</span> {trip.from}
                                                </div>
                                                <div className="text-sm text-gray-900">
                                                    <span className="font-medium">إلى:</span> {trip.to}
                                                </div>
                                                <div className="mt-2 flex items-center text-xs text-gray-500">
                                                    <span>{trip.distance} كم</span>
                                                    <span className="mx-2">•</span>
                                                    <span className="text-green-600 font-medium">{trip.earnings} ريال</span>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                trip.status === 'مكتملة'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {trip.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ملخص الأرباح */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">ملخص الأرباح</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{driverStats.totalEarnings.toLocaleString()}</div>
                            <div className="text-sm text-green-700">إجمالي الأرباح</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{driverStats.thisMonthEarnings.toLocaleString()}</div>
                            <div className="text-sm text-blue-700">أرباح هذا الشهر</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{Math.round(driverStats.totalEarnings / driverStats.totalTrips)}</div>
                            <div className="text-sm text-purple-700">متوسط الربح لكل رحلة</div>
                        </div>
                    </div>
                </div>
            </div>
        </DriversLayout>
    );
}
