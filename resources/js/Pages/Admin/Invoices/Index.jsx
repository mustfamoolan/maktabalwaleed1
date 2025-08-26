import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FaSearch,
    FaFilter,
    FaEye,
    FaPrint,
    FaDownload,
    FaEdit,
    FaChartLine,
    FaClock,
    FaCheckCircle,
    FaExclamationTriangle,
    FaTruck,
    FaMoneyBillWave,
    FaCalendarDay,
    FaCog
} from 'react-icons/fa';

const Index = ({ sales, stats, representatives, suppliers, filters }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(filters.payment_status || '');
    const [selectedRepresentative, setSelectedRepresentative] = useState(filters.representative_id || '');
    const [selectedSupplier, setSelectedSupplier] = useState(filters.supplier_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');
    const [perPage, setPerPage] = useState(filters.per_page || 15);

    // حالات الفواتير
    const statusOptions = [
        { value: '', label: 'جميع الحالات' },
        { value: 'created', label: 'تم إنشاؤها', color: 'gray' },
        { value: 'pending', label: 'في الانتظار', color: 'yellow' },
        { value: 'preparing', label: 'قيد التجهيز', color: 'blue' },
        { value: 'ready_for_delivery', label: 'جاهز للتسليم', color: 'purple' },
        { value: 'out_for_delivery', label: 'مع السائق', color: 'indigo' },
        { value: 'delivered', label: 'تم التسليم', color: 'green' },
        { value: 'completed', label: 'مكتمل', color: 'emerald' },
        { value: 'cancelled', label: 'ملغي', color: 'red' },
    ];

    // حالات الدفع
    const paymentStatusOptions = [
        { value: '', label: 'جميع حالات الدفع' },
        { value: 'paid', label: 'مدفوع كاملاً', color: 'green' },
        { value: 'partial', label: 'دفع جزئي', color: 'yellow' },
        { value: 'debt', label: 'دين', color: 'red' },
    ];

    // تطبيق الفلاتر
    const applyFilters = () => {
        const params = {
            search: searchTerm,
            status: selectedStatus,
            payment_status: selectedPaymentStatus,
            representative_id: selectedRepresentative,
            supplier_id: selectedSupplier,
            date_from: dateFrom,
            date_to: dateTo,
            sort_by: sortBy,
            sort_order: sortOrder,
            per_page: perPage,
        };

        // إزالة القيم الفارغة
        Object.keys(params).forEach(key => {
            if (!params[key]) delete params[key];
        });

        router.get('/admin/invoices', params);
    };

    // مسح الفلاتر
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSelectedPaymentStatus('');
        setSelectedRepresentative('');
        setSelectedSupplier('');
        setDateFrom('');
        setDateTo('');
        router.get('/admin/invoices');
    };

    // تحديث حالة الفاتورة
    const updateStatus = (saleId, newStatus) => {
        if (confirm('هل تريد تحديث حالة الفاتورة؟')) {
            router.patch(`/admin/invoices/${saleId}/status`, {
                status: newStatus
            });
        }
    };

    // الحصول على لون الحالة
    const getStatusColor = (status) => {
        const statusObj = statusOptions.find(s => s.value === status);
        return statusObj?.color || 'gray';
    };

    const getPaymentStatusColor = (status) => {
        const statusObj = paymentStatusOptions.find(s => s.value === status);
        return statusObj?.color || 'gray';
    };

    // أيقونة الحالة
    const getStatusIcon = (status) => {
        switch (status) {
            case 'created': return <FaClock className="w-3 h-3" />;
            case 'pending': return <FaExclamationTriangle className="w-3 h-3" />;
            case 'preparing': return <FaEdit className="w-3 h-3" />;
            case 'ready_for_delivery': return <FaTruck className="w-3 h-3" />;
            case 'out_for_delivery': return <FaTruck className="w-3 h-3" />;
            case 'delivered': return <FaCheckCircle className="w-3 h-3" />;
            case 'completed': return <FaCheckCircle className="w-3 h-3" />;
            default: return <FaClock className="w-3 h-3" />;
        }
    };

    // دالة تحديث حالة الفاتورة إلى التجهيز
    const updateStatusToPreparing = async (saleId) => {
        if (confirm('هل أنت متأكد من تحويل الفاتورة إلى حالة التجهيز؟')) {
            try {
                await router.patch(`/admin/invoices/${saleId}/status`, {
                    status: 'preparing',
                    status_notes: 'تم تحويل الفاتورة إلى قيد التجهيز'
                });
            } catch (error) {
                console.error('Error updating status:', error);
                alert('حدث خطأ أثناء تحديث حالة الفاتورة');
            }
        }
    };

    return (
        <AdminLayout title="إدارة الفواتير">
            <Head title="إدارة الفواتير" />

            <div className="space-y-6">
                {/* بطاقات الإحصائيات */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FaChartLine className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="mr-3">
                                <p className="text-sm font-medium text-gray-900">إجمالي الفواتير</p>
                                <p className="text-lg font-bold text-blue-600">{stats.total_sales}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FaMoneyBillWave className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="mr-3">
                                <p className="text-sm font-medium text-gray-900">إجمالي المبالغ</p>
                                <p className="text-lg font-bold text-green-600">{parseInt(stats.total_amount).toLocaleString('en-US')} IQD</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <FaChartLine className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="mr-3">
                                <p className="text-sm font-medium text-gray-900">إجمالي الأرباح</p>
                                <p className="text-lg font-bold text-emerald-600">{parseInt(stats.total_profit || 0).toLocaleString('en-US')} IQD</p>
                            </div>
                        </div>
                    </div>                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div className="mr-3">
                                <p className="text-sm font-medium text-gray-900">في الانتظار</p>
                                <p className="text-lg font-bold text-yellow-600">{stats.pending_invoices}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <FaCalendarDay className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="mr-3">
                                <p className="text-sm font-medium text-gray-900">اليوم</p>
                                <p className="text-lg font-bold text-indigo-600">{stats.today_sales}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FaMoneyBillWave className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="mr-3">
                                <p className="text-sm font-medium text-gray-900">مبيعات اليوم</p>
                                <p className="text-lg font-bold text-purple-600">{parseInt(stats.today_amount).toLocaleString('en-US')} IQD</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* شريط البحث والفلاتر */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* البحث */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">البحث</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="رقم الفاتورة، العميل، المندوب..."
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <FaSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        {/* حالة الفاتورة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">حالة الفاتورة</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* حالة الدفع */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">حالة الدفع</label>
                            <select
                                value={selectedPaymentStatus}
                                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {paymentStatusOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* المندوب */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">المندوب</label>
                            <select
                                value={selectedRepresentative}
                                onChange={(e) => setSelectedRepresentative(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">جميع المندوبين</option>
                                {representatives.map(rep => (
                                    <option key={rep.id} value={rep.id}>{rep.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                        {/* المورد الرئيسي */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">المورد الرئيسي</label>
                            <select
                                value={selectedSupplier}
                                onChange={(e) => setSelectedSupplier(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">جميع الموردين</option>
                                {suppliers.map(supplier => (
                                    <option key={supplier.id} value={supplier.id}>{supplier.name_ar}</option>
                                ))}
                            </select>
                        </div>

                        {/* من تاريخ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* إلى تاريخ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* ترتيب حسب */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ترتيب حسب</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="created_at">تاريخ الإنشاء</option>
                                <option value="sale_date">تاريخ البيع</option>
                                <option value="total_amount">المبلغ الإجمالي</option>
                                <option value="total_profit">الربح</option>
                                <option value="status">الحالة</option>
                            </select>
                        </div>

                        {/* عدد النتائج */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">عدد النتائج</label>
                            <select
                                value={perPage}
                                onChange={(e) => setPerPage(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="15">15</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                    </div>

                    {/* أزرار الفلاتر */}
                    <div className="flex gap-3">
                        <button
                            onClick={applyFilters}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FaSearch className="w-4 h-4" />
                            تطبيق البحث
                        </button>
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <FaFilter className="w-4 h-4" />
                            مسح الفلاتر
                        </button>
                        <button
                            onClick={() => router.get('/admin/invoices/export/excel')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <FaDownload className="w-4 h-4" />
                            تصدير Excel
                        </button>
                    </div>
                </div>

                {/* جدول الفواتير */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        رقم الفاتورة
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        المندوب
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        العميل
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        المورد الرئيسي
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        المبلغ الإجمالي
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الربح
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        حالة الفاتورة
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        حالة الدفع
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        تاريخ الإنشاء
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sales.data.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{sale.sale_number}</div>
                                            <div className="text-xs text-gray-500">#{sale.id}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">
                                                {sale.seller_representative?.name || 'غير محدد'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {sale.seller_representative?.phone}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">
                                                {sale.customer?.name || sale.customer_name || 'عميل حاضر'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {sale.customer?.phone || sale.customer_phone}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {sale.primary_supplier?.name_ar || 'غير محدد'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">
                                                {parseInt(sale.total_amount).toLocaleString('en-US')} IQD
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Paid: {parseInt(sale.paid_amount).toLocaleString('en-US')} IQD
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-medium text-green-600">
                                                {parseInt(sale.total_profit || 0).toLocaleString('en-US')} IQD
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(sale.status)}-100 text-${getStatusColor(sale.status)}-800`}>
                                                {getStatusIcon(sale.status)}
                                                {statusOptions.find(s => s.value === sale.status)?.label || sale.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getPaymentStatusColor(sale.payment_status)}-100 text-${getPaymentStatusColor(sale.payment_status)}-800`}>
                                                {paymentStatusOptions.find(s => s.value === sale.payment_status)?.label || sale.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            <div>{new Date(sale.created_at).toLocaleDateString('en-US')}</div>
                                            <div className="text-xs">{new Date(sale.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/admin/invoices/${sale.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="عرض التفاصيل"
                                                >
                                                    <FaEye className="w-4 h-4" />
                                                </Link>

                                                {/* زر التجهيز - يظهر فقط للفواتير في حالة pending */}
                                                {sale.status === 'pending' && (
                                                    <button
                                                        onClick={() => updateStatusToPreparing(sale.id)}
                                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                        title="تحويل إلى التجهيز"
                                                    >
                                                        <FaCog className="w-4 h-4" />
                                                    </button>
                                                )}

                                                <Link
                                                    href={`/admin/invoices/${sale.id}/print`}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                    title="طباعة"
                                                >
                                                    <FaPrint className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {sales.links && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <p className="text-sm text-gray-700">
                                        عرض <span className="font-medium">{sales.from}</span> إلى <span className="font-medium">{sales.to}</span> من <span className="font-medium">{sales.total}</span> نتيجة
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {sales.links.map((link, index) => {
                                        if (!link.url) {
                                            return (
                                                <span key={index} className="px-3 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg">
                                                    {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                                </span>
                                            );
                                        }

                                        return (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Index;
