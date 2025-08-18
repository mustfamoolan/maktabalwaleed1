import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Suppliers({ suppliers = [], supplierTypes = [] }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        company_name: '',
        supplier_type_ids: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedSupplier) {
            put(`/admin/suppliers/${selectedSupplier.id}`, {
                onSuccess: () => {
                    setShowAddForm(false);
                    setSelectedSupplier(null);
                    reset();
                }
            });
        } else {
            post('/admin/suppliers', {
                onSuccess: () => {
                    setShowAddForm(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (supplier) => {
        setSelectedSupplier(supplier);
        setData({
            company_name: supplier.company_name,
            supplier_type_ids: supplier.supplier_types?.map(type => type.id) || [],
        });
        setShowAddForm(true);
    };

    const mockSuppliers = [
        { id: 1, company_name: 'شركة الأمل للتوريدات', supplier_types: [{ name: 'المنظفات' }, { name: 'المواد الغذائية' }], is_active: true },
        { id: 2, company_name: 'مؤسسة النور التجارية', supplier_types: [{ name: 'الحفاظات' }], is_active: true },
        { id: 3, company_name: 'شركة الخليج للمواد الغذائية', supplier_types: [{ name: 'المواد الغذائية' }], is_active: true },
        { id: 4, company_name: 'مجموعة السلام للمنظفات', supplier_types: [{ name: 'المنظفات' }], is_active: false },
    ];

    const mockSupplierTypes = [
        { id: 1, name: 'المنظفات' },
        { id: 2, name: 'المواد الغذائية' },
        { id: 3, name: 'الحفاظات' },
    ];

    const displaySuppliers = suppliers.length > 0 ? suppliers : mockSuppliers;
    const displayTypes = supplierTypes.length > 0 ? supplierTypes : mockSupplierTypes;

    return (
        <AdminLayout>
            <Head title="إدارة الموردين - المقر الرئيسي" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">إدارة الموردين</h1>
                                    <p className="text-sm text-gray-600">إدارة وتتبع جميع الموردين والشركات</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddForm(true);
                                    setSelectedSupplier(null);
                                    reset();
                                }}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 border border-transparent rounded-lg font-medium text-white hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                            >
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                إضافة مورد جديد
                            </button>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">إجمالي الموردين</p>
                                        <p className="text-lg font-bold text-gray-900">{displaySuppliers.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">الموردين النشطين</p>
                                        <p className="text-lg font-bold text-gray-900">{displaySuppliers.filter(s => s.is_active).length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">أنواع المنتجات</p>
                                        <p className="text-lg font-bold text-gray-900">{displayTypes.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">غير نشطين</p>
                                        <p className="text-lg font-bold text-gray-900">{displaySuppliers.filter(s => !s.is_active).length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add/Edit Form */}
                {showAddForm && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                {selectedSupplier ? 'تعديل المورد' : 'إضافة مورد جديد'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                                        اسم الشركة *
                                    </label>
                                    <input
                                        type="text"
                                        id="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="اسم الشركة"
                                        required
                                    />
                                    {errors.company_name && <p className="text-red-600 text-sm mt-1">{errors.company_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        نوع المورد *
                                    </label>
                                    <div className="space-y-2">
                                        {displayTypes.map((type) => (
                                            <label key={type.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.supplier_type_ids.includes(type.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setData('supplier_type_ids', [...data.supplier_type_ids, type.id]);
                                                        } else {
                                                            setData('supplier_type_ids', data.supplier_type_ids.filter(id => id !== type.id));
                                                        }
                                                    }}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <span className="mr-2 text-sm text-gray-700">{type.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.supplier_type_ids && <p className="text-red-600 text-sm mt-1">{errors.supplier_type_ids}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setSelectedSupplier(null);
                                        reset();
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {processing ? 'جاري الحفظ...' : (selectedSupplier ? 'تحديث' : 'حفظ')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Excel-style Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                                        #
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                                        اسم الشركة
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                                        نوع المورد
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                                        الحالة
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {displaySuppliers.map((supplier, index) => (
                                    <tr key={supplier.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-200">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-l border-gray-200">
                                            {supplier.company_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-200">
                                            <div className="flex flex-wrap gap-1">
                                                {supplier.supplier_types?.map((type, idx) => (
                                                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {type.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-200">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                supplier.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {supplier.is_active ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2 space-x-reverse">
                                                <button
                                                    onClick={() => handleEdit(supplier)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    تعديل
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    حذف
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
