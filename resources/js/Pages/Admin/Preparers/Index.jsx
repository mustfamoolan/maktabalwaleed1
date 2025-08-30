import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye,
    FaToggleOn,
    FaToggleOff,
    FaSearch,
    FaUsers,
    FaMoneyBillWave,
    FaPhone,
    FaUserTie
} from 'react-icons/fa';

const Index = ({ preparers, flash }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');

    // تصفية المجهزين
    const filteredPreparers = preparers.filter(preparer =>
        preparer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preparer.phone.includes(searchTerm)
    );

    // ترتيب المجهزين
    const sortedPreparers = [...filteredPreparers].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const handleDelete = (preparer) => {
        if (confirm(`هل أنت متأكد من حذف المجهز "${preparer.name}"؟`)) {
            router.delete(`/admin/preparers/${preparer.id}`, {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <FaToggleOn className="w-3 h-3 mr-1" />
                نشط
            </span>
        ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <FaToggleOff className="w-3 h-3 mr-1" />
                غير نشط
            </span>
        );
    };

    return (
        <AdminLayout title="إدارة المجهزين">
            <Head title="إدارة المجهزين" />

            <div className="space-y-6">
                {/* رسائل التنبيه */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {flash.error}
                    </div>
                )}

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="p-2 bg-blue-500 rounded-lg">
                                <FaUserTie className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">إدارة المجهزين</h1>
                                <p className="text-gray-600">إدارة وتتبع جميع المجهزين في النظام</p>
                            </div>
                        </div>
                        <Link
                            href="/admin/preparers/create"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FaPlus className="w-4 h-4 mr-2" />
                            إضافة مجهز جديد
                        </Link>
                    </div>

                    {/* إحصائيات سريعة */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-600 text-sm font-medium">إجمالي المجهزين</p>
                                    <p className="text-2xl font-bold text-green-900">{preparers.length}</p>
                                </div>
                                <FaUsers className="w-8 h-8 text-green-500" />
                            </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-600 text-sm font-medium">المجهزين النشطين</p>
                                    <p className="text-2xl font-bold text-blue-900">
                                        {preparers.filter(p => p.is_active).length}
                                    </p>
                                </div>
                                <FaToggleOn className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-600 text-sm font-medium">إجمالي الرواتب</p>
                                    <p className="text-2xl font-bold text-yellow-900">
                                        {preparers.reduce((sum, p) => sum + (parseFloat(p.salary) || 0), 0).toLocaleString('en-US')} د.ع
                                    </p>
                                </div>
                                <FaMoneyBillWave className="w-8 h-8 text-yellow-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* البحث والفلاتر */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="البحث عن مجهز (الاسم أو رقم الهاتف)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <select
                            value={`${sortBy}-${sortDirection}`}
                            onChange={(e) => {
                                const [column, direction] = e.target.value.split('-');
                                setSortBy(column);
                                setSortDirection(direction);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="created_at-desc">الأحدث أولاً</option>
                            <option value="created_at-asc">الأقدم أولاً</option>
                            <option value="name-asc">الاسم (أ-ي)</option>
                            <option value="name-desc">الاسم (ي-أ)</option>
                            <option value="salary-desc">الراتب (الأعلى أولاً)</option>
                            <option value="salary-asc">الراتب (الأقل أولاً)</option>
                        </select>
                    </div>
                </div>

                {/* جدول المجهزين */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {sortedPreparers.length === 0 ? (
                        <div className="text-center py-12">
                            <FaUserTie className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مجهزين</h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm ? 'لم يتم العثور على مجهزين مطابقين للبحث' : 'لم يتم إضافة أي مجهزين بعد'}
                            </p>
                            {!searchTerm && (
                                <Link
                                    href="/admin/preparers/create"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <FaPlus className="w-4 h-4 mr-2" />
                                    إضافة أول مجهز
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('name')}
                                        >
                                            اسم المجهز
                                        </th>
                                        <th
                                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('phone')}
                                        >
                                            رقم الهاتف
                                        </th>
                                        <th
                                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('salary')}
                                        >
                                            الراتب الأساسي
                                        </th>
                                        <th
                                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('is_active')}
                                        >
                                            الحالة
                                        </th>
                                        <th
                                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('created_at')}
                                        >
                                            تاريخ الإضافة
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الإجراءات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedPreparers.map((preparer) => (
                                        <tr key={preparer.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {preparer.name.charAt(0)}
                                                    </div>
                                                    <div className="mr-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {preparer.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {preparer.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <FaPhone className="w-4 h-4 ml-2 text-gray-400" />
                                                    {preparer.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {preparer.salary ? `${parseFloat(preparer.salary).toLocaleString('en-US')} د.ع` : 'غير محدد'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(preparer.is_active)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(preparer.created_at).toLocaleDateString('en-US')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2 space-x-reverse">
                                                    <Link
                                                        href={`/admin/preparers/${preparer.id}`}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <FaEye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/preparers/${preparer.id}/edit`}
                                                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors"
                                                        title="تعديل"
                                                    >
                                                        <FaEdit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(preparer)}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                                                        title="حذف"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Index;
