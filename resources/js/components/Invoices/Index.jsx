import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function InvoicesIndex({ invoices, representatives, filters }) {
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [representativeFilter, setRepresentativeFilter] = useState(filters.representative_id || '');

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
        router.get(route('invoices.index'), {
            status: statusFilter,
            representative_id: representativeFilter
        }, {
            preserveState: true,
            replace: true
        });
    };

    const updateStatus = (invoiceId, newStatus) => {
        if (confirm('هل أنت متأكد من تغيير حالة الفاتورة؟')) {
            router.patch(route('invoices.updateStatus', invoiceId), {
                status: newStatus
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="الفواتير" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* رأس الصفحة */}
                    <div className="mb-6">
                        <div className="sm:flex sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">إدارة الفواتير</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    عرض وإدارة جميع الفواتير في النظام
                                </p>
                            </div>
                            <div className="mt-4 sm:mt-0">
                                <Link
                                    href={route('invoices.create')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                >
                                    إنشاء فاتورة جديدة
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* الفلاتر */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        المندوب
                                    </label>
                                    <select
                                        value={representativeFilter}
                                        onChange={(e) => setRepresentativeFilter(e.target.value)}
                                        className="w-full border-gray-300 rounded-lg"
                                    >
                                        <option value="">جميع المندوبين</option>
                                        {representatives.map(rep => (
                                            <option key={rep.id} value={rep.id}>
                                                {rep.name}
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
                    </div>

                    {/* قائمة الفواتير */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            رقم الفاتورة
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            المندوب
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
                                                    {invoice.representative.name}
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
                                                <div className="flex flex-col space-y-1">
                                                    <Link
                                                        href={route('invoices.show', invoice.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        عرض
                                                    </Link>

                                                    {invoice.status === 'pending' && (
                                                        <button
                                                            onClick={() => updateStatus(invoice.id, 'preparing')}
                                                            className="text-blue-600 hover:text-blue-900 text-left"
                                                        >
                                                            بدء التجهيز
                                                        </button>
                                                    )}

                                                    {invoice.status === 'preparing' && (
                                                        <button
                                                            onClick={() => updateStatus(invoice.id, 'shipping')}
                                                            className="text-indigo-600 hover:text-indigo-900 text-left"
                                                        >
                                                            شحن
                                                        </button>
                                                    )}

                                                    {invoice.status === 'shipping' && (
                                                        <button
                                                            onClick={() => updateStatus(invoice.id, 'delivered')}
                                                            className="text-green-600 hover:text-green-900 text-left"
                                                        >
                                                            تم التسليم
                                                        </button>
                                                    )}

                                                    {['pending', 'preparing'].includes(invoice.status) && (
                                                        <button
                                                            onClick={() => updateStatus(invoice.id, 'cancelled')}
                                                            className="text-red-600 hover:text-red-900 text-left"
                                                        >
                                                            إلغاء
                                                        </button>
                                                    )}

                                                    <Link
                                                        href={route('invoices.print', invoice.id)}
                                                        className="text-gray-600 hover:text-gray-900"
                                                    >
                                                        طباعة
                                                    </Link>
                                                </div>
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
                                    <div className="flex space-x-2">
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
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
