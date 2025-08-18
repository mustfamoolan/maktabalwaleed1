import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function RepresentativeManagement({
    representative,
    salary_plan,
    targets = [],
    recent_sales = [],
    monthly_performance,
    suppliers = [],
    product_categories
}) {
    const [activeTab, setActiveTab] = useState('salary');
    const [showAddTarget, setShowAddTarget] = useState(false);

    // نموذج خطة الراتب
    const salaryForm = useForm({
        base_salary: salary_plan?.base_salary || 1000000,
        minimum_achievement_percentage: salary_plan?.minimum_achievement_percentage || 80,
        incentive_plan_type: salary_plan?.incentive_plan_type || 'specific_targets',
        total_target_boxes: salary_plan?.total_target_boxes || '',
        amount_per_box: salary_plan?.amount_per_box || '',
        commission_enabled: salary_plan?.commission_enabled || false,
        default_commission_percentage: salary_plan?.default_commission_percentage || '',
        effective_from: salary_plan?.effective_from || new Date().toISOString().split('T')[0],
        effective_to: salary_plan?.effective_to || '',
        notes: salary_plan?.notes || ''
    });

    // نموذج الهدف
    const targetForm = useForm({
        supplier_id: '',
        product_category: 'mixed',
        category_name: '',
        target_quantity: '',
        unit_type: 'boxes',
        period_start: new Date().toISOString().split('T')[0],
        period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        period_type: 'monthly',
        incentive_amount: '',
        bonus_percentage: '',
        notes: ''
    });

    const handleSalarySave = (e) => {
        e.preventDefault();
        salaryForm.post(`/admin/representatives/${representative.id}/salary-plan`, {
            onSuccess: () => {
                // تم الحفظ بنجاح
            }
        });
    };

    const handleTargetSave = (e) => {
        e.preventDefault();
        targetForm.post(`/admin/representatives/${representative.id}/targets`, {
            onSuccess: () => {
                setShowAddTarget(false);
                targetForm.reset();
            }
        });
    };

    const tabs = [
        { id: 'salary', name: 'خطة الراتب', icon: '💰' },
        { id: 'targets', name: 'الأهداف', icon: '🎯' },
        { id: 'performance', name: 'تقرير الأداء', icon: '📊' },
        { id: 'sales', name: 'المبيعات', icon: '🛒' },
        { id: 'customers', name: 'العملاء', icon: '👥', link: `/admin/representatives/${representative.id}/customers` },
    ];

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('ar-IQ').format(amount) + ' د.ع';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    return (
        <AdminLayout>
            <Head title={`إدارة المندوب - ${representative.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <Link
                                    href="/admin/representatives"
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">إدارة المندوب</h1>
                                    <p className="text-sm text-gray-600">{representative.name} - {representative.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {formatMoney(monthly_performance.total_sales)}
                                    </div>
                                    <div className="text-sm text-gray-600">إجمالي المبيعات الشهرية</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {monthly_performance.total_boxes}
                                    </div>
                                    <div className="text-sm text-gray-600">عدد الكراتين المباعة</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {monthly_performance.invoice_count}
                                    </div>
                                    <div className="text-sm text-gray-600">عدد الفواتير</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {formatMoney(monthly_performance.total_paid)}
                                    </div>
                                    <div className="text-sm text-gray-600">النقد الواصل</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 space-x-reverse px-6">
                            {tabs.map((tab) => (
                                tab.link ? (
                                    <Link
                                        key={tab.id}
                                        href={tab.link}
                                        className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    >
                                        <span className="mr-2">{tab.icon}</span>
                                        {tab.name}
                                    </Link>
                                ) : (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className="mr-2">{tab.icon}</span>
                                        {tab.name}
                                    </button>
                                )
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* خطة الراتب */}
                        {activeTab === 'salary' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900">خطة الراتب والحوافز</h3>
                                </div>

                                <form onSubmit={handleSalarySave} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* الراتب الأساسي */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                الراتب الأساسي (دينار عراقي)
                                            </label>
                                            <input
                                                type="number"
                                                value={salaryForm.data.base_salary}
                                                onChange={(e) => salaryForm.setData('base_salary', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="1000000"
                                            />
                                            {salaryForm.errors.base_salary && <p className="text-red-600 text-sm mt-1">{salaryForm.errors.base_salary}</p>}
                                        </div>

                                        {/* نسبة التحقيق المطلوبة */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                نسبة التحقيق المطلوبة للراتب كاملاً (%)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={salaryForm.data.minimum_achievement_percentage}
                                                onChange={(e) => salaryForm.setData('minimum_achievement_percentage', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="80"
                                            />
                                        </div>

                                        {/* نوع خطة الحوافز */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                نوع خطة الحوافز
                                            </label>
                                            <select
                                                value={salaryForm.data.incentive_plan_type}
                                                onChange={(e) => salaryForm.setData('incentive_plan_type', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="specific_targets">أهداف محددة لكل صنف/مورد</option>
                                                <option value="total_target">هدف كلي للكراتين</option>
                                                <option value="commission">نظام العمولة</option>
                                                <option value="mixed">نظام مختلط</option>
                                            </select>
                                        </div>

                                        {/* إعدادات الهدف الكلي */}
                                        {(salaryForm.data.incentive_plan_type === 'total_target' || salaryForm.data.incentive_plan_type === 'mixed') && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        عدد الكراتين المستهدف شهرياً
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={salaryForm.data.total_target_boxes}
                                                        onChange={(e) => salaryForm.setData('total_target_boxes', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="6000"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        المبلغ لكل كرتون (دينار عراقي)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={salaryForm.data.amount_per_box}
                                                        onChange={(e) => salaryForm.setData('amount_per_box', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="250"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* إعدادات العمولة */}
                                        {(salaryForm.data.incentive_plan_type === 'commission' || salaryForm.data.incentive_plan_type === 'mixed') && (
                                            <>
                                                <div className="md:col-span-2">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={salaryForm.data.commission_enabled}
                                                            onChange={(e) => salaryForm.setData('commission_enabled', e.target.checked)}
                                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                        />
                                                        <span className="mr-2 text-sm text-gray-700">تفعيل نظام العمولة</span>
                                                    </label>
                                                </div>
                                                {salaryForm.data.commission_enabled && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            نسبة العمولة الافتراضية (%)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.1"
                                                            value={salaryForm.data.default_commission_percentage}
                                                            onChange={(e) => salaryForm.setData('default_commission_percentage', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="5"
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* تاريخ بداية الخطة */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                تاريخ بداية الخطة
                                            </label>
                                            <input
                                                type="date"
                                                value={salaryForm.data.effective_from}
                                                onChange={(e) => salaryForm.setData('effective_from', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        {/* تاريخ نهاية الخطة */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                تاريخ نهاية الخطة (اختياري)
                                            </label>
                                            <input
                                                type="date"
                                                value={salaryForm.data.effective_to}
                                                onChange={(e) => salaryForm.setData('effective_to', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        {/* ملاحظات */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ملاحظات
                                            </label>
                                            <textarea
                                                value={salaryForm.data.notes}
                                                onChange={(e) => salaryForm.setData('notes', e.target.value)}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="ملاحظات حول خطة الراتب"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={salaryForm.processing}
                                            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            {salaryForm.processing ? 'جاري الحفظ...' : 'حفظ خطة الراتب'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* الأهداف */}
                        {activeTab === 'targets' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900">أهداف المندوب</h3>
                                    <button
                                        onClick={() => setShowAddTarget(true)}
                                        className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        إضافة هدف جديد
                                    </button>
                                </div>

                                {/* نموذج إضافة هدف */}
                                {showAddTarget && (
                                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">إضافة هدف جديد</h4>
                                        <form onSubmit={handleTargetSave} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* المورد */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        المورد (اختياري)
                                                    </label>
                                                    <select
                                                        value={targetForm.data.supplier_id}
                                                        onChange={(e) => targetForm.setData('supplier_id', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="">جميع الموردين</option>
                                                        {suppliers.map(supplier => (
                                                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* تصنيف المنتج */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        تصنيف المنتج
                                                    </label>
                                                    <select
                                                        value={targetForm.data.product_category}
                                                        onChange={(e) => targetForm.setData('product_category', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        {Object.entries(product_categories).map(([key, value]) => (
                                                            <option key={key} value={key}>{value}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* الكمية المستهدفة */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        الكمية المستهدفة
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={targetForm.data.target_quantity}
                                                        onChange={(e) => targetForm.setData('target_quantity', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="3000"
                                                        required
                                                    />
                                                </div>

                                                {/* فترة الهدف */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        تاريخ البداية
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={targetForm.data.period_start}
                                                        onChange={(e) => targetForm.setData('period_start', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        تاريخ النهاية
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={targetForm.data.period_end}
                                                        onChange={(e) => targetForm.setData('period_end', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        required
                                                    />
                                                </div>

                                                {/* مبلغ الحافز */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        مبلغ الحافز (د.ع)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={targetForm.data.incentive_amount}
                                                        onChange={(e) => targetForm.setData('incentive_amount', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="100000"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end space-x-3 space-x-reverse">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddTarget(false)}
                                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    إلغاء
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={targetForm.processing}
                                                    className="px-4 py-2 bg-green-600 border border-transparent rounded-md font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                                >
                                                    {targetForm.processing ? 'جاري الحفظ...' : 'حفظ الهدف'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* قائمة الأهداف */}
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الهدف</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المورد</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الفترة</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التحقيق</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {targets.map((target) => (
                                                <tr key={target.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {target.target_quantity} {target.unit_type}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {product_categories[target.product_category]}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {target.supplier?.company_name || 'جميع الموردين'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(target.period_start)} إلى {formatDate(target.period_end)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {target.achieved_quantity} / {target.target_quantity}
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                            <div
                                                                className={`h-2 rounded-full ${
                                                                    Number(target.achievement_percentage || 0) >= 100 ? 'bg-green-600' :
                                                                    Number(target.achievement_percentage || 0) >= 80 ? 'bg-blue-600' :
                                                                    Number(target.achievement_percentage || 0) >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                                                                }`}
                                                                style={{ width: `${Math.min(Number(target.achievement_percentage || 0), 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {Number(target.achievement_percentage || 0).toFixed(1)}%
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            Number(target.achievement_percentage || 0) >= 100 ? 'bg-green-100 text-green-800' :
                                                            Number(target.achievement_percentage || 0) >= 80 ? 'bg-blue-100 text-blue-800' :
                                                            Number(target.achievement_percentage || 0) >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {Number(target.achievement_percentage || 0) >= 100 ? 'محقق' :
                                                             Number(target.achievement_percentage || 0) >= 80 ? 'قريب' :
                                                             Number(target.achievement_percentage || 0) >= 50 ? 'في المسار' : 'يحتاج جهد'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => router.delete(`/admin/representatives/${representative.id}/targets/${target.id}`)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            حذف
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {targets.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            لا توجد أهداف محددة حالياً
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* تقرير الأداء */}
                        {activeTab === 'performance' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900">تقرير الأداء الشهري</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {monthly_performance.targets_achievement?.map((target, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <h4 className="font-medium text-gray-900 mb-2">{target.category}</h4>
                                            <div className="text-sm text-gray-600 mb-2">{target.supplier}</div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between">
                                                    <span>الهدف:</span>
                                                    <span className="font-medium">{target.target}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>المحقق:</span>
                                                    <span className="font-medium">{target.achieved}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>المتبقي:</span>
                                                    <span className="font-medium">{target.remaining}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>النسبة:</span>
                                                    <span className="font-medium">{Number(target.percentage || 0).toFixed(1)}%</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        Number(target.percentage || 0) >= 100 ? 'bg-green-600' :
                                                        Number(target.percentage || 0) >= 80 ? 'bg-blue-600' :
                                                        Number(target.percentage || 0) >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                                                    }`}
                                                    style={{ width: `${Math.min(Number(target.percentage || 0), 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* المبيعات الأخيرة */}
                        {activeTab === 'sales' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900">المبيعات الأخيرة</h3>
                                    <Link
                                        href={`/admin/representatives/${representative.id}/sales/add`}
                                        className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-medium text-white hover:bg-green-700"
                                    >
                                        إضافة مبيعة جديدة
                                    </Link>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المنتج</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الكمية</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {recent_sales.map((sale) => (
                                                <tr key={sale.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {sale.sale_date}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {sale.customer_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {sale.product_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {sale.quantity_sold} {sale.unit_type}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatMoney(sale.total_selling_amount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            sale.sale_status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                            sale.sale_status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                            sale.sale_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {sale.sale_status === 'delivered' ? 'تم التسليم' :
                                                             sale.sale_status === 'confirmed' ? 'مؤكد' :
                                                             sale.sale_status === 'pending' ? 'معلق' : 'ملغي'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {recent_sales.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            لا توجد مبيعات مسجلة حالياً
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
