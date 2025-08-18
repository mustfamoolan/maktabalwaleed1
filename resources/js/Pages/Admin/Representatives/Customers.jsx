import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function RepresentativeCustomers({
    representative,
    customers,
    stats,
    governorates = [],
    filters = {}
}) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    // نموذج إضافة عميل جديد
    const customerForm = useForm({
        customer_name: '',
        phone: '',
        address: '',
        governorate: '',
        city: '',
        nearest_landmark: '',
        notes: ''
    });

    // نموذج التعديل
    const editForm = useForm({
        customer_name: '',
        phone: '',
        address: '',
        governorate: '',
        city: '',
        nearest_landmark: '',
        status: 'active',
        notes: ''
    });

    // نموذج البحث والفلترة
    const searchForm = useForm({
        search: filters.search || '',
        governorate: filters.governorate || '',
        status: filters.status || '',
        has_debt: filters.has_debt || '',
        overdue: filters.overdue || ''
    });

    const handleAddCustomer = (e) => {
        e.preventDefault();
        customerForm.post(`/admin/representatives/${representative.id}/customers`, {
            onSuccess: () => {
                setShowAddForm(false);
                customerForm.reset();
            }
        });
    };

    const handleEditCustomer = (e) => {
        e.preventDefault();
        editForm.put(`/admin/representatives/${representative.id}/customers/${editingCustomer.id}`, {
            onSuccess: () => {
                setEditingCustomer(null);
                editForm.reset();
            }
        });
    };

    const startEdit = (customer) => {
        setEditingCustomer(customer);
        editForm.setData({
            customer_name: customer.customer_name,
            phone: customer.phone || '',
            address: customer.address,
            governorate: customer.governorate,
            city: customer.city,
            nearest_landmark: customer.nearest_landmark || '',
            status: customer.status,
            notes: customer.notes || ''
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(`/admin/representatives/${representative.id}/customers`, searchForm.data);
    };

    const clearFilters = () => {
        searchForm.reset();
        router.get(`/admin/representatives/${representative.id}/customers`);
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('ar-IQ').format(amount) + ' د.ع';
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'active': return 'نشط';
            case 'inactive': return 'غير نشط';
            case 'suspended': return 'معلق';
            default: return 'غير محدد';
        }
    };

    return (
        <AdminLayout>
            <Head title={`عملاء المندوب - ${representative.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <Link
                                    href={`/admin/representatives/${representative.id}/manage`}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">عملاء المندوب</h1>
                                    <p className="text-sm text-gray-600">{representative.name} - {stats.total_customers} عميل</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                إضافة عميل جديد
                            </button>
                        </div>
                    </div>

                    {/* إحصائيات سريعة */}
                    <div className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{stats.total_customers}</div>
                                    <div className="text-sm text-gray-600">إجمالي العملاء</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{stats.active_customers}</div>
                                    <div className="text-sm text-gray-600">العملاء النشطين</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{stats.customers_with_debt}</div>
                                    <div className="text-sm text-gray-600">لديهم ديون</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{stats.overdue_customers}</div>
                                    <div className="text-sm text-gray-600">متأخرين السداد</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-purple-600">{formatMoney(stats.total_debt)}</div>
                                    <div className="text-sm text-gray-600">إجمالي الديون</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-emerald-600">{formatMoney(stats.total_paid)}</div>
                                    <div className="text-sm text-gray-600">إجمالي المدفوع</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* البحث والفلترة */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData('search', e.target.value)}
                                    placeholder="بحث بالاسم أو الهاتف أو المدينة..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <select
                                    value={searchForm.data.governorate}
                                    onChange={(e) => searchForm.setData('governorate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">جميع المحافظات</option>
                                    {governorates.map(gov => (
                                        <option key={gov} value={gov}>{gov}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <select
                                    value={searchForm.data.status}
                                    onChange={(e) => searchForm.setData('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">جميع الحالات</option>
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                    <option value="suspended">معلق</option>
                                </select>
                            </div>
                            <div>
                                <select
                                    value={searchForm.data.has_debt}
                                    onChange={(e) => searchForm.setData('has_debt', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">جميع العملاء</option>
                                    <option value="1">المدينين فقط</option>
                                </select>
                            </div>
                            <div className="flex space-x-2 space-x-reverse">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    بحث
                                </button>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    مسح
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* قائمة العملاء */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموقع</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المالية</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإحصائيات</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {customers.data.map((customer) => (
                                <tr key={customer.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{customer.customer_name}</div>
                                        {customer.phone && <div className="text-sm text-gray-500">{customer.phone}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{customer.governorate} - {customer.city}</div>
                                        {customer.nearest_landmark && <div className="text-sm text-gray-500">{customer.nearest_landmark}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">الدين: {formatMoney(customer.total_debt)}</div>
                                        <div className="text-sm text-gray-500">المدفوع: {formatMoney(customer.total_paid)}</div>
                                        {customer.debt_due_date && (
                                            <div className={`text-sm ${customer.is_overdue ? 'text-red-600' : 'text-gray-500'}`}>
                                                الاستحقاق: {customer.debt_due_date}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{customer.total_purchases} مشترى</div>
                                        <div className="text-sm text-gray-500">
                                            مكتمل: {customer.completed_invoices} | ملغي: {customer.cancelled_invoices}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                                            {getStatusText(customer.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse">
                                        <button
                                            onClick={() => startEdit(customer)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            تعديل
                                        </button>
                                        <Link
                                            href={`/admin/representatives/${representative.id}/customers/${customer.id}`}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            تفاصيل
                                        </Link>
                                        <button
                                            onClick={() => {
                                                if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
                                                    router.delete(`/admin/representatives/${representative.id}/customers/${customer.id}`);
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            حذف
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {customers.data.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            لا توجد عملاء مطابقين للبحث
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {customers.links && customers.links.length > 3 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            {customers.prev_page_url && (
                                <Link href={customers.prev_page_url} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                    السابق
                                </Link>
                            )}
                            {customers.next_page_url && (
                                <Link href={customers.next_page_url} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                    التالي
                                </Link>
                            )}
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    عرض من <span className="font-medium">{customers.from}</span> إلى <span className="font-medium">{customers.to}</span> من <span className="font-medium">{customers.total}</span> نتيجة
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    {customers.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                link.active
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            } ${index === 0 ? 'rounded-r-md' : ''} ${index === customers.links.length - 1 ? 'rounded-l-md' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* نموذج إضافة عميل جديد */}
            {showAddForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">إضافة عميل جديد</h3>
                            <form onSubmit={handleAddCustomer} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">اسم العميل *</label>
                                        <input
                                            type="text"
                                            value={customerForm.data.customer_name}
                                            onChange={(e) => customerForm.setData('customer_name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {customerForm.errors.customer_name && <p className="text-red-600 text-sm mt-1">{customerForm.errors.customer_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                                        <input
                                            type="text"
                                            value={customerForm.data.phone}
                                            onChange={(e) => customerForm.setData('phone', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">المحافظة *</label>
                                        <input
                                            type="text"
                                            value={customerForm.data.governorate}
                                            onChange={(e) => customerForm.setData('governorate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {customerForm.errors.governorate && <p className="text-red-600 text-sm mt-1">{customerForm.errors.governorate}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">المدينة *</label>
                                        <input
                                            type="text"
                                            value={customerForm.data.city}
                                            onChange={(e) => customerForm.setData('city', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {customerForm.errors.city && <p className="text-red-600 text-sm mt-1">{customerForm.errors.city}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">العنوان *</label>
                                        <textarea
                                            value={customerForm.data.address}
                                            onChange={(e) => customerForm.setData('address', e.target.value)}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {customerForm.errors.address && <p className="text-red-600 text-sm mt-1">{customerForm.errors.address}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">أقرب نقطة دالة</label>
                                        <input
                                            type="text"
                                            value={customerForm.data.nearest_landmark}
                                            onChange={(e) => customerForm.setData('nearest_landmark', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="مثل: قرب مسجد الرحمة أو بجانب السوق المركزي"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                                        <textarea
                                            value={customerForm.data.notes}
                                            onChange={(e) => customerForm.setData('notes', e.target.value)}
                                            rows="2"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 space-x-reverse">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={customerForm.processing}
                                        className="px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {customerForm.processing ? 'جاري الحفظ...' : 'حفظ العميل'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* نموذج تعديل عميل */}
            {editingCustomer && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">تعديل بيانات العميل</h3>
                            <form onSubmit={handleEditCustomer} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">اسم العميل *</label>
                                        <input
                                            type="text"
                                            value={editForm.data.customer_name}
                                            onChange={(e) => editForm.setData('customer_name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {editForm.errors.customer_name && <p className="text-red-600 text-sm mt-1">{editForm.errors.customer_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                                        <input
                                            type="text"
                                            value={editForm.data.phone}
                                            onChange={(e) => editForm.setData('phone', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">المحافظة *</label>
                                        <input
                                            type="text"
                                            value={editForm.data.governorate}
                                            onChange={(e) => editForm.setData('governorate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {editForm.errors.governorate && <p className="text-red-600 text-sm mt-1">{editForm.errors.governorate}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">المدينة *</label>
                                        <input
                                            type="text"
                                            value={editForm.data.city}
                                            onChange={(e) => editForm.setData('city', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {editForm.errors.city && <p className="text-red-600 text-sm mt-1">{editForm.errors.city}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">الحالة *</label>
                                        <select
                                            value={editForm.data.status}
                                            onChange={(e) => editForm.setData('status', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="active">نشط</option>
                                            <option value="inactive">غير نشط</option>
                                            <option value="suspended">معلق</option>
                                        </select>
                                        {editForm.errors.status && <p className="text-red-600 text-sm mt-1">{editForm.errors.status}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">أقرب نقطة دالة</label>
                                        <input
                                            type="text"
                                            value={editForm.data.nearest_landmark}
                                            onChange={(e) => editForm.setData('nearest_landmark', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">العنوان *</label>
                                        <textarea
                                            value={editForm.data.address}
                                            onChange={(e) => editForm.setData('address', e.target.value)}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {editForm.errors.address && <p className="text-red-600 text-sm mt-1">{editForm.errors.address}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                                        <textarea
                                            value={editForm.data.notes}
                                            onChange={(e) => editForm.setData('notes', e.target.value)}
                                            rows="2"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 space-x-reverse">
                                    <button
                                        type="button"
                                        onClick={() => setEditingCustomer(null)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {editForm.processing ? 'جاري الحفظ...' : 'تحديث البيانات'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
