import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FaFileInvoiceDollar,
    FaUsers,
    FaBoxes,
    FaExclamationTriangle,
    FaMoneyBillWave,
    FaClock,
    FaChartLine,
    FaSync
} from 'react-icons/fa';

export default function AdminDashboard({
    statistics = {},
    recent_invoices = [],
    representatives_performance = [],
    low_stock_products = [],
    top_debtors = [],
    sales_chart = []
}) {
    const [liveStats, setLiveStats] = useState(statistics);
    const [recentActivity, setRecentActivity] = useState(recent_invoices);
    const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

    // تحديث الإحصائيات كل 30 ثانية
    useEffect(() => {
        const interval = setInterval(() => {
            fetch('/admin/live-stats')
                .then(response => response.json())
                .then(data => {
                    setLiveStats(prev => ({ ...prev, ...data }));
                    setLastUpdate(data.last_update);
                })
                .catch(console.error);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // تحديث الأنشطة الأخيرة كل دقيقة
    useEffect(() => {
        const interval = setInterval(() => {
            fetch('/admin/recent-activity')
                .then(response => response.json())
                .then(data => {
                    setRecentActivity(data);
                })
                .catch(console.error);
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0).replace('IQD', 'د.ع');
    };

    const formatNumber = (number) => {
        return new Intl.NumberFormat('ar-IQ').format(number || 0);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            preparing: 'bg-blue-100 text-blue-800',
            shipping: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            returned: 'bg-orange-100 text-orange-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
        const statusTexts = {
            pending: 'قيد الانتظار',
            preparing: 'قيد التجهيز',
            shipping: 'قيد التوصيل',
            delivered: 'تم التسليم',
            returned: 'مسترجع',
            cancelled: 'ملغية',
        };
        return statusTexts[status] || status;
    };

    const statsCards = [
        {
            title: 'مبيعات اليوم',
            value: formatCurrency(liveStats.total_sales_today),
            icon: <FaMoneyBillWave />,
            color: 'bg-gradient-to-r from-green-400 to-green-600',
            change: '+12%',
            changeColor: 'text-green-600'
        },
        {
            title: 'فواتير اليوم',
            value: formatNumber(liveStats.total_invoices_today),
            icon: <FaFileInvoiceDollar />,
            color: 'bg-gradient-to-r from-blue-400 to-blue-600',
            change: '+8%',
            changeColor: 'text-blue-600'
        },
        {
            title: 'فواتير معلقة',
            value: formatNumber(liveStats.total_invoices_pending),
            icon: <FaClock />,
            color: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
            change: '-3%',
            changeColor: 'text-red-600'
        },
        {
            title: 'إجمالي الديون',
            value: formatCurrency(liveStats.total_debt_amount),
            icon: <FaExclamationTriangle />,
            color: 'bg-gradient-to-r from-red-400 to-red-600',
            change: '+5%',
            changeColor: 'text-red-600'
        },
        {
            title: 'منتجات منخفضة',
            value: formatNumber(liveStats.low_stock_count),
            icon: <FaBoxes />,
            color: 'bg-gradient-to-r from-orange-400 to-orange-600',
            change: '+2',
            changeColor: 'text-orange-600'
        }
    ];

    return (
        <AdminLayout>
            <Head title="لوحة التحكم - الإدارة" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم الإدارة</h1>
                            <p className="text-gray-600 mt-1">نظرة شاملة على النشاط التجاري</p>
                        </div>
                        <div className="flex items-center space-x-4 space-x-reverse">
                            <div className="text-sm text-gray-500">
                                آخر تحديث: {lastUpdate}
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <FaSync className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {statsCards.map((card, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                                    </div>
                                    <div className={`${card.color} p-3 rounded-lg text-white`}>
                                        {card.icon}
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center">
                                    <span className={`text-sm font-medium ${card.changeColor}`}>
                                        {card.change}
                                    </span>
                                    <span className="text-sm text-gray-500 mr-2">من الأمس</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* آخر الفواتير */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">آخر الفواتير</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentActivity.slice(0, 5).map((invoice, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                فاتورة #{invoice.invoice_number} - {formatCurrency(invoice.total_amount)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {invoice.representative?.name} - {invoice.customer?.customer_name}
                                            </p>
                                        </div>
                                        <div className="text-left">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                                {getStatusText(invoice.status)}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">{invoice.created_at}</p>
                                        </div>
                                    </div>
                                ))}
                                {recentActivity.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">لا توجد فواتير حديثة</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* أداء المندوبين */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">أداء المندوبين اليوم</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {representatives_performance.slice(0, 5).map((rep, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{rep.name}</p>
                                            <p className="text-xs text-gray-500">{rep.phone}</p>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatCurrency(rep.total_sales)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {rep.invoices_count} فاتورة
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {representatives_performance.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">لا يوجد نشاط اليوم</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* منتجات منخفضة المخزن */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">منتجات منخفضة المخزن</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {low_stock_products.map((product, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.supplier_type?.name}</p>
                                        </div>
                                        <div className="text-left">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                product.cartons_count === 0 ? 'bg-red-100 text-red-800' :
                                                product.cartons_count < 5 ? 'bg-orange-100 text-orange-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {product.cartons_count} كرتون
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {low_stock_products.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">جميع المنتجات متوفرة</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* أعلى المدينين */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">أعلى المدينين</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {top_debtors.map((customer, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{customer.customer_name}</p>
                                            <p className="text-xs text-gray-500">{customer.representative?.name}</p>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-red-600">
                                                {formatCurrency(customer.total_debt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {top_debtors.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">لا توجد ديون</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
