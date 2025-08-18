import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FaFileInvoiceDollar,
    FaEye,
    FaEdit,
    FaTrash,
    FaSearch,
    FaFilter,
    FaDownload,
    FaSync
} from 'react-icons/fa';

export default function AdminInvoices({
    invoices = { data: [] },
    representatives = [],
    filters = {},
    total = 0
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [representativeFilter, setRepresentativeFilter] = useState(filters.representative_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0).replace('IQD', 'د.ع');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ar-IQ');
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            preparing: 'bg-blue-100 text-blue-800',
            shipping: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            returned: 'bg-orange-100 text-orange-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
        const statusTexts = {
            pending: 'قيد الانتظار',
            preparing: 'قيد التجهيز',
            shipping: 'قيد التوصيل',
            delivered: 'تم التسليم',
            returned: 'مسترجع',
            cancelled: 'ملغية',
        };
        return statusTexts[status] || status;
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter) params.append('status', statusFilter);
        if (representativeFilter) params.append('representative_id', representativeFilter);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);

        window.location.href = `/admin/invoices?${params.toString()}`;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setRepresentativeFilter('');
        setDateFrom('');
        setDateTo('');
        window.location.href = '/admin/invoices';
    };

    const updateStatus = (invoiceId, newStatus) => {
        if (confirm('هل أنت متأكد من تحديث حالة الفاتورة؟')) {
            fetch(`/admin/invoices/${invoiceId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ status: newStatus })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                }
            })
            .catch(console.error);
        }
    };

    return (
        <AdminLayout>
            <Head title="إدارة الفواتير - الإدارة" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">إدارة الفواتير</h1>
                            <p className="text-gray-600 mt-1">عرض وإدارة جميع الفواتير في النظام</p>
                        </div>
                        <div className="flex items-center space-x-3 space-x-reverse">
                            <span className="text-sm text-gray-500">
                                المجموع: {total} فاتورة
                            </span>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <FaSync className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="رقم الفاتورة أو اسم العميل..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">جميع الحالات</option>
                                <option value="pending">قيد الانتظار</option>
                                <option value="preparing">قيد التجهيز</option>
                                <option value="shipping">قيد التوصيل</option>
                                <option value="delivered">تم التسليم</option>
                                <option value="returned">مسترجع</option>
                                <option value="cancelled">ملغية</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">المندوب</label>
                            <select
                                value={representativeFilter}
                                onChange={(e) => setRepresentativeFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">جميع المندوبين</option>
                                {representatives.map(rep => (
                                    <option key={rep.id} value={rep.id}>{rep.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex items-end space-x-2 space-x-reverse">
                            <button
                                onClick={handleSearch}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <FaFilter className="w-4 h-4 ml-2" />
                                تطبيق
                            </button>
                            <button
                                onClick={clearFilters}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                مسح
                            </button>
                        </div>
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                                        إجمالي المبلغ
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
                                        إجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {invoices.data.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{invoice.invoice_number}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {invoice.representative?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {invoice.customer?.customer_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(invoice.total_amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                            {formatCurrency(invoice.paid_amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                            {formatCurrency(invoice.remaining_amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                                {getStatusText(invoice.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(invoice.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <Link
                                                    href={`/admin/invoices/${invoice.id}`}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                >
                                                    <FaEye className="w-4 h-4" />
                                                </Link>
                                                <select
                                                    value={invoice.status}
                                                    onChange={(e) => updateStatus(invoice.id, e.target.value)}
                                                    className="text-xs border-gray-300 rounded"
                                                >
                                                    <option value="pending">قيد الانتظار</option>
                                                    <option value="preparing">قيد التجهيز</option>
                                                    <option value="shipping">قيد التوصيل</option>
                                                    <option value="delivered">تم التسليم</option>
                                                    <option value="returned">مسترجع</option>
                                                    <option value="cancelled">ملغية</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {invoices.data.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaFileInvoiceDollar className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فواتير</h3>
                            <p className="text-gray-500">لم يتم العثور على فواتير بالمعايير المحددة</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {invoices.links && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                عرض {invoices.from} إلى {invoices.to} من أصل {invoices.total} فاتورة
                            </div>
                            <div className="flex space-x-1 space-x-reverse">
                                {invoices.links.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.url}
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
