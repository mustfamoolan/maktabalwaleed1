import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import RepresentativeLayout from '@/Layouts/RepresentativeLayout';
import {
    FaUsers,
    FaUserCheck,
    FaUserTimes,
    FaMapMarkerAlt,
    FaPlus,
    FaSearch,
    FaFilter,
    FaEye,
    FaEdit,
    FaTrash,
    FaPhone,
    FaStickyNote
} from 'react-icons/fa';

const Index = ({ representative_user, customers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');

    // حساب الإحصائيات
    const stats = useMemo(() => ({
        total: customers.length,
        active: customers.filter(c => c.is_active).length,
        inactive: customers.filter(c => !c.is_active).length
    }), [customers]);

    const locatedCount = customers.filter(c => c.latitude && c.longitude).length;

    // فلترة العملاء
    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => {
            const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                customer.location_text?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === '' ||
                                (statusFilter === 'active' && customer.is_active) ||
                                (statusFilter === 'inactive' && !customer.is_active);

            return matchesSearch && matchesStatus;
        });
    }, [customers, searchTerm, statusFilter]);

    const handleDelete = (customerId, customerName) => {
        if (confirm(`هل أنت متأكد من حذف العميل "${customerName}"؟`)) {
            router.delete(route('representatives.customers.destroy', customerId), {
                preserveScroll: true
            });
        }
    };

    return (
        <RepresentativeLayout title="إدارة العملاء">
            <Head title="إدارة العملاء" />

            <div className="min-h-screen bg-gray-50 px-2 py-4">
                {/* رأس الصفحة الجميل - مثل صفحة الراتب */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">إدارة العملاء</h1>
                            <p className="opacity-90">مرحباً {representative_user.name}</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">{customers.length}</div>
                            <div className="text-sm opacity-90">إجمالي العملاء</div>
                        </div>
                    </div>
                </div>

                {/* كاردات الإحصائيات - مثل صفحة الراتب */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                <FaUsers className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <h3 className="text-xs text-gray-600 mb-1">إجمالي العملاء</h3>
                        <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                <FaUserCheck className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <h3 className="text-xs text-gray-600 mb-1">عملاء نشطون</h3>
                        <p className="text-xl font-bold text-green-600">{stats.active}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                                <FaUserTimes className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <h3 className="text-xs text-gray-600 mb-1">غير نشطين</h3>
                        <p className="text-xl font-bold text-red-600">{stats.inactive}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                <FaMapMarkerAlt className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <h3 className="text-xs text-gray-600 mb-1">مع مواقع</h3>
                        <p className="text-xl font-bold text-purple-600">{locatedCount}</p>
                    </div>
                </div>

                {/* أدوات البحث والفلترة - بتصميم أنيق مثل صفحة الراتب */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FaSearch className="w-5 h-5 mr-3" />
                            البحث والفلترة
                        </h2>
                    </div>

                    <div className="p-4">
                        {/* البحث */}
                        <div className="relative mb-4">
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="البحث في العملاء..."
                                className="w-full pr-10 pl-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* زر الفلاتر */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <FaFilter className="w-4 h-4" />
                                فلترة
                            </button>
                            <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                                {filteredCustomers.length} من {customers.length} عميل
                            </span>
                        </div>

                        {/* الفلاتر */}
                        {showFilters && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm font-medium text-gray-700 mb-2">حالة العميل</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">جميع العملاء</option>
                                    <option value="active">نشط فقط</option>
                                    <option value="inactive">غير نشط فقط</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* زر إضافة عميل جديد - مع تصميم جميل */}
                <div className="mb-6">
                    <Link
                        href={route('representatives.customers.create')}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 text-lg font-medium shadow-lg"
                    >
                        <FaPlus className="w-5 h-5" />
                        إضافة عميل جديد
                    </Link>
                </div>

                {/* قائمة العملاء - بتصميم أنيق */}
                {filteredCustomers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <FaUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد عملاء</h3>
                        <p className="text-gray-600 mb-4">لم يتم العثور على عملاء بالمعايير المحددة</p>
                        <Link
                            href={route('representatives.customers.create')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FaPlus className="w-4 h-4" />
                            إضافة أول عميل
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCustomers.map((customer) => (
                            <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                {/* رأس الكارد */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            {customer.name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            {customer.phone && (
                                                <div className="flex items-center gap-1">
                                                    <FaPhone className="w-3 h-3" />
                                                    <span>{customer.phone}</span>
                                                </div>
                                            )}
                                            {customer.location_text && (
                                                <div className="flex items-center gap-1">
                                                    <FaMapMarkerAlt className="w-3 h-3" />
                                                    <span className="truncate max-w-32">{customer.location_text}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* حالة العميل */}
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        customer.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {customer.is_active ? 'نشط' : 'غير نشط'}
                                    </span>
                                </div>

                                {/* الملاحظات */}
                                {customer.notes && (
                                    <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                                        <FaStickyNote className="inline w-3 h-3 ml-1" />
                                        {customer.notes}
                                    </div>
                                )}

                                {/* الأزرار */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div className="flex gap-2">
                                        <Link
                                            href={route('representatives.customers.show', customer.id)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <FaEye className="w-4 h-4" />
                                        </Link>

                                        <Link
                                            href={route('representatives.customers.edit', customer.id)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        >
                                            <FaEdit className="w-4 h-4" />
                                        </Link>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(customer.id, customer.name)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* تاريخ الإضافة */}
                                <div className="mt-2 text-xs text-gray-500">
                                    تاريخ الإضافة: {customer.created_at}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </RepresentativeLayout>
    );
};

export default Index;
