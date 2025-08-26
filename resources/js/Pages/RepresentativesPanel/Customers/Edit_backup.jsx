import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import RepresentativeLayout from '@/Layouts/RepresentativeLayout';
import {
    FaSave,
    FaArrowLeft,
    FaUser,
    FaPhone,
    FaMapMarkerAlt,
    FaGlobe,
    FaStickyNote,
    FaToggleOn,
    FaToggleOff
} from 'react-icons/fa';

const Edit = ({ representative_user, customer }) => {
    const [showMap, setShowMap] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: customer.name || '',
        phone: customer.phone || '',
        location_text: customer.location_text || '',
        latitude: customer.latitude || '',
        longitude: customer.longitude || '',
        notes: customer.notes || '',
        is_active: customer.is_active
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('representatives.customers.update', customer.id));
    };

    // الحصول على الموقع من المتصفح
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setData({
                        ...data,
                        latitude: position.coords.latitude.toString(),
                        longitude: position.coords.longitude.toString()
                    });
                },
                (error) => {
                    alert('لا يمكن الحصول على الموقع الحالي');
                }
            );
        } else {
            alert('المتصفح لا يدعم خدمة تحديد الموقع');
        }
    };

    return (
        <RepresentativeLayout title={`تعديل العميل - ${customer.name}`}>
            <Head title={`تعديل العميل - ${customer.name}`} />

            <div className="space-y-6">
                {/* رأس الصفحة */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">تعديل العميل</h1>
                        <p className="text-gray-600">تحديث بيانات العميل: {customer.name}</p>
                    </div>
                    <Link
                        href={route('representatives.customers.show', customer.id)}
                        className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <FaArrowLeft className="w-4 h-4 mr-2" />
                        العودة للتفاصيل
                    </Link>
                </div>

                {/* نموذج تعديل العميل */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">تعديل بيانات العميل</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* اسم العميل */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                اسم العميل *
                            </label>
                            <div className="relative">
                                <FaUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="أدخل اسم العميل"
                                    required
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* رقم الهاتف */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                رقم الهاتف
                            </label>
                            <div className="relative">
                                <FaPhone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="أدخل رقم الهاتف"
                                />
                            </div>
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                            )}
                        </div>

                        {/* الموقع */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                                الموقع
                            </label>

                            {/* وصف الموقع */}
                            <div className="relative">
                                <FaMapMarkerAlt className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
                                <textarea
                                    value={data.location_text}
                                    onChange={(e) => setData('location_text', e.target.value)}
                                    className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.location_text ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="وصف الموقع (عنوان، معالم، إلخ)"
                                    rows="3"
                                />
                            </div>
                            {errors.location_text && (
                                <p className="mt-1 text-sm text-red-600">{errors.location_text}</p>
                            )}

                            {/* الإحداثيات */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        خط العرض (Latitude)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={data.latitude}
                                        onChange={(e) => setData('latitude', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.latitude ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="مثال: 33.3152"
                                    />
                                    {errors.latitude && (
                                        <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        خط الطول (Longitude)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={data.longitude}
                                        onChange={(e) => setData('longitude', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.longitude ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="مثال: 44.3661"
                                    />
                                    {errors.longitude && (
                                        <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>
                                    )}
                                </div>
                            </div>

                            {/* أزرار الموقع */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={getCurrentLocation}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <FaGlobe className="w-4 h-4 mr-2" />
                                    الحصول على الموقع الحالي
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowMap(!showMap)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                                    {showMap ? 'إخفاء الخريطة' : 'عرض على الخريطة'}
                                </button>
                            </div>

                            {/* عرض الخريطة */}
                            {showMap && (data.latitude && data.longitude) && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">موقع العميل على الخريطة:</h4>
                                    <div className="bg-white rounded border overflow-hidden">
                                        <iframe
                                            src={`https://www.google.com/maps?q=${data.latitude},${data.longitude}&hl=ar&z=15&output=embed`}
                                            width="100%"
                                            height="300"
                                            style={{ border: 0 }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* الملاحظات */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ملاحظات
                            </label>
                            <div className="relative">
                                <FaStickyNote className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.notes ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="أي ملاحظات إضافية حول العميل"
                                    rows="4"
                                />
                            </div>
                            {errors.notes && (
                                <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                            )}
                        </div>

                        {/* حالة العميل */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                حالة العميل
                            </label>
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <button
                                    type="button"
                                    onClick={() => setData('is_active', !data.is_active)}
                                    className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg transition-colors ${
                                        data.is_active
                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                    }`}
                                >
                                    {data.is_active ? <FaToggleOn className="w-5 h-5" /> : <FaToggleOff className="w-5 h-5" />}
                                    <span>{data.is_active ? 'نشط' : 'غير نشط'}</span>
                                </button>
                            </div>
                            {errors.is_active && (
                                <p className="mt-1 text-sm text-red-600">{errors.is_active}</p>
                            )}
                        </div>

                        {/* أزرار الإجراءات */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <FaSave className="w-4 h-4 mr-2" />
                                {processing ? 'جارِ الحفظ...' : 'حفظ التغييرات'}
                            </button>

                            <Link
                                href={route('representatives.customers.show', customer.id)}
                                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center"
                            >
                                إلغاء
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </RepresentativeLayout>
    );
};

export default Edit;
