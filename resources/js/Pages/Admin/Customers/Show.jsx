import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FaArrowRight,
    FaUser,
    FaPhone,
    FaMapMarkerAlt,
    FaStickyNote,
    FaUserTag,
    FaCalendarAlt,
    FaToggleOn,
    FaToggleOff,
    FaEdit,
    FaTrash,
    FaMap,
    FaEye,
    FaClock,
    FaInfoCircle
} from 'react-icons/fa';

const Show = ({ customer }) => {
    const handleToggleStatus = () => {
        router.post(route('admin.customers.toggle-status', customer.id), {}, {
            preserveScroll: true
        });
    };

    const handleDelete = () => {
        if (confirm(`هل أنت متأكد من حذف العميل "${customer.name}"؟`)) {
            router.delete(route('admin.customers.destroy', customer.id), {
                onSuccess: () => {
                    router.visit(route('admin.customers.index'));
                }
            });
        }
    };

    const openGoogleMaps = () => {
        if (customer.latitude && customer.longitude) {
            window.open(
                `https://www.google.com/maps?q=${customer.latitude},${customer.longitude}`,
                '_blank'
            );
        }
    };

    return (
        <AdminLayout title={`العميل: ${customer.name}`}>
            <Head title={`العميل: ${customer.name}`} />

            <div className="space-y-6">
                {/* رأس الصفحة */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <Link
                            href={route('admin.customers.index')}
                            className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
                        >
                            <FaArrowRight className="w-4 h-4" />
                            العودة لقائمة العملاء
                        </Link>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleToggleStatus}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                    customer.is_active
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                            >
                                {customer.is_active ? <FaToggleOff className="w-4 h-4" /> : <FaToggleOn className="w-4 h-4" />}
                                {customer.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
                            </button>

                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <FaTrash className="w-4 h-4" />
                                حذف العميل
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <FaUser className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">{customer.name}</h1>
                            <div className="flex items-center gap-4 text-blue-100">
                                <div className="flex items-center gap-1">
                                    <FaUserTag className="w-4 h-4" />
                                    <span>المندوب: {customer.representative?.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {customer.is_active ? <FaToggleOn className="w-4 h-4" /> : <FaToggleOff className="w-4 h-4" />}
                                    <span>{customer.is_active ? 'نشط' : 'غير نشط'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* المعلومات الأساسية */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* معلومات الاتصال */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <FaPhone className="w-5 h-5 mr-3 text-green-500" />
                                    معلومات الاتصال
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            اسم العميل
                                        </label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <FaUser className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-900">{customer.name}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            رقم الهاتف
                                        </label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <FaPhone className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-900">
                                                {customer.phone || 'غير محدد'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* المعلومات الإضافية */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <FaInfoCircle className="w-5 h-5 mr-3 text-blue-500" />
                                    المعلومات الإضافية
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            المندوب المسؤول
                                        </label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <FaUserTag className="w-4 h-4 text-blue-500" />
                                            <span className="text-gray-900">{customer.representative?.name}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            حالة العميل
                                        </label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            {customer.is_active ? (
                                                <>
                                                    <FaToggleOn className="w-4 h-4 text-green-500" />
                                                    <span className="text-green-600 font-medium">نشط</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaToggleOff className="w-4 h-4 text-red-500" />
                                                    <span className="text-red-600 font-medium">غير نشط</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {customer.notes && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ملاحظات
                                            </label>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <div className="flex gap-3">
                                                    <FaStickyNote className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                                                    <p className="text-gray-700 leading-relaxed">{customer.notes}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* معلومات الموقع */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <FaMapMarkerAlt className="w-5 h-5 mr-3 text-red-500" />
                                    معلومات الموقع
                                </h2>
                            </div>
                            <div className="p-6">
                                {customer.latitude && customer.longitude ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    خط العرض
                                                </label>
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    <span className="text-gray-900 font-mono">{customer.latitude}</span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    خط الطول
                                                </label>
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    <span className="text-gray-900 font-mono">{customer.longitude}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={openGoogleMaps}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                        >
                                            <FaMap className="w-4 h-4" />
                                            عرض على خرائط جوجل
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FaMapMarkerAlt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">لم يتم تحديد موقع لهذا العميل</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* الشريط الجانبي */}
                    <div className="space-y-6">
                        {/* معلومات التوقيت */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    <FaClock className="w-4 h-4 mr-2 text-gray-500" />
                                    التوقيت
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        تاريخ الإضافة
                                    </label>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FaCalendarAlt className="w-3 h-3" />
                                        <span className="text-sm">
                                            {new Date(customer.created_at).toLocaleDateString('ar-SA', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        آخر تحديث
                                    </label>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FaCalendarAlt className="w-3 h-3" />
                                        <span className="text-sm">
                                            {new Date(customer.updated_at).toLocaleDateString('ar-SA', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* معلومات المندوب */}
                        {customer.representative && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                        <FaUserTag className="w-4 h-4 mr-2 text-blue-500" />
                                        معلومات المندوب
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                            <FaUser className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {customer.representative.name}
                                            </div>
                                            {customer.representative.phone && (
                                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                                    <FaPhone className="w-3 h-3" />
                                                    {customer.representative.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Link
                                        href={route('admin.representatives.profile', customer.representative.id)}
                                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        <FaEye className="w-3 h-3" />
                                        عرض تفاصيل المندوب
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* إحصائيات سريعة */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900">إحصائيات سريعة</h3>
                            </div>
                            <div className="p-6 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">المعرف</span>
                                    <span className="text-sm font-medium text-gray-900">#{customer.id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">الحالة</span>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        customer.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {customer.is_active ? 'نشط' : 'غير نشط'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">الموقع</span>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        customer.latitude && customer.longitude
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {customer.latitude && customer.longitude ? 'محدد' : 'غير محدد'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Show;
