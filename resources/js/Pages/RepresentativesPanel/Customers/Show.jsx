import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import RepresentativeLayout from '@/Layouts/RepresentativeLayout';
import {
    FaPhone,
    FaMapMarkerAlt,
    FaEdit,
    FaArrowLeft,
    FaGlobe,
    FaStickyNote,
    FaCalendar
} from 'react-icons/fa';

const Show = ({ representative_user, customer }) => {
    const openInGoogleMaps = () => {
        if (customer.latitude && customer.longitude) {
            const url = `https://www.google.com/maps?q=${customer.latitude},${customer.longitude}`;
            window.open(url, '_blank');
        }
    };

    return (
        <RepresentativeLayout title={`تفاصيل العميل - ${customer.name}`}>
            <Head title={`تفاصيل العميل - ${customer.name}`} />

            <div className="min-h-screen bg-gray-50 px-2 py-4">
                {/* زر العودة بسيط */}
                <div className="mb-4">
                    <Link
                        href={route('representatives.customers.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border shadow-sm"
                    >
                        <FaArrowLeft className="w-4 h-4" />
                        العودة للقائمة
                    </Link>
                </div>

                {/* تفاصيل العميل */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    {/* عنوان العميل */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">{customer.name}</h1>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    customer.is_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {customer.is_active ? 'نشط' : 'غير نشط'}
                                </span>
                            </div>

                            {/* زر التعديل */}
                            <Link
                                href={route('representatives.customers.edit', customer.id)}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-orange-600 transition-all"
                            >
                                <FaEdit className="w-4 h-4" />
                                تعديل البيانات
                            </Link>
                        </div>
                    </div>

                    {/* محتوى البطاقة */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-6">
                            {/* معلومات الاتصال */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                                    <FaPhone className="w-5 h-5 mr-2" />
                                    معلومات الاتصال
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-blue-700 font-medium">رقم الهاتف:</span>
                                        <span className="text-blue-900">
                                            {customer.phone || 'غير محدد'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* معلومات الموقع */}
                            <div className="bg-green-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                                    <FaMapMarkerAlt className="w-5 h-5 mr-2" />
                                    معلومات الموقع
                                </h3>
                                <div className="space-y-3">
                                    {customer.location_text && (
                                        <div>
                                            <span className="text-green-700 font-medium block mb-1">وصف الموقع:</span>
                                            <p className="text-green-900 bg-white p-2 rounded border">{customer.location_text}</p>
                                        </div>
                                    )}

                                    {(customer.latitude && customer.longitude) && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-green-700 font-medium">الإحداثيات:</span>
                                                <button
                                                    onClick={openInGoogleMaps}
                                                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                                >
                                                    <FaGlobe className="w-3 h-3" />
                                                    فتح في الخرائط
                                                </button>
                                            </div>
                                            <div className="bg-white p-2 rounded border text-sm text-green-900">
                                                <div>خط العرض: {customer.latitude}</div>
                                                <div>خط الطول: {customer.longitude}</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* عرض الخريطة */}
                                    {(customer.latitude && customer.longitude) && (
                                        <div className="mt-3">
                                            <div className="bg-white rounded border overflow-hidden">
                                                <iframe
                                                    src={`https://www.google.com/maps?q=${customer.latitude},${customer.longitude}&hl=ar&z=16&output=embed`}
                                                    width="100%"
                                                    height="200"
                                                    style={{ border: 0 }}
                                                    allowFullScreen=""
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* الملاحظات */}
                            {customer.notes && (
                                <div className="bg-yellow-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                                        <FaStickyNote className="w-5 h-5 mr-2" />
                                        الملاحظات
                                    </h3>
                                    <p className="text-yellow-900 bg-white p-3 rounded border">{customer.notes}</p>
                                </div>
                            )}

                            {/* معلومات إضافية */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <FaCalendar className="w-5 h-5 mr-2" />
                                    معلومات إضافية
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700 font-medium">تاريخ الإضافة:</span>
                                        <span className="text-gray-900">{customer.created_at}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700 font-medium">آخر تحديث:</span>
                                        <span className="text-gray-900">{customer.updated_at}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </RepresentativeLayout>
    );
};

export default Show;
