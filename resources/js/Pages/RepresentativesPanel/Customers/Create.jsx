import React, { useState, useEffect } from 'react';
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
    FaCrosshairs,
    FaLocationArrow,
    FaSpinner,
    FaUserPlus
} from 'react-icons/fa';

const Create = ({ representative_user }) => {
    const [showMap, setShowMap] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState({ lat: 33.3152, lng: 44.3661 }); // بغداد كإحداثيات افتراضية

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        location_text: '',
        latitude: '',
        longitude: '',
        notes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('representatives.customers.store'), {
            onSuccess: () => {
                reset();
            }
        });
    };

    // الحصول على الموقع من المتصفح
    const getCurrentLocation = () => {
        setLocationLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLat = position.coords.latitude.toString();
                    const newLng = position.coords.longitude.toString();
                    setData({
                        ...data,
                        latitude: newLat,
                        longitude: newLng
                    });
                    setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
                    setShowMap(true);
                    setLocationLoading(false);
                },
                (error) => {
                    setLocationLoading(false);
                    let errorMessage = 'لا يمكن الحصول على الموقع الحالي';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'يرجى السماح بالوصول للموقع في المتصفح';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'معلومات الموقع غير متوفرة';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'انتهت مهلة البحث عن الموقع';
                            break;
                    }
                    alert(errorMessage);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        } else {
            setLocationLoading(false);
            alert('المتصفح لا يدعم خدمة تحديد الموقع');
        }
    };

    // تحديث مركز الخريطة عند تغيير الإحداثيات
    useEffect(() => {
        if (data.latitude && data.longitude) {
            setMapCenter({
                lat: parseFloat(data.latitude),
                lng: parseFloat(data.longitude)
            });
        }
    }, [data.latitude, data.longitude]);

    return (
        <RepresentativeLayout title="إضافة عميل جديد">
            <Head title="إضافة عميل جديد" />

            <div className="min-h-screen bg-gray-50 px-2 py-4">
                {/* رأس الصفحة الجميل - مثل صفحة الراتب */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">إضافة عميل جديد</h1>
                            <p className="opacity-90">أضف عميل جديد إلى قاعدة بياناتك</p>
                        </div>
                        <div className="text-center">
                            <FaUserPlus className="text-4xl mb-1 mx-auto opacity-90" />
                            <div className="text-sm opacity-90">عميل جديد</div>
                        </div>
                    </div>

                    {/* زر العودة */}
                    <div className="mt-4">
                        <Link
                            href={route('representatives.customers.index')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                        >
                            <FaArrowLeft className="w-4 h-4" />
                            العودة للقائمة
                        </Link>
                    </div>
                </div>

                {/* نموذج إضافة العميل - محسن للموبايل */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* اسم العميل */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            <FaUser className="inline w-4 h-4 ml-2" />
                            اسم العميل *
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={`w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="أدخل اسم العميل"
                            required
                        />
                        {errors.name && (
                            <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* رقم الهاتف */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            <FaPhone className="inline w-4 h-4 ml-2" />
                            رقم الهاتف
                        </label>
                        <input
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className={`w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="أدخل رقم الهاتف"
                            inputMode="tel"
                        />
                        {errors.phone && (
                            <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                        )}
                    </div>

                    {/* الموقع - محسن للموبايل */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            <FaMapMarkerAlt className="inline w-4 h-4 ml-2" />
                            موقع العميل
                        </label>

                        {/* وصف الموقع */}
                        <textarea
                            value={data.location_text}
                            onChange={(e) => setData('location_text', e.target.value)}
                            className={`w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 ${
                                errors.location_text ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="وصف الموقع (عنوان، معالم، إلخ)"
                            rows="3"
                        />
                        {errors.location_text && (
                            <p className="mb-3 text-sm text-red-600">{errors.location_text}</p>
                        )}

                        {/* أزرار الموقع - محسنة للموبايل */}
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                disabled={locationLoading}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
                            >
                                {locationLoading ? (
                                    <FaSpinner className="w-5 h-5 animate-spin" />
                                ) : (
                                    <FaLocationArrow className="w-5 h-5" />
                                )}
                                {locationLoading ? 'جارِ تحديد الموقع...' : 'استخدام الموقع الحالي'}
                            </button>

                            {(data.latitude && data.longitude) && (
                                <button
                                    type="button"
                                    onClick={() => setShowMap(!showMap)}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                                >
                                    <FaMapMarkerAlt className="w-5 h-5" />
                                    {showMap ? 'إخفاء الخريطة' : 'عرض على الخريطة'}
                                </button>
                            )}
                        </div>

                        {/* الإحداثيات - مخفية افتراضياً في الموبايل */}
                        <details className="mt-4">
                            <summary className="text-sm text-gray-600 cursor-pointer p-2 bg-gray-50 rounded">
                                الإحداثيات التفصيلية (اختياري)
                            </summary>
                            <div className="mt-3 space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">خط العرض</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={data.latitude}
                                        onChange={(e) => setData('latitude', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                        placeholder="33.3152"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">خط الطول</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={data.longitude}
                                        onChange={(e) => setData('longitude', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                        placeholder="44.3661"
                                    />
                                </div>
                            </div>
                        </details>

                        {/* عرض الخريطة - محسن للموبايل */}
                        {showMap && (data.latitude && data.longitude) && (
                            <div className="mt-4 rounded-lg overflow-hidden border">
                                <div className="bg-gray-100 p-2 text-center text-sm text-gray-600">
                                    موقع العميل على الخريطة
                                </div>
                                <div className="relative">
                                    <iframe
                                        src={`https://www.google.com/maps?q=${data.latitude},${data.longitude}&hl=ar&z=16&output=embed`}
                                        width="100%"
                                        height="250"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="w-full"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const url = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
                                            window.open(url, '_blank');
                                        }}
                                        className="absolute top-2 right-2 bg-white p-2 rounded-lg shadow-md text-blue-600 hover:bg-blue-50"
                                    >
                                        <FaGlobe className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* الملاحظات */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            <FaStickyNote className="inline w-4 h-4 ml-2" />
                            ملاحظات
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className={`w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.notes ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="أي ملاحظات إضافية حول العميل"
                            rows="4"
                        />
                        {errors.notes && (
                            <p className="mt-2 text-sm text-red-600">{errors.notes}</p>
                        )}
                    </div>

                    {/* أزرار الإجراءات - محسنة للموبايل */}
                    <div className="space-y-3 pb-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
                        >
                            <FaSave className="w-5 h-5" />
                            {processing ? 'جارِ الحفظ...' : 'حفظ العميل'}
                        </button>

                        <Link
                            href={route('representatives.customers.index')}
                            className="w-full block text-center px-6 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-lg font-medium"
                        >
                            إلغاء
                        </Link>
                    </div>
                </form>
            </div>
        </RepresentativeLayout>
    );
};

export default Create;
