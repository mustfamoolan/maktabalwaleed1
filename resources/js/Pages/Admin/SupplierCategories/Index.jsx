import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ categories }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name_ar: '',
        name_en: '',
        description: '',
        commission_rate: 0,
        color_code: '#007bff',
        sort_order: 0,
        is_active: true
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingCategory) {
            put(route('admin.supplier-categories.update', editingCategory.id), {
                onSuccess: () => {
                    reset();
                    setEditingCategory(null);
                    setShowCreateForm(false);
                }
            });
        } else {
            post(route('admin.supplier-categories.store'), {
                onSuccess: () => {
                    reset();
                    setShowCreateForm(false);
                }
            });
        }
    };

    const handleEdit = (category) => {
        setData({
            name_ar: category.name_ar,
            name_en: category.name_en || '',
            description: category.description || '',
            commission_rate: category.commission_rate,
            color_code: category.color_code,
            sort_order: category.sort_order,
            is_active: category.is_active
        });
        setEditingCategory(category);
        setShowCreateForm(true);
    };

    const handleDelete = (category) => {
        if (confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
            destroy(route('admin.supplier-categories.destroy', category.id));
        }
    };

    const resetForm = () => {
        reset();
        setEditingCategory(null);
        setShowCreateForm(false);
    };

    return (
        <AdminLayout>
            <Head title="إدارة فئات الموردين" />

            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white shadow-sm rounded-lg mb-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">فئات الموردين</h1>
                                    <p className="text-gray-600 mt-1">إدارة وتصنيف الموردين حسب النوع</p>
                                </div>
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                                >
                                    + إضافة فئة جديدة
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Create/Edit Form */}
                    {showCreateForm && (
                        <div className="bg-white shadow-sm rounded-lg mb-6">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {editingCategory ? 'تعديل فئة المورد' : 'إضافة فئة مورد جديدة'}
                                </h2>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            الاسم بالعربية *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name_ar}
                                            onChange={(e) => setData('name_ar', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.name_ar && <p className="text-red-500 text-sm mt-1">{errors.name_ar}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            الاسم بالإنجليزية
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name_en}
                                            onChange={(e) => setData('name_en', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.name_en && <p className="text-red-500 text-sm mt-1">{errors.name_en}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            نسبة العمولة (%)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={data.commission_rate}
                                            onChange={(e) => setData('commission_rate', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.commission_rate && <p className="text-red-500 text-sm mt-1">{errors.commission_rate}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            لون الفئة
                                        </label>
                                        <input
                                            type="color"
                                            value={data.color_code}
                                            onChange={(e) => setData('color_code', e.target.value)}
                                            className="w-20 h-10 border border-gray-300 rounded-md cursor-pointer"
                                        />
                                        {errors.color_code && <p className="text-red-500 text-sm mt-1">{errors.color_code}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ترتيب العرض
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.sort_order}
                                            onChange={(e) => setData('sort_order', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.sort_order && <p className="text-red-500 text-sm mt-1">{errors.sort_order}</p>}
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                        />
                                        <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                                            فئة نشطة
                                        </label>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الوصف
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows="3"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="وصف الفئة ونوع الموردين التابعين لها..."
                                    />
                                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                </div>

                                <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'جاري الحفظ...' : (editingCategory ? 'تحديث' : 'حفظ')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Categories Grid */}
                    <div className="bg-white shadow-sm rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                قائمة الفئات ({categories.length})
                            </h2>
                        </div>

                        {categories.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                الفئة
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                نسبة العمولة
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                عدد الموردين
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
                                        {categories.map((category) => (
                                            <tr key={category.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div
                                                            className="w-4 h-4 rounded-full mr-3"
                                                            style={{ backgroundColor: category.color_code }}
                                                        ></div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {category.name_ar}
                                                            </div>
                                                            {category.name_en && (
                                                                <div className="text-sm text-gray-500">
                                                                    {category.name_en}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {category.commission_rate}%
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {category.suppliers?.length || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        category.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {category.is_active ? 'نشطة' : 'غير نشطة'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2 space-x-reverse">
                                                        <button
                                                            onClick={() => handleEdit(category)}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                                        >
                                                            تعديل
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(category)}
                                                            className="text-red-600 hover:text-red-900 transition-colors"
                                                        >
                                                            حذف
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-gray-500 text-lg mb-4">لا توجد فئات موردين</div>
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
                                >
                                    إضافة أول فئة
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
