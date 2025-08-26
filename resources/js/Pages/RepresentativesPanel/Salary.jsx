import React from 'react';
import { Head, Link } from '@inertiajs/react';
import RepresentativeLayout from '@/Layouts/RepresentativeLayout';
import {
    FaMoneyBillWave,
    FaChartLine,
    FaTrophy,
    FaPercentage,
    FaCalendar,
    FaBullseye
} from 'react-icons/fa';

const Salary = ({
    representative_user,
    currentSalary,
    overallAchievement = 0,
    earnedSalary = 0,
    salaryPercentage = 0,
    targetsCount = {}
}) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const getAchievementColor = (percentage) => {
        if (percentage >= 90) return 'text-green-600 bg-green-50';
        if (percentage >= 70) return 'text-blue-600 bg-blue-50';
        if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getProgressBarColor = (percentage) => {
        if (percentage >= 90) return 'bg-green-500';
        if (percentage >= 70) return 'bg-blue-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <RepresentativeLayout title="الراتب والاستحقاقات">
            <Head title="الراتب والاستحقاقات" />

            <div className="space-y-6">
                {/* رأس الصفحة */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">راتبك وإنجازك</h1>
                            <p className="opacity-90">مرحباً {representative_user?.name}</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">{Math.round(overallAchievement)}%</div>
                            <div className="text-sm opacity-90">معدل الإنجاز العام</div>
                        </div>
                    </div>
                </div>

                {/* كاردات الراتب */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* الراتب الأساسي */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                <FaMoneyBillWave className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-sm text-gray-600 mb-1">الراتب الأساسي</h3>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(currentSalary?.base_salary || 0)}
                        </p>
                    </div>

                    {/* معدل الإنجاز */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                <FaChartLine className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-sm text-gray-600 mb-1">معدل الإنجاز</h3>
                        <p className="text-2xl font-bold text-gray-900">{Math.round(overallAchievement)}%</p>
                    </div>

                    {/* الراتب المستحق */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                <FaTrophy className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-sm text-gray-600 mb-1">الراتب المستحق</h3>
                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(earnedSalary)}
                        </p>
                    </div>

                    {/* إجمالي الأهداف */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                <FaBullseye className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-sm text-gray-600 mb-1">إجمالي الأهداف</h3>
                        <p className="text-2xl font-bold text-gray-900">{targetsCount.total || 0}</p>
                    </div>
                </div>

                {/* تفاصيل الراتب */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <FaPercentage className="w-5 h-5 mr-3" />
                            تفاصيل حساب الراتب
                        </h2>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* معادلة الحساب */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">طريقة الحساب</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">الراتب الأساسي:</span>
                                        <span className="font-semibold">{formatCurrency(currentSalary?.base_salary || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">معدل الإنجاز:</span>
                                        <span className="font-semibold">{Math.round(overallAchievement)}%</span>
                                    </div>
                                    <hr className="border-gray-300" />
                                    <div className="flex justify-between items-center text-lg">
                                        <span className="text-gray-800 font-semibold">الراتب المستحق:</span>
                                        <span className="font-bold text-green-600">{formatCurrency(earnedSalary)}</span>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>المعادلة:</strong> الراتب المستحق = الراتب الأساسي × (معدل الإنجاز ÷ 100)
                                    </p>
                                </div>
                            </div>

                            {/* شريط التقدم */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">مستوى الإنجاز</h3>

                                {/* شريط التقدم الرئيسي */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">الإنجاز العام</span>
                                        <span className={`text-sm font-semibold px-2 py-1 rounded ${getAchievementColor(overallAchievement)}`}>
                                            {Math.round(overallAchievement)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(overallAchievement)}`}
                                            style={{ width: `${Math.min(overallAchievement, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* مستويات الإنجاز */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <span className="text-sm font-medium text-green-800">ممتاز (90%+)</span>
                                        <span className="text-sm text-green-600">راتب كامل + مكافآت</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <span className="text-sm font-medium text-blue-800">جيد جداً (70-89%)</span>
                                        <span className="text-sm text-blue-600">راتب حسب النسبة</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                        <span className="text-sm font-medium text-yellow-800">جيد (50-69%)</span>
                                        <span className="text-sm text-yellow-600">راتب مخفض</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <span className="text-sm font-medium text-red-800">يحتاج تحسين (أقل من 50%)</span>
                                        <span className="text-sm text-red-600">راتب أساسي فقط</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* إحصائيات الأهداف */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <FaBullseye className="w-5 h-5 mr-3" />
                            توزيع الأهداف
                        </h2>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600 mb-1">
                                    {targetsCount.individual || 0}
                                </div>
                                <div className="text-sm text-blue-800">أهداف فردية</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600 mb-1">
                                    {targetsCount.multiProduct || 0}
                                </div>
                                <div className="text-sm text-green-800">خطط متعددة</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600 mb-1">
                                    {targetsCount.category || 0}
                                </div>
                                <div className="text-sm text-purple-800">خطط أقسام</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600 mb-1">
                                    {targetsCount.supplier || 0}
                                </div>
                                <div className="text-sm text-orange-800">خطط موردين</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* أزرار التنقل */}
                <div className="flex gap-4">
                    <Link
                        href="/representatives/targets"
                        className="flex-1 bg-blue-600 text-white text-center py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        عرض الأهداف التفصيلية
                    </Link>
                    <Link
                        href="/representatives/dashboard"
                        className="flex-1 bg-gray-600 text-white text-center py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        العودة للداشبورد
                    </Link>
                </div>
            </div>
        </RepresentativeLayout>
    );
};

export default Salary;
