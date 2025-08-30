import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PreparerLayout from '../../../Layouts/PreparerLayout';
import {
    FaEdit,
    FaClock,
    FaUser,
    FaPhone,
    FaDollarSign,
    FaEye,
    FaCheckCircle,
    FaSearch,
    FaFilter,
    FaSpinner,
    FaExclamationTriangle
} from 'react-icons/fa';

export default function PreparingInvoices({ invoices, preparer, stats, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [processing, setProcessing] = useState(false);
    const [selectedInvoices, setSelectedInvoices] = useState([]);

    // بيانات تجريبية للفواتير قيد التجهيز
    const sampleInvoices = invoices || {
        data: [
            {
                id: 1,
                sale_number: 'INV-2025-001',
                customer_name: 'أحمد محمد علي',
                customer_phone: '07701234567',
                total_amount: 250000,
                created_at: '2025-08-29T10:30:00',
                sellerRepresentative: {
                    name: 'محمد الأحمد',
                    phone: '07809876543'
                },
                primarySupplier: {
                    name_ar: 'مورد المواد الغذائية'
                },
                items_count: 8,
                priority: 'عالية',
                estimated_time: '30 دقيقة'
            },
            {
                id: 2,
                sale_number: 'INV-2025-002',
                customer_name: 'فاطمة حسن',
                customer_phone: '07712345678',
                total_amount: 180000,
                created_at: '2025-08-29T09:15:00',
                seller_representative: {
                    name: 'علي الخالد',
                    phone: '07798765432'
                },
                primary_supplier: {
                    name_ar: 'مورد الأدوات المنزلية'
                },
                items_count: 5,
                priority: 'متوسطة',
                estimated_time: '20 دقيقة'
            },
            {
                id: 3,
                sale_number: 'INV-2025-003',
                customer_name: 'سعد الكريم',
                customer_phone: '07723456789',
                total_amount: 420000,
                created_at: '2025-08-29T08:45:00',
                seller_representative: {
                    name: 'نور الهدى',
                    phone: '07787654321'
                },
                primary_supplier: {
                    name_ar: 'مورد الإلكترونيات'
                },
                items_count: 12,
                priority: 'عالية',
                estimated_time: '45 دقيقة'
            }
        ],
        total: 3,
        per_page: 10,
        current_page: 1
    };

    // تحديث حالة الفاتورة إلى "جاهز للتسليم"
    const markAsReady = async (invoiceId) => {
        if (confirm('هل أنت متأكد من إكمال تجهيز هذه الفاتورة؟')) {
            setProcessing(true);
            try {
                await router.patch(`/preparer/invoices/${invoiceId}/complete`, {
                    status: 'ready_for_delivery',
                    prepared_by: preparer?.id,
                    preparation_notes: 'تم تجهيز الفاتورة بنجاح'
                });
            } catch (error) {
                console.error('Error updating invoice:', error);
                alert('حدث خطأ أثناء تحديث حالة الفاتورة');
            } finally {
                setProcessing(false);
            }
        }
    };

    // تطبيق البحث
    const handleSearch = () => {
        router.get('/preparer/invoices/preparing', {
            search: searchTerm
        });
    };

    // الحصول على لون الأولوية
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'عالية': return 'bg-red-100 text-red-800 border-red-200';
            case 'متوسطة': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'منخفضة': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // احصائيات سريعة
    const quickStats = stats || {
        total_preparing: sampleInvoices.total,
        high_priority: 2,
        average_time: '35 دقيقة',
        completed_today: 12
    };

    return (
        <PreparerLayout title="الفواتير الجديدة - قيد التجهيز">
            <Head title="الفواتير قيد التجهيز" />

            <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                        <div>
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">الفواتير قيد التجهيز</h1>
                            <p className="opacity-90 text-sm sm:text-base">إدارة وتجهيز الفواتير الجديدة</p>
                        </div>
                        <div className="text-center sm:text-right">
                            <div className="text-2xl sm:text-3xl font-bold">{quickStats.total_preparing}</div>
                            <p className="text-xs sm:text-sm opacity-90">فاتورة في الانتظار</p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mb-2 sm:mb-0 sm:mr-3">
                                <FaEdit className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </div>
                            <div className="text-center sm:text-right">
                                <p className="text-xs sm:text-sm text-gray-600">إجمالي قيد التجهيز</p>
                                <p className="text-lg sm:text-xl font-bold text-gray-900">{quickStats.total_preparing}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row items-center">
                            <div className="p-2 bg-red-100 rounded-lg mb-2 sm:mb-0 sm:mr-3">
                                <FaExclamationTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                            </div>
                            <div className="text-center sm:text-right">
                                <p className="text-xs sm:text-sm text-gray-600">أولوية عالية</p>
                                <p className="text-lg sm:text-xl font-bold text-gray-900">{quickStats.high_priority}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg mb-2 sm:mb-0 sm:mr-3">
                                <FaClock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                            </div>
                            <div className="text-center sm:text-right">
                                <p className="text-xs sm:text-sm text-gray-600">متوسط الوقت</p>
                                <p className="text-lg sm:text-xl font-bold text-gray-900">{quickStats.average_time}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row items-center">
                            <div className="p-2 bg-green-100 rounded-lg mb-2 sm:mb-0 sm:mr-3">
                                <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            </div>
                            <div className="text-center sm:text-right">
                                <p className="text-xs sm:text-sm text-gray-600">مكتمل اليوم</p>
                                <p className="text-lg sm:text-xl font-bold text-gray-900">{quickStats.completed_today}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="البحث برقم الفاتورة، اسم العميل، أو المندوب..."
                                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                />
                                <FaSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            بحث
                        </button>
                        <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            <FaFilter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Invoices List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">الفواتير المطلوب تجهيزها</h2>
                        <p className="text-sm text-gray-500">قائمة الفواتير في حالة "قيد التجهيز"</p>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {sampleInvoices.data.map((invoice) => (
                            <div key={invoice.id} className="flex items-center justify-between px-3 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FaEdit className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <span className="text-base font-bold text-gray-900">{invoice.sale_number}</span>
                                        <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-200">
                                            {invoice.status || 'قيد التجهيز'}
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    href={`/preparer/invoices/${invoice.id}`}
                                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                                >
                                    <FaEye className="w-4 h-4 ml-1" />
                                    عرض التفاصيل
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {sampleInvoices.data.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaEdit className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فواتير قيد التجهيز</h3>
                            <p className="text-gray-500">جميع الفواتير تم تجهيزها أو لا توجد فواتير جديدة</p>
                        </div>
                    )}
                </div>
            </div>
        </PreparerLayout>
    );
}
