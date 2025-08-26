import React from 'react';
import { Head, Link } from '@inertiajs/react';
import RepresentativeLayout from '@/Layouts/RepresentativeLayout';
import {
    FaUsers,
    FaPlus,
    FaFileInvoiceDollar,
    FaMoneyBillWave,
    FaChartLine,
    FaCog,
    FaClipboardList,
    FaMapMarkerAlt,
    FaBullseye,
    FaWallet
} from 'react-icons/fa';

const Dashboard = ({ representative_user, customers = [], statistics = {} }) => {
    const quickActions = [
        {
            title: 'إدارة العملاء',
            description: 'عرض وإدارة قائمة العملاء',
            icon: <FaUsers />,
            href: '/representatives/customers',
            bgColor: 'bg-gradient-to-br from-blue-100 to-blue-200',
            iconColor: 'bg-blue-500'
        },
        {
            title: 'إضافة عميل جديد',
            description: 'إضافة عميل جديد للقائمة',
            icon: <FaPlus />,
            href: '/representatives/customers/create',
            bgColor: 'bg-gradient-to-br from-green-100 to-green-200',
            iconColor: 'bg-green-500'
        },
        {
            title: 'نقطة البيع',
            description: 'نظام نقطة البيع والفواتير',
            icon: <FaFileInvoiceDollar />,
            href: '/representatives/pos',
            bgColor: 'bg-gradient-to-br from-emerald-100 to-emerald-200',
            iconColor: 'bg-emerald-500'
        },
        {
            title: 'الطلبات',
            description: 'إدارة طلبات العملاء',
            icon: <FaClipboardList />,
            href: '/representatives/orders',
            bgColor: 'bg-gradient-to-br from-orange-100 to-orange-200',
            iconColor: 'bg-orange-500'
        },
        {
            title: 'الفواتير',
            description: 'عرض وإدارة الفواتير',
            icon: <FaFileInvoiceDollar />,
            href: '/representatives/invoices',
            bgColor: 'bg-gradient-to-br from-purple-100 to-purple-200',
            iconColor: 'bg-purple-500'
        },
        {
            title: 'المدفوعات',
            description: 'تسجيل ومتابعة المدفوعات',
            icon: <FaMoneyBillWave />,
            href: '/representatives/payments',
            bgColor: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
            iconColor: 'bg-yellow-500'
        },
        {
            title: 'الأهداف',
            description: 'متابعة الأهداف والخطط',
            icon: <FaBullseye />,
            href: '/representatives/targets',
            bgColor: 'bg-gradient-to-br from-red-100 to-red-200',
            iconColor: 'bg-red-500'
        },
        {
            title: 'الراتب والاستحقاقات',
            description: 'عرض الراتب والإنجاز المحقق',
            icon: <FaWallet />,
            href: '/representatives/salary',
            bgColor: 'bg-gradient-to-br from-teal-100 to-teal-200',
            iconColor: 'bg-teal-500'
        },
        {
            title: 'التقارير',
            description: 'عرض التقارير والإحصائيات',
            icon: <FaChartLine />,
            href: '/representatives/reports',
            bgColor: 'bg-gradient-to-br from-indigo-100 to-indigo-200',
            iconColor: 'bg-indigo-500'
        },
        {
            title: 'الإعدادات',
            description: 'إعدادات الحساب والتفضيلات',
            icon: <FaCog />,
            href: '/representatives/settings',
            bgColor: 'bg-gradient-to-br from-gray-100 to-gray-200',
            iconColor: 'bg-gray-500'
        }
    ];

    return (
        <RepresentativeLayout title="لوحة تحكم المندوب">
            <Head title="لوحة تحكم المندوب" />

            <div className="space-y-6">
                {/* كاردات الإجراءات السريعة */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">الإجراءات السريعة</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                href={action.href}
                                className="group relative bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-gray-300 aspect-square flex flex-col items-center justify-center text-center"
                            >
                                <div className={`${action.bgColor} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                                    <div className={`${action.iconColor} rounded-full w-12 h-12 flex items-center justify-center text-white text-xl`}>
                                        {action.icon}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-1 text-sm">{action.title}</h3>
                                    <p className="text-xs text-gray-600 leading-tight">{action.description}</p>
                                </div>

                                {/* مؤشر الهوفر */}
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </RepresentativeLayout>
    );
};

export default Dashboard;
