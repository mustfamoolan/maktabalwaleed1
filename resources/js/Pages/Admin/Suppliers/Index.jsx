import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ suppliers, categories, flash }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        company_name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        category_ids: [],
        is_active: true
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // التحقق من صحة البيانات
        if (!data.company_name || data.company_name.trim().length < 2) {
            console.log('اسم الشركة مطلوب وطوله على الأقل حرفين');
            return;
        }

        console.log('إرسال البيانات:', data);

        const url = editingSupplier
            ? route('admin.suppliers.update', editingSupplier.id)
            : route('admin.suppliers.store');

        const method = editingSupplier ? put : post;

        if (editingSupplier) {
            method(url, {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('تم تحديث المورد بنجاح');
                    reset();
                    setShowCreateForm(false);
                    setEditingSupplier(null);
                },
                onError: (errors) => {
                    console.log('أخطاء التحديث:', errors);
                }
            });
        } else {
            method(url, {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('تم إضافة المورد بنجاح');
                    reset();
                    setShowCreateForm(false);
                },
                onError: (errors) => {
                    console.log('أخطاء الحفظ:', errors);
                }
            });
        }
    };

    const handleEdit = (supplier) => {
        // جمع جميع معرفات الفئات
        const allCategoryIds = [];

        // إضافة الفئة الأساسية أولاً
        if (supplier.category) {
            allCategoryIds.push(supplier.category.id);
        }

        // إضافة الفئات الإضافية
        const categoriesToCheck = supplier.all_categories || supplier.categories || [];
        categoriesToCheck.forEach(category => {
            if (!allCategoryIds.includes(category.id)) {
                allCategoryIds.push(category.id);
            }
        });

        setData({
            company_name: supplier.name_ar,
            contact_person: supplier.contact_person || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
            notes: supplier.notes || '',
            category_ids: allCategoryIds,
            is_active: supplier.is_active
        });
        setEditingSupplier(supplier);
        setShowCreateForm(true);
    };

    const handleDelete = (supplier) => {
        if (confirm(`هل أنت متأكد من حذف المورد "${supplier.name_ar}"؟`)) {
            destroy(route('admin.suppliers.destroy', supplier.id));
        }
    };

    const resetForm = () => {
        reset();
        setEditingSupplier(null);
        setShowCreateForm(false);
    };

    const toggleStatus = (supplier) => {
        router.patch(route('admin.suppliers.toggle-status', supplier.id));
    };

    // فلترة الموردين
    const filteredSuppliers = suppliers.filter(supplier => {
        const matchesSearch = supplier.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (supplier.contact_person && supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (supplier.phone && supplier.phone.includes(searchTerm));

        const matchesCategory = !categoryFilter ||
                              (supplier.categories && supplier.categories.some(cat => cat.id.toString() === categoryFilter));

        const matchesStatus = !statusFilter ||
                            (statusFilter === 'active' && supplier.is_active) ||
                            (statusFilter === 'inactive' && !supplier.is_active);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Debug: طباعة بيانات الموردين
    React.useEffect(() => {
        console.log('جميع الموردين:', suppliers);
        suppliers.forEach(supplier => {
            console.log(`مورد ${supplier.name_ar}:`, {
                category_id: supplier.category_id,
                categories: supplier.categories
            });
        });
    }, [suppliers]);

    return (
        <AdminLayout>
            <Head title="إدارة الموردين" />

            <div className="space-y-6">
                {/* Flash Messages */}
                {flash && flash.success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-green-800 font-medium">{flash.success}</span>
                        </div>
                    </div>
                )}

                {flash && flash.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="text-red-800 font-medium">{flash.error}</span>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">إدارة الموردين</h1>
                        <p className="text-gray-600 mt-1">إدارة قائمة موردي الشركة ومعلوماتهم</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        إضافة مورد جديد
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">إجمالي الموردين</p>
                                <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
                            </div>
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">الموردين النشطين</p>
                                <p className="text-2xl font-bold text-green-600">{suppliers.filter(s => s.is_active).length}</p>
                            </div>
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">الموردين غير النشطين</p>
                                <p className="text-2xl font-bold text-red-600">{suppliers.filter(s => !s.is_active).length}</p>
                            </div>
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">فئات الموردين</p>
                                <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
                            </div>
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="البحث في الموردين..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">جميع الفئات</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name_ar}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">جميع الحالات</option>
                                <option value="active">نشط</option>
                                <option value="inactive">غير نشط</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Add/Edit Form */}
                {showCreateForm && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingSupplier ? 'تعديل المورد' : 'إضافة مورد جديد'}
                            </h2>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* اسم الشركة */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        اسم الشركة <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.company_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="أدخل اسم الشركة"
                                        required
                                    />
                                    {errors.company_name && (
                                        <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>
                                    )}
                                </div>

                                {/* الشخص المسؤول */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        الشخص المسؤول
                                    </label>
                                    <input
                                        type="text"
                                        value={data.contact_person}
                                        onChange={(e) => setData('contact_person', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="أدخل اسم الشخص المسؤول"
                                    />
                                </div>

                                {/* رقم الهاتف */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        رقم الهاتف
                                    </label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="أدخل رقم الهاتف"
                                    />
                                </div>

                                {/* البريد الإلكتروني */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        البريد الإلكتروني
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="أدخل البريد الإلكتروني"
                                    />
                                </div>
                            </div>

                            {/* العنوان */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    العنوان
                                </label>
                                <textarea
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows="2"
                                    placeholder="أدخل العنوان"
                                />
                            </div>

                            {/* الفئات */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    فئات المورد
                                </label>
                                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                    <div className="text-xs text-gray-500 mb-2">
                                        يمكن اختيار فئة واحدة أو أكثر. الفئة الأولى ستكون الفئة الأساسية.
                                    </div>
                                    {categories.map(category => (
                                        <label key={category.id} className="flex items-center space-x-2 space-x-reverse">
                                            <input
                                                type="checkbox"
                                                checked={data.category_ids.includes(category.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setData('category_ids', [...data.category_ids, category.id]);
                                                    } else {
                                                        setData('category_ids', data.category_ids.filter(id => id !== category.id));
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">
                                                {category.name_ar}
                                                {data.category_ids[0] === category.id && (
                                                    <span className="text-xs text-blue-600 mr-1">(أساسية)</span>
                                                )}
                                            </span>
                                        </label>
                                    ))}
                                    {data.category_ids.length === 0 && (
                                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                                            إذا لم تختر فئة، ستُختار "مواد غذائية" كفئة افتراضية
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* الملاحظات */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ملاحظات
                                </label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows="3"
                                    placeholder="أدخل أي ملاحظات إضافية"
                                />
                            </div>

                            {/* الحالة */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="is_active" className="mr-2 text-sm text-gray-700">
                                    مورد نشط
                                </label>
                            </div>

                            {/* أزرار الحفظ والإلغاء */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !data.company_name.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing ? 'جارٍ الحفظ...' : (editingSupplier ? 'تحديث' : 'حفظ')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Suppliers List */}
                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            قائمة الموردين ({filteredSuppliers.length})
                        </h3>
                    </div>

                    {filteredSuppliers.length === 0 ? (
                        <div className="p-8 text-center">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m4 0h2a2 2 0 012 2v4m-6 0a2 2 0 01-2-2V9a2 2 0 012-2z" />
                            </svg>
                            <p className="text-gray-500">لا توجد موردين مطابقين للبحث</p>
                        </div>
                    ) : (
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredSuppliers.map(supplier => (
                                    <div key={supplier.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-medium text-gray-900 truncate">
                                                {supplier.name_ar}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    supplier.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {supplier.is_active ? 'نشط' : 'غير نشط'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                                            {supplier.contact_person && (
                                                <p className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    {supplier.contact_person}
                                                </p>
                                            )}
                                            {supplier.phone && (
                                                <p className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    {supplier.phone}
                                                </p>
                                            )}
                                            {supplier.email && (
                                                <p className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    {supplier.email}
                                                </p>
                                            )}
                                        </div>

                                        {(supplier.all_categories || supplier.categories) && (supplier.all_categories || supplier.categories).length > 0 && (
                                            <div className="mb-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {(supplier.all_categories || supplier.categories).map((category) => (
                                                        <span
                                                            key={category.id}
                                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                                        >
                                                            {category.name_ar}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                                            <button
                                                onClick={() => handleEdit(supplier)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="تعديل"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(supplier)}
                                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                                title={supplier.is_active ? 'إلغاء التنشيط' : 'تنشيط'}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(supplier)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="حذف"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
