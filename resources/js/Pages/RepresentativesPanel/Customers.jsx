import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import RepresentativeLayout from '@/Layouts/RepresentativeLayout';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function Customers({ representative_user, customers = [], total = 0, filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/representatives/customers', { search: searchTerm });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD'
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            case 'suspended':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active':
                return 'نشط';
            case 'inactive':
                return 'غير نشط';
            case 'suspended':
                return 'معلق';
            default:
                return status;
        }
    };

    return (
        <RepresentativeLayout>
            <Head title="العملاء - المندوبين" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">عملائي</h1>
                            <p className="text-gray-600">إدارة قائمة عملائك والتواصل معهم ({total} عميل)</p>
                        </div>
                        <Link
                            href="/representatives/customers/create"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <FaPlus className="ml-2" />
                            إضافة عميل جديد
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="البحث في العملاء (الاسم، الهاتف، المحافظة...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            بحث
                        </button>
                    </form>
                </div>

                {/* العملاء */}
                {customers && customers.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            العميل
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الموقع
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الفواتير
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            المديونية
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الحالة
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الإجراءات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {customers.map((customer, index) => (
                                        <tr key={customer.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center text-blue-600 font-medium ml-3">
                                                        {customer.customer_name?.charAt(0) || 'ع'}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {customer.customer_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            <FaPhone className="ml-1" />
                                                            {customer.phone}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 flex items-center">
                                                    <FaMapMarkerAlt className="ml-1 text-gray-400" />
                                                    {customer.governorate}, {customer.city}
                                                </div>
                                                {customer.nearest_landmark && (
                                                    <div className="text-sm text-gray-500">
                                                        {customer.nearest_landmark}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    <div>مكتملة: {customer.completed_invoices}</div>
                                                    <div className="text-gray-500">ملغية: {customer.cancelled_invoices}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm">
                                                    <div className="font-medium text-red-600">
                                                        {formatCurrency(customer.total_debt)}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        مدفوع: {formatCurrency(customer.total_paid)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                                                    {getStatusText(customer.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2 space-x-reverse">
                                                    <button className="text-blue-600 hover:text-blue-900">
                                                        <FaEye />
                                                    </button>
                                                    <button className="text-yellow-600 hover:text-yellow-900">
                                                        <FaEdit />
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-900">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد عملاء بعد</h3>
                            <p className="text-gray-500 mb-6">ابدأ بإضافة أول عميل لك لتتمكن من إدارة مبيعاتك</p>
                            <Link
                                href="/representatives/customers/create"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FaPlus className="ml-2" />
                                إضافة عميل جديد
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </RepresentativeLayout>
    );
}
