import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import RepresentativeLayout from '@/Layouts/RepresentativeLayout';
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function InvoicesIndex({ invoices, representative_user, filters }) {
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const statusOptions = [
        { value: '', label: 'جميع الحالات' },
        { value: 'pending', label: 'قيد الانتظار' },
        { value: 'preparing', label: 'قيد التجهيز' },
        { value: 'shipping', label: 'قيد التوصيل' },
        { value: 'delivered', label: 'تم التسليم' },
        { value: 'returned', label: 'مسترجع' },
        { value: 'cancelled', label: 'ملغية' }
    ];

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { label: 'قيد الانتظار', class: 'bg-yellow-100 text-yellow-800' },
            'preparing': { label: 'قيد التجهيز', class: 'bg-blue-100 text-blue-800' },
            'shipping': { label: 'قيد التوصيل', class: 'bg-indigo-100 text-indigo-800' },
            'delivered': { label: 'تم التسليم', class: 'bg-green-100 text-green-800' },
            'returned': { label: 'مسترجع', class: 'bg-orange-100 text-orange-800' },
            'cancelled': { label: 'ملغية', class: 'bg-red-100 text-red-800' }
        };

        const config = statusConfig[status] || { label: status, class: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
                {config.label}
            </span>
        );
    };

    const handleFilter = () => {
        router.get(route('representatives.invoices'), {
            status: statusFilter
        }, {
            preserveState: true,
            replace: true
        });
    };

    return (
        <RepresentativeLayout title="فواتيري">
            <Head title="فواتيري" />

            <div className="space-y-6">
                {/* رأس الصفحة */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">فواتيري</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                عرض وإدارة فواتيرك
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex space-x-3 space-x-reverse">
                            <Link
                                href={route('pos.create', { representative_id: representative_user.id })}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                إنشاء فاتورة جديدة
                            </Link>
                        </div>
                    </div>
                </div>

                {/* الفلاتر */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الحالة
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full border-gray-300 rounded-lg"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleFilter}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                تطبيق الفلتر
                            </button>
                        </div>
                    </div>
                </div>

                {/* قائمة الفواتير */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {invoices.data.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فواتير</h3>
                            <p className="text-gray-600 mb-6">لم تقم بإنشاء أي فواتير بعد</p>
                            <Link
                                href={route('pos.create', { representative_id: representative_user.id })}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium"
                            >
                                إنشاء أول فاتورة
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* للهواتف - عرض البطاقات */}
                            <div className="block md:hidden">
                                {invoices.data.map((invoice) => (
                                    <div key={invoice.id} className="border-b border-gray-200 p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-medium text-gray-900">
                                                    {invoice.invoice_number}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {invoice.customer.name}
                                                </p>
                                            </div>
                                            {getStatusBadge(invoice.status)}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                            <div>
                                                <span className="text-gray-600">الإجمالي:</span>
                                                <div className="font-medium text-green-600">
                                                    {formatCurrency(invoice.total_amount)}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">المدفوع:</span>
                                                <div className="font-medium">
                                                    {formatCurrency(invoice.paid_amount)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 mb-3">
                                            {formatDate(invoice.invoice_date)}
                                        </div>

                                        <Link
                                            href={route('invoices.show', invoice.id)}
                                            className="block w-full text-center bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium"
                                        >
                                            عرض التفاصيل
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            {/* للشاشات الكبيرة - جدول */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                رقم الفاتورة
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                العميل
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                الإجمالي
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                المدفوع
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                المتبقي
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                الحالة
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                التاريخ
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                العمليات
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {invoices.data.map((invoice) => (
                                            <tr key={invoice.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {invoice.invoice_number}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {invoice.customer.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {invoice.customer.governorate}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(invoice.total_amount)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-green-600">
                                                        {formatCurrency(invoice.paid_amount)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-red-600">
                                                        {formatCurrency(invoice.remaining_amount)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(invoice.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(invoice.invoice_date)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <Link
                                                        href={route('invoices.show', invoice.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        عرض
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {invoices.links && (
                                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-700">
                                            عرض {invoices.from} إلى {invoices.to} من {invoices.total} نتيجة
                                        </div>
                                        <div className="flex space-x-2 space-x-reverse">
                                            {invoices.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className={`px-3 py-2 text-sm rounded-lg ${
                                                        link.active
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </RepresentativeLayout>
    );
}
