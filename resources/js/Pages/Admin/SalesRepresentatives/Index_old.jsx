import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Index({ representatives, incentivePlans }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [regionFilter, setRegionFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRepresentative, setEditingRepresentative] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name_ar: '',
        name_en: '',
        email: '',
        phone: '',
        password: '',
        hire_date: '',
        base_salary: '',
        commission_rate: '',
        address: '',
        national_id: '',
        region: '',
        is_active: true,
        incentive_plans: [],
    });

    // فلترة المندوبين
    const filteredRepresentatives = representatives.filter(rep => {
        const matchesSearch = !searchTerm ||
            rep.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rep.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rep.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rep.phone.includes(searchTerm);

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && rep.is_active) ||
            (statusFilter === 'inactive' && !rep.is_active);

        const matchesRegion = regionFilter === 'all' || rep.region === regionFilter;

        return matchesSearch && matchesStatus && matchesRegion;
    });

    // الحصول على قائمة المناطق الفريدة
    const uniqueRegions = [...new Set(representatives.map(rep => rep.region).filter(Boolean))];

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingRepresentative) {
            put(`/admin/sales-representatives/${editingRepresentative.id}`, {
                onSuccess: () => {
                    setShowAddModal(false);
                    setEditingRepresentative(null);
                    reset();
                }
            });
        } else {
            post('/admin/sales-representatives', {
                onSuccess: () => {
                    setShowAddModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (representative) => {
        setEditingRepresentative(representative);
        setData({
            name_ar: representative.name_ar,
            name_en: representative.name_en || '',
            email: representative.email,
            phone: representative.phone,
            password: '',
            hire_date: representative.hire_date,
            base_salary: representative.base_salary,
            commission_rate: representative.commission_rate,
            address: representative.address || '',
            national_id: representative.national_id,
            region: representative.region || '',
            is_active: representative.is_active,
            incentive_plans: representative.incentive_plans.map(p => p.id),
        });
        setShowAddModal(true);
    };

    const handleDelete = (representative) => {
        if (confirm(`هل أنت متأكد من حذف المندوب ${representative.name_ar}؟`)) {
            router.delete(`/admin/sales-representatives/${representative.id}`);
        }
    };

    const toggleStatus = (representative) => {
        router.put(`/admin/sales-representatives/${representative.id}/toggle-status`);
    };

    const openAddModal = () => {
        setEditingRepresentative(null);
        reset();
        setShowAddModal(true);
    };

    // تنسيق العملة
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    return (
        <AdminLayout>
            <Head title="إدارة المندوبين" />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">إدارة المندوبين</h1>
                                <p className="text-gray-600 mt-1">إدارة فريق المبيعات والحوافز</p>
                            </div>
                            <button
                                onClick={openAddModal}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                إضافة مندوب جديد
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-4 sm:px-6 lg:px-8 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="البحث..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">جميع الحالات</option>
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                </select>
                            </div>

                            <div>
                                <select
                                    value={regionFilter}
                                    onChange={(e) => setRegionFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">جميع المناطق</option>
                                    {uniqueRegions.map(region => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="text-sm text-gray-600 flex items-center">
                                المجموع: {filteredRepresentatives.length} مندوب
                            </div>
                        </div>
                    </div>
                </div>

                {/* Representatives Grid */}
                <div className="px-4 sm:px-6 lg:px-8 py-6">
                    {filteredRepresentatives.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <div className="text-gray-400 text-6xl mb-4">👥</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد مندوبين</h3>
                            <p className="text-gray-600 mb-4">لم يتم العثور على أي مندوبين. ابدأ بإضافة مندوب جديد.</p>
                            <button
                                onClick={openAddModal}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                            >
                                إضافة المندوب الأول
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredRepresentatives.map((representative) => (
                                <div key={representative.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">{representative.name_ar}</h3>
                                                {representative.name_en && (
                                                    <p className="text-sm text-gray-600">{representative.name_en}</p>
                                                )}
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                representative.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {representative.is_active ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                                </svg>
                                                {representative.email}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                                </svg>
                                                {representative.phone}
                                            </div>
                                            {representative.region && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                    </svg>
                                                    {representative.region}
                                                </div>
                                            )}
                                        </div>

                                        {/* Statistics */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                <div className="text-lg font-bold text-blue-600">{representative.customers_count}</div>
                                                <div className="text-xs text-blue-600">عملاء</div>
                                            </div>
                                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                                <div className="text-lg font-bold text-green-600">{representative.sales_count}</div>
                                                <div className="text-xs text-green-600">مبيعات</div>
                                            </div>
                                        </div>

                                        {/* Financial Info */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">الراتب الأساسي:</span>
                                                <span className="font-medium text-gray-900">{formatCurrency(representative.base_salary)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">إجمالي المبيعات:</span>
                                                <span className="font-medium text-green-600">{formatCurrency(representative.total_sales)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">نسبة العمولة:</span>
                                                <span className="font-medium text-gray-900">{representative.commission_rate}%</span>
                                            </div>
                                        </div>

                                        {/* Incentive Plans */}
                                        {representative.incentive_plans.length > 0 && (
                                            <div className="mb-4">
                                                <div className="text-xs text-gray-500 mb-2">خطط الحوافز:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {representative.incentive_plans.map((plan) => (
                                                        <span
                                                            key={plan.id}
                                                            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                                                        >
                                                            {plan.name_ar}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(representative)}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg transition-colors"
                                            >
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(representative)}
                                                className={`flex-1 text-sm py-2 px-3 rounded-lg transition-colors ${
                                                    representative.is_active
                                                        ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                                                        : 'bg-green-100 hover:bg-green-200 text-green-800'
                                                }`}
                                            >
                                                {representative.is_active ? 'إيقاف' : 'تفعيل'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(representative)}
                                                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add/Edit Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingRepresentative ? 'تعديل مندوب' : 'إضافة مندوب جديد'}
                                    </h2>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="text-gray-400 hover:text-gray-600 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* الصف الأول */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">الاسم بالعربية *</label>
                                        <input
                                            type="text"
                                            value={data.name_ar}
                                            onChange={(e) => setData('name_ar', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {errors.name_ar && <div className="text-red-500 text-xs mt-1">{errors.name_ar}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">الاسم بالإنجليزية</label>
                                        <input
                                            type="text"
                                            value={data.name_en}
                                            onChange={(e) => setData('name_en', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {errors.name_en && <div className="text-red-500 text-xs mt-1">{errors.name_en}</div>}
                                    </div>

                                    {/* الصف الثاني */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني *</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
                                    </div>

                                    {/* الصف الثالث */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {editingRepresentative ? 'كلمة المرور (اتركها فارغة إذا لم تريد تغييرها)' : 'كلمة المرور *'}
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required={!editingRepresentative}
                                        />
                                        {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهوية الوطنية *</label>
                                        <input
                                            type="text"
                                            value={data.national_id}
                                            onChange={(e) => setData('national_id', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {errors.national_id && <div className="text-red-500 text-xs mt-1">{errors.national_id}</div>}
                                    </div>

                                    {/* الصف الرابع */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ التوظيف *</label>
                                        <input
                                            type="date"
                                            value={data.hire_date}
                                            onChange={(e) => setData('hire_date', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {errors.hire_date && <div className="text-red-500 text-xs mt-1">{errors.hire_date}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">المنطقة</label>
                                        <input
                                            type="text"
                                            value={data.region}
                                            onChange={(e) => setData('region', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="مثل: بغداد، البصرة، إلخ"
                                        />
                                        {errors.region && <div className="text-red-500 text-xs mt-1">{errors.region}</div>}
                                    </div>

                                    {/* الصف الخامس */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">الراتب الأساسي (دينار عراقي) *</label>
                                        <input
                                            type="number"
                                            value={data.base_salary}
                                            onChange={(e) => setData('base_salary', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            min="0"
                                            required
                                        />
                                        {errors.base_salary && <div className="text-red-500 text-xs mt-1">{errors.base_salary}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">نسبة العمولة (%) *</label>
                                        <input
                                            type="number"
                                            value={data.commission_rate}
                                            onChange={(e) => setData('commission_rate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            required
                                        />
                                        {errors.commission_rate && <div className="text-red-500 text-xs mt-1">{errors.commission_rate}</div>}
                                    </div>

                                    {/* العنوان */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                                        <textarea
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="العنوان التفصيلي"
                                        />
                                        {errors.address && <div className="text-red-500 text-xs mt-1">{errors.address}</div>}
                                    </div>

                                    {/* خطط الحوافز */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">خطط الحوافز</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {incentivePlans.map((plan) => (
                                                <div key={plan.id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`plan-${plan.id}`}
                                                        checked={data.incentive_plans.includes(plan.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setData('incentive_plans', [...data.incentive_plans, plan.id]);
                                                            } else {
                                                                setData('incentive_plans', data.incentive_plans.filter(id => id !== plan.id));
                                                            }
                                                        }}
                                                        className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor={`plan-${plan.id}`} className="text-sm text-gray-700">
                                                        {plan.name_ar} ({plan.rate}%)
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.incentive_plans && <div className="text-red-500 text-xs mt-1">{errors.incentive_plans}</div>}
                                    </div>

                                    {/* الحالة */}
                                    <div className="md:col-span-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="text-sm text-gray-700">المندوب نشط</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-2"
                                    >
                                        {processing && (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        )}
                                        {editingRepresentative ? 'تحديث' : 'إضافة'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
