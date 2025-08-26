import React from 'react';
import { Head, Link } from '@inertiajs/react';
import RepresentativeLayout from '@/Layouts/RepresentativeLayout';
import {
    FaBullseye,
    FaChartLine,
    FaCalendar,
    FaTrophy,
    FaFire,
    FaStar
} from 'react-icons/fa';

const Targets = ({ representative_user, currentTargets = [], multiProductPlans = [], categoryPlans = [], supplierPlans = [] }) => {
    // حساب الإحصائيات من البيانات الحقيقية
    const calculateStats = () => {
        const totalTargets = (currentTargets?.length || 0) +
                           (multiProductPlans?.length || 0) +
                           (categoryPlans?.length || 0) +
                           (supplierPlans?.length || 0);

        const completedTargets = (currentTargets?.filter(t => t.is_achieved)?.length || 0) +
                               (multiProductPlans?.filter(p => p.status === 'completed')?.length || 0) +
                               (categoryPlans?.filter(p => p.status === 'completed')?.length || 0) +
                               (supplierPlans?.filter(p => p.status === 'completed')?.length || 0);

        const activeTargets = totalTargets - completedTargets;

        const overallAchievement = totalTargets > 0 ? Math.round((completedTargets / totalTargets) * 100) : 0;

        return { totalTargets, completedTargets, activeTargets, overallAchievement };
    };

    const stats = calculateStats();

    // إحصائيات الأهداف من البيانات الحقيقية
    const targetStats = [
        {
            title: 'إجمالي الأهداف',
            value: stats.totalTargets.toString(),
            icon: <FaBullseye />,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'الأهداف المكتملة',
            value: stats.completedTargets.toString(),
            icon: <FaTrophy />,
            color: 'bg-green-500',
            bgColor: 'bg-green-50'
        },
        {
            title: 'الأهداف النشطة',
            value: stats.activeTargets.toString(),
            icon: <FaFire />,
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50'
        },
        {
            title: 'معدل الإنجاز',
            value: `${stats.overallAchievement}%`,
            icon: <FaChartLine />,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50'
        }
    ];

    // تحضير جميع الأهداف والخطط للعرض
    const allTargetsForDisplay = [
        // الأهداف الفردية من SalaryPlanTargets
        ...(currentTargets?.map(target => ({
            id: target.id,
            title: `هدف المنتج: ${target.product?.name_ar || target.product?.name_en || 'منتج غير محدد'}`,
            description: `بيع ${target.target_quantity} وحدة`,
            progress: target.achievement_percentage || 0,
            deadline: target.target_date,
            status: target.is_achieved ? 'مكتمل' : 'جاري',
            statusColor: target.is_achieved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
            type: 'individual'
        })) || []),

        // الخطط متعددة المنتجات
        ...(multiProductPlans?.map(plan => ({
            id: `multi-${plan.id}`,
            title: plan.plan_name || 'خطة متعددة المنتجات',
            description: `هدف: ${plan.total_target_quantity} وحدة من ${plan.products?.length || 0} منتج`,
            progress: plan.completion_percentage || 0,
            deadline: plan.end_date,
            status: plan.status === 'completed' ? 'مكتمل' : plan.status === 'expired' ? 'منتهي' : 'جاري',
            statusColor: plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                        plan.status === 'expired' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800',
            type: 'multi'
        })) || []),

        // خطط الأقسام
        ...(categoryPlans?.map(plan => ({
            id: `category-${plan.id}`,
            title: `خطة القسم: ${plan.supplier_category?.name || 'قسم غير محدد'}`,
            description: `بيع ${plan.target_quantity} وحدة`,
            progress: plan.achievement_percentage || 0,
            deadline: plan.end_date,
            status: plan.status === 'completed' ? 'مكتمل' : plan.status === 'expired' ? 'منتهي' : 'جاري',
            statusColor: plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                        plan.status === 'expired' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800',
            type: 'category'
        })) || []),

        // خطط الموردين
        ...(supplierPlans?.map(plan => ({
            id: `supplier-${plan.id}`,
            title: `خطة المورد: ${plan.supplier?.name || 'مورد غير محدد'}`,
            description: `بيع ${plan.target_quantity} وحدة`,
            progress: plan.achievement_percentage || 0,
            deadline: plan.end_date,
            status: plan.status === 'completed' ? 'مكتمل' : plan.status === 'expired' ? 'منتهي' : 'جاري',
            statusColor: plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                        plan.status === 'expired' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800',
            type: 'supplier'
        })) || [])
    ];

    const currentTargetsDisplay = allTargetsForDisplay;

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <RepresentativeLayout title="الأهداف والخطط">
            <Head title="الأهداف والخطط" />

            <div className="space-y-6">
                {/* إحصائيات الأهداف */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {targetStats.map((stat, index) => (
                        <div key={index} className={`${stat.bgColor} rounded-xl p-4 border border-gray-200`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center text-white`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* الأهداف الحالية */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <FaBullseye className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">الأهداف الحالية</h2>
                            </div>
                            <Link
                                href="/representatives/dashboard"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                العودة للداشبورد
                            </Link>
                        </div>
                    </div>

                    <div className="p-6">
                        {currentTargetsDisplay.length > 0 ? (
                            <div className="space-y-4">
                                {currentTargetsDisplay.map((target) => (
                                    <div key={target.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">{target.title}</h3>
                                                <p className="text-sm text-gray-600 mb-2">{target.description}</p>
                                                <div className="flex items-center space-x-4 space-x-reverse">
                                                    <div className="flex items-center space-x-2 space-x-reverse">
                                                        <FaCalendar className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-500">{target.deadline}</span>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${target.statusColor}`}>
                                                        {target.status}
                                                    </span>
                                                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                                        {target.type === 'individual' && 'هدف فردي'}
                                                        {target.type === 'multi' && 'خطة متعددة'}
                                                        {target.type === 'category' && 'خطة قسم'}
                                                        {target.type === 'supplier' && 'خطة مورد'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right ml-4">
                                                <span className="text-2xl font-bold text-gray-900">{Math.round(target.progress)}%</span>
                                            </div>
                                        </div>

                                        {/* شريط التقدم */}
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(target.progress)}`}
                                                style={{ width: `${target.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FaBullseye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-500">لا توجد أهداف حالياً</p>
                                <p className="text-sm text-gray-400 mt-2">يمكن للإدارة إضافة أهداف لك من لوحة التحكم</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* إحصائيات شهرية */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <FaChartLine className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">الأداء الشهري</h2>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FaStar className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">أهداف مكتملة</h3>
                                <p className="text-3xl font-bold text-blue-600">{stats.completedTargets}</p>
                                <p className="text-sm text-gray-500">من أصل {stats.totalTargets}</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FaTrophy className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">معدل النجاح</h3>
                                <p className="text-3xl font-bold text-green-600">{stats.overallAchievement}%</p>
                                <p className="text-sm text-gray-500">الإنجاز العام</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FaFire className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">أهداف نشطة</h3>
                                <p className="text-3xl font-bold text-orange-600">{stats.activeTargets}</p>
                                <p className="text-sm text-gray-500">جاري العمل عليها</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </RepresentativeLayout>
    );
};

export default Targets;
