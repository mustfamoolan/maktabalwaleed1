import React from 'react';
import { Head } from '@inertiajs/react';
import DriversLayout from '@/Layouts/DriversLayout';

export default function Deliveries() {
    const deliveries = [
        {
            id: 'DEL-001',
            orderNumber: '#ORD-2024-156',
            customerName: 'أحمد محمد',
            customerPhone: '0501234567',
            pickupAddress: 'مركز التوزيع الرئيسي - حي الملك فهد',
            deliveryAddress: 'حي النزهة - الرياض - شارع الأمير سلطان',
            status: 'قيد التوصيل',
            estimatedTime: '45 دقيقة',
            distance: '12 كم',
            earnings: 85,
            items: ['جهاز لابتوب HP', 'ماوس لاسلكي'],
            priority: 'عادي'
        },
        {
            id: 'DEL-002',
            orderNumber: '#ORD-2024-157',
            customerName: 'فاطمة أحمد',
            customerPhone: '0507654321',
            pickupAddress: 'مخزن الإلكترونيات - حي الربيع',
            deliveryAddress: 'حي الملز - الرياض - طريق الملك عبدالعزيز',
            status: 'جاهز للاستلام',
            estimatedTime: '60 دقيقة',
            distance: '18 كم',
            earnings: 120,
            items: ['طابعة كانون', 'ورق A4 (5 علب)', 'حبر طابعة'],
            priority: 'عاجل'
        },
        {
            id: 'DEL-003',
            orderNumber: '#ORD-2024-158',
            customerName: 'محمد عبدالله',
            customerPhone: '0503456789',
            pickupAddress: 'مستودع الأجهزة - حي السليمانية',
            deliveryAddress: 'حي القدس - الرياض - شارع العليا',
            status: 'مجدولة',
            estimatedTime: '30 دقيقة',
            distance: '8 كم',
            earnings: 65,
            items: ['شاشة سامسونج 24 بوصة'],
            priority: 'عادي'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'قيد التوصيل': return 'bg-blue-100 text-blue-800';
            case 'جاهز للاستلام': return 'bg-green-100 text-green-800';
            case 'مجدولة': return 'bg-yellow-100 text-yellow-800';
            case 'مكتملة': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'عاجل': return 'bg-red-100 text-red-800';
            case 'عادي': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DriversLayout>
            <Head title="لوحة السائقين - التوصيلات" />

            <div className="space-y-6">
                {/* العنوان والإحصائيات */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">إدارة التوصيلات</h1>
                        <div className="flex space-x-4 space-x-reverse">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">2</div>
                                <div className="text-sm text-gray-500">نشطة</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">1</div>
                                <div className="text-sm text-gray-500">معلقة</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">270</div>
                                <div className="text-sm text-gray-500">ريال متوقع</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* قائمة التوصيلات */}
                <div className="space-y-4">
                    {deliveries.map((delivery) => (
                        <div key={delivery.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                    <h3 className="text-lg font-medium text-gray-900">{delivery.orderNumber}</h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(delivery.status)}`}>
                                        {delivery.status}
                                    </span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(delivery.priority)}`}>
                                        {delivery.priority}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-green-600">{delivery.earnings} ريال</div>
                                    <div className="text-sm text-gray-500">{delivery.distance} • {delivery.estimatedTime}</div>
                                </div>
                            </div>

                            {/* معلومات العميل */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">معلومات العميل</h4>
                                        <div className="text-sm text-gray-900">{delivery.customerName}</div>
                                        <div className="text-sm text-gray-500 font-mono">{delivery.customerPhone}</div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">نقطة الاستلام</h4>
                                        <div className="text-sm text-gray-900">{delivery.pickupAddress}</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">عنوان التوصيل</h4>
                                        <div className="text-sm text-gray-900">{delivery.deliveryAddress}</div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">المنتجات</h4>
                                        <div className="text-sm text-gray-900">
                                            {delivery.items.map((item, index) => (
                                                <div key={index}>• {item}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* أزرار العمل */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex space-x-2 space-x-reverse">
                                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 10V9m0 0L9 7" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex space-x-2 space-x-reverse">
                                    {delivery.status === 'جاهز للاستلام' && (
                                        <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                                            بدء الاستلام
                                        </button>
                                    )}
                                    {delivery.status === 'قيد التوصيل' && (
                                        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                                            تأكيد التسليم
                                        </button>
                                    )}
                                    {delivery.status === 'مجدولة' && (
                                        <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                                            بدء الرحلة
                                        </button>
                                    )}
                                    <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                                        تفاصيل أكثر
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DriversLayout>
    );
}
