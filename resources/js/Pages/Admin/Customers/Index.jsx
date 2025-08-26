import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FaUsers,
    FaUserCheck,
    FaUserTimes,
    FaMapMarkerAlt,
    FaSearch,
    FaFilter,
    FaEye,
    FaEdit,
    FaTrash,
    FaPhone,
    FaStickyNote,
    FaUserTag,
    FaToggleOn,
    FaToggleOff
} from 'react-icons/fa';

const Index = ({ customers, representatives, filters, stats }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRepresentative, setSelectedRepresentative] = useState(filters.representative_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedLocation, setSelectedLocation] = useState(filters.has_location || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleFilter = () => {
        const filterData = {};
        if (searchTerm) filterData.search = searchTerm;
        if (selectedRepresentative) filterData.representative_id = selectedRepresentative;
        if (selectedStatus !== '') filterData.status = selectedStatus;
        if (selectedLocation !== '') filterData.has_location = selectedLocation;

        router.get(route('admin.customers.index'), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedRepresentative('');
        setSelectedStatus('');
        setSelectedLocation('');
        router.get(route('admin.customers.index'));
    };

    const handleToggleStatus = (customerId) => {
        router.post(route('admin.customers.toggle-status', customerId), {}, {
            preserveScroll: true
        });
    };

    const handleDelete = (customerId, customerName) => {
        if (confirm(`هل أنت متأكد من حذف العميل "${customerName}"؟`)) {
            router.delete(route('admin.customers.destroy', customerId), {
                preserveScroll: true
            });
        }
    };

    return (
        <AdminLayout title="إدارة العملاء">
            <Head title="إدارة العملاء" />

            <div className="space-y-6">
                {/* رأس الصفحة */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">إدارة العملاء</h1>
                            <p className="opacity-90">عرض ومتابعة جميع عملاء المندوبين</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">{stats.total}</div>
                            <div className="text-sm opacity-90">إجمالي العملاء</div>
                        </div>
                    </div>
                </div>

                {/* كاردات الإحصائيات */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                <FaUsers className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-sm text-gray-600 mb-1">إجمالي العملاء</h3>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                <FaUserCheck className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-sm text-gray-600 mb-1">عملاء نشطون</h3>
                        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                                <FaUserTimes className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-sm text-gray-600 mb-1">غير نشطين</h3>
                        <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                <FaMapMarkerAlt className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-sm text-gray-600 mb-1">مع مواقع</h3>
                        <p className="text-2xl font-bold text-purple-600">{stats.with_location}</p>
                    </div>
                </div>

                {/* أدوات البحث والفلترة */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <FaSearch className="w-5 h-5 mr-3" />
                            البحث والفلترة
                        </h2>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            {/* البحث */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                                <div className="relative">
                                    <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="البحث في العملاء..."
                                        className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* فلتر المندوب */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">المندوب</label>
                                <select
                                    value={selectedRepresentative}
                                    onChange={(e) => setSelectedRepresentative(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">جميع المندوبين</option>
                                    {representatives.map((rep) => (
                                        <option key={rep.id} value={rep.id}>{rep.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* فلتر الحالة */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">جميع الحالات</option>
                                    <option value="1">نشط</option>
                                    <option value="0">غير نشط</option>
                                </select>
                            </div>

                            {/* فلتر الموقع */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الموقع</label>
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">الكل</option>
                                    <option value="1">مع موقع</option>
                                    <option value="0">بدون موقع</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleFilter}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FaFilter className="w-4 h-4" />
                                تطبيق الفلاتر
                            </button>
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                مسح الفلاتر
                            </button>
                        </div>
                    </div>
                </div>

                {/* قائمة العملاء */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">قائمة العملاء ({customers.data.length})</h2>
                    </div>

                    {customers.data.length === 0 ? (
                        <div className="p-8 text-center">
                            <FaUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد عملاء</h3>
                            <p className="text-gray-600">لم يتم العثور على عملاء بالمعايير المحددة</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            العميل
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            المندوب
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الهاتف
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الموقع
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الحالة
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            تاريخ الإضافة
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الإجراءات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {customers.data.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {customer.name}
                                                    </div>
                                                    {customer.notes && (
                                                        <div className="text-sm text-gray-500 truncate max-w-40">
                                                            <FaStickyNote className="inline w-3 h-3 ml-1" />
                                                            {customer.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FaUserTag className="w-4 h-4 text-blue-500 ml-2" />
                                                    <span className="text-sm text-gray-900">
                                                        {customer.representative?.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {customer.phone ? (
                                                    <div className="flex items-center">
                                                        <FaPhone className="w-3 h-3 text-green-500 ml-2" />
                                                        <span className="text-sm text-gray-900">{customer.phone}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">غير محدد</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {customer.latitude && customer.longitude ? (
                                                    <div className="flex items-center">
                                                        <FaMapMarkerAlt className="w-3 h-3 text-red-500 ml-2" />
                                                        <span className="text-sm text-green-600">موجود</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">غير محدد</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleStatus(customer.id)}
                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                                        customer.is_active
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                                >
                                                    {customer.is_active ? <FaToggleOn className="w-3 h-3" /> : <FaToggleOff className="w-3 h-3" />}
                                                    {customer.is_active ? 'نشط' : 'غير نشط'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(customer.created_at).toLocaleDateString('ar-SA')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={route('admin.customers.show', customer.id)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <FaEye className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(customer.id, customer.name)}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded"
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

                    {/* التصفح */}
                    {customers.links && customers.links.length > 3 && (
                        <div className="px-6 py-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    عرض {customers.from} إلى {customers.to} من {customers.total} عميل
                                </div>
                                <div className="flex gap-1">
                                    {customers.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 text-sm rounded ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : link.url
                                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
        </AdminLayout>
    );
};

export default Index;
