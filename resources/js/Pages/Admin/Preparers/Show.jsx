import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FaEdit,
    FaTrash,
    FaArrowRight,
    FaUser,
    FaPhone,
    FaMoneyBillWave,
    FaStickyNote,
    FaToggleOn,
    FaToggleOff,
    FaCalendarAlt,
    FaUserTie,
    FaIdCard
} from 'react-icons/fa';

const Show = ({ preparer, flash }) => {
    const handleDelete = () => {
        if (confirm(`هل أنت متأكد من حذف المجهز "${preparer.name}"؟`)) {
            router.delete(`/admin/preparers/${preparer.id}`);
        }
    };

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <FaToggleOn className="w-4 h-4 mr-1" />
                نشط
            </span>
        ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <FaToggleOff className="w-4 h-4 mr-1" />
                غير نشط
            </span>
        );
    };

    return (
        <AdminLayout title={`تفاصيل المجهز: ${preparer.name}`}>
            <Head title={`تفاصيل المجهز: ${preparer.name}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* رسائل التنبيه */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {flash.success}
                    </div>
                )}

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 space-x-reverse">
                            <Link
                                href="/admin/preparers"
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FaArrowRight className="w-5 h-5" />
                            </Link>
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                {preparer.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{preparer.name}</h1>
                                <p className="text-gray-600">مجهز - ID: {preparer.id}</p>
                                <div className="mt-2">
                                    {getStatusBadge(preparer.is_active)}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 space-x-reverse">
                            <Link
                                href={`/admin/preparers/${preparer.id}/edit`}
                                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                            >
                                <FaEdit className="w-4 h-4 mr-2" />
                                تعديل
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <FaTrash className="w-4 h-4 mr-2" />
                                حذف
                            </button>
                        </div>
                    </div>
                </div>

                {/* معلومات المجهز */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* البيانات الأساسية */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FaUser className="w-5 h-5 mr-2 text-blue-500" />
                            البيانات الأساسية
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <span className="text-sm font-medium text-gray-500 flex items-center">
                                    <FaIdCard className="w-4 h-4 mr-2" />
                                    رقم المجهز
                                </span>
                                <span className="text-sm text-gray-900 font-medium">#{preparer.id}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <span className="text-sm font-medium text-gray-500 flex items-center">
                                    <FaUser className="w-4 h-4 mr-2" />
                                    الاسم الكامل
                                </span>
                                <span className="text-sm text-gray-900 font-medium">{preparer.name}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <span className="text-sm font-medium text-gray-500 flex items-center">
                                    <FaPhone className="w-4 h-4 mr-2" />
                                    رقم الهاتف
                                </span>
                                <span className="text-sm text-gray-900 font-medium">{preparer.phone}</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm font-medium text-gray-500 flex items-center">
                                    <FaUserTie className="w-4 h-4 mr-2" />
                                    الحالة
                                </span>
                                {getStatusBadge(preparer.is_active)}
                            </div>
                        </div>
                    </div>

                    {/* المعلومات المالية */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FaMoneyBillWave className="w-5 h-5 mr-2 text-green-500" />
                            المعلومات المالية
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-green-600">الراتب الأساسي</span>
                                    <span className="text-lg font-bold text-green-900">
                                        {preparer.salary ? `${parseFloat(preparer.salary).toLocaleString('en-US')} د.ع` : 'غير محدد'}
                                    </span>
                                </div>
                            </div>

                            {/* ملاحظة: سيتم إضافة تفاصيل الراتب لاحقاً */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="text-center">
                                    <p className="text-sm text-blue-600 mb-2">تفاصيل الراتب</p>
                                    <p className="text-xs text-blue-500">سيتم إضافة جدول تفاصيل الراتب لاحقاً</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* التواريخ والملاحظات */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FaStickyNote className="w-5 h-5 mr-2 text-purple-500" />
                        معلومات إضافية
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* التواريخ */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">التواريخ المهمة</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500 flex items-center">
                                        <FaCalendarAlt className="w-4 h-4 mr-2" />
                                        تاريخ الإضافة
                                    </span>
                                    <span className="text-sm text-gray-900">
                                        {new Date(preparer.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-500 flex items-center">
                                        <FaCalendarAlt className="w-4 h-4 mr-2" />
                                        آخر تحديث
                                    </span>
                                    <span className="text-sm text-gray-900">
                                        {new Date(preparer.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* الملاحظات */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">الملاحظات</h4>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[100px]">
                                {preparer.notes ? (
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{preparer.notes}</p>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">لا توجد ملاحظات</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* إحصائيات سريعة (للتطوير المستقبلي) */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات الأداء</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <p className="text-sm text-blue-600 mb-1">إجمالي المهام</p>
                            <p className="text-2xl font-bold text-blue-900">-</p>
                            <p className="text-xs text-blue-500">سيتم إضافتها لاحقاً</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <p className="text-sm text-green-600 mb-1">المهام المكتملة</p>
                            <p className="text-2xl font-bold text-green-900">-</p>
                            <p className="text-xs text-green-500">سيتم إضافتها لاحقاً</p>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                            <p className="text-sm text-yellow-600 mb-1">المعدل الشهري</p>
                            <p className="text-2xl font-bold text-yellow-900">-</p>
                            <p className="text-xs text-yellow-500">سيتم إضافتها لاحقاً</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Show;
