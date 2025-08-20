import React, { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import {
    Plus,
    Search,
    Filter,
    Edit3,
    Eye,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Users,
    TrendingUp,
    DollarSign,
    Star,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Target,
    BarChart3,
    UserCheck,
    Settings,
    AlertTriangle,
} from 'lucide-react';
import QuickAddForm from './Partials/QuickAddForm';
import DetailedForm from './Partials/DetailedForm';
import DeleteModal from '@/Components/DeleteModal';

export default function Index({ representatives, incentivePlans }) {
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [showDetailedForm, setShowDetailedForm] = useState(false);
    const [editingRep, setEditingRep] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingRep, setDeletingRep] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name_ar');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [showAllStats, setShowAllStats] = useState(false);

    // تصفية وترتيب البيانات مع pagination
    const filteredRepresentatives = useMemo(() => {
        let filtered = representatives.filter(rep => {
            const matchesSearch =
                rep.name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rep.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rep.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rep.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rep.phone?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && rep.is_active) ||
                (statusFilter === 'inactive' && !rep.is_active);

            return matchesSearch && matchesStatus;
        });

        const sorted = filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name_ar':
                    return (a.name_ar || '').localeCompare(b.name_ar || '');
                case 'total_sales':
                    return (b.total_sales || 0) - (a.total_sales || 0);
                case 'customers_count':
                    return (b.customers_count || 0) - (a.customers_count || 0);
                case 'hire_date':
                    return new Date(b.hire_date) - new Date(a.hire_date);
                case 'base_salary':
                    return (b.base_salary || 0) - (a.base_salary || 0);
                default:
                    return 0;
            }
        });

        // Pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return {
            all: sorted,
            paginated: sorted.slice(startIndex, endIndex),
            totalPages: Math.ceil(sorted.length / itemsPerPage),
            totalItems: sorted.length
        };
    }, [representatives, searchTerm, statusFilter, sortBy, currentPage, itemsPerPage]);

    // إحصائيات عامة
    const stats = useMemo(() => {
        const total = representatives.length;
        const active = representatives.filter(rep => rep.is_active).length;
        const totalSales = representatives.reduce((sum, rep) => sum + (rep.total_sales || 0), 0);
        const totalCustomers = representatives.reduce((sum, rep) => sum + (rep.customers_count || 0), 0);
        const avgSalesPerRep = total > 0 ? totalSales / total : 0;

        return {
            total,
            active,
            inactive: total - active,
            totalSales,
            totalCustomers,
            avgSalesPerRep,
        };
    }, [representatives]);

    const handleEdit = (rep) => {
        setEditingRep(rep);
        setShowDetailedForm(true);
    };

    const handleCompleteDetails = (rep) => {
        setEditingRep(rep);
        setShowDetailedForm(true);
    };

    const handleQuickAddSuccess = () => {
        // Inertia سيتولى تحديث البيانات تلقائياً عبر redirect
        setShowQuickAdd(false);
    };

    const handleDelete = (rep) => {
        setDeletingRep(rep);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (deletingRep) {
            router.delete(route('admin.sales-representatives.destroy', deletingRep.id), {
                onSuccess: () => {
                    toast.success('تم حذف المندوب بنجاح');
                    setShowDeleteModal(false);
                    setDeletingRep(null);
                },
                onError: (errors) => {
                    toast.error(errors.message || 'حدث خطأ أثناء الحذف');
                }
            });
        }
    };

    const toggleStatus = (rep) => {
        router.patch(route('admin.sales-representatives.toggle-status', rep.id), {}, {
            onSuccess: () => {
                const status = rep.is_active ? 'غير نشط' : 'نشط';
                toast.success(`تم تغيير حالة المندوب إلى ${status}`);
            },
            onError: (errors) => {
                toast.error(errors.message || 'حدث خطأ أثناء تغيير الحالة');
            }
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-US').format(number || 0);
    };

    const getIncentivePlanName = (planType) => {
        switch (planType) {
            case 'fixed_commission':
                return 'عمولة ثابتة';
            case 'tiered_commission':
                return 'عمولة متدرجة';
            case 'target_bonus':
                return 'مكافآت الأهداف';
            default:
                return planType;
        }
    };

    // فحص اكتمال البيانات
    const isDataComplete = (rep) => {
        return rep.base_salary > 0 &&
               rep.monthly_target > 0 &&
               rep.annual_target > 0 &&
               rep.national_id &&
               !rep.national_id.startsWith('temp_');
    };

    const getAchievementColor = (percentage) => {
        if (percentage >= 100) return 'text-green-600';
        if (percentage >= 80) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <AdminLayout>
            <Head title="إدارة المندوبين" />

            <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم مندوبي المبيعات</h1>
                        <p className="text-gray-600 mt-1">إدارة مندوبي المبيعات والحوافز</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingRep(null);
                            setShowQuickAdd(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة مندوب جديد
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-700">المندوبين</p>
                                <p className="text-3xl font-bold text-purple-900">{formatNumber(stats.total)}</p>
                                <p className="text-sm text-purple-600 mt-1">
                                    نشط: {formatNumber(stats.active)} | غير نشط: {formatNumber(stats.inactive)}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-full">
                                <Users className="w-8 h-8 text-purple-700" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">إجمالي المبيعات</p>
                                <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalSales)}</p>
                                <p className="text-sm text-blue-600 mt-1">
                                    المتوسط: {formatCurrency(stats.avgSalesPerRep)}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-full">
                                <TrendingUp className="w-8 h-8 text-blue-700" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700">العملاء</p>
                                <p className="text-3xl font-bold text-orange-900">{formatNumber(stats.totalCustomers)}</p>
                                <p className="text-sm text-orange-600 mt-1">
                                    المتوسط: {formatNumber(Math.round(stats.totalCustomers / (stats.total || 1)))} لكل مندوب
                                </p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-full">
                                <UserCheck className="w-8 h-8 text-orange-700" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">إجمالي الأرباح</p>
                                <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalSales * 0.05)}</p>
                                <p className="text-sm text-green-600 mt-1">العمولة المكتسبة</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-full">
                                <DollarSign className="w-8 h-8 text-green-700" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel - Representatives List */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">جميع المندوبين</h2>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    >
                                        <option value={5}>5 في الصفحة</option>
                                        <option value={10}>10 في الصفحة</option>
                                        <option value={15}>15 في الصفحة</option>
                                        <option value={20}>20 في الصفحة</option>
                                        <option value={25}>25 في الصفحة</option>
                                    </select>
                                </div>
                            </div>

                            {/* Search and Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="البحث في المندوبين..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="all">جميع الحالات</option>
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="name_ar">ترتيب حسب الاسم</option>
                                    <option value="total_sales">ترتيب حسب المبيعات</option>
                                    <option value="customers_count">ترتيب حسب العملاء</option>
                                    <option value="hire_date">ترتيب حسب تاريخ التوظيف</option>
                                    <option value="base_salary">ترتيب حسب الراتب</option>
                                </select>
                            </div>
                        </div>

                        {/* Representatives Table */}
                        <div className={`overflow-auto border border-gray-200 rounded-lg ${
                            itemsPerPage <= 5 ? 'max-h-96' :
                            itemsPerPage <= 10 ? 'max-h-[500px]' :
                            itemsPerPage <= 15 ? 'max-h-[600px]' :
                            'max-h-[700px]'
                        }`}>
                            <table className="min-w-full">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            المندوب
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            الكود
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            المبيعات
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            الأداء
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            السنة
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            الإجراءات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRepresentatives.paginated.map((rep) => (
                                        <tr key={rep.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                            {rep.name_ar?.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div className="mr-4">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {rep.name_ar}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {rep.phone}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {rep.code}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(rep.total_sales)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`text-sm font-semibold ${getAchievementColor(rep.annual_achievement || 0)}`}>
                                                        {(rep.annual_achievement || 0).toFixed(0)}%
                                                    </span>
                                                    <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${(rep.annual_achievement || 0) >= 80 ? 'bg-green-500' : (rep.annual_achievement || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                            style={{ width: `${Math.min(rep.annual_achievement || 0, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(rep.hire_date).getFullYear()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2 space-x-reverse">
                                                    <button
                                                        onClick={() => router.get(route('admin.sales-representatives.show', rep.id))}
                                                        className="text-purple-600 hover:text-purple-900 p-1 rounded transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(rep)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(rep)}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredRepresentatives.totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    عرض {((currentPage - 1) * itemsPerPage) + 1} إلى {Math.min(currentPage * itemsPerPage, filteredRepresentatives.totalItems)} من {filteredRepresentatives.totalItems} نتيجة
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        السابق
                                    </button>
                                    {Array.from({ length: filteredRepresentatives.totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                                                currentPage === page
                                                    ? 'bg-purple-600 text-white border-purple-600'
                                                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, filteredRepresentatives.totalPages))}
                                        disabled={currentPage === filteredRepresentatives.totalPages}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        التالي
                                    </button>
                                </div>
                            </div>
                        )}

                        {filteredRepresentatives.totalItems === 0 && (
                            <div className="text-center py-12">
                                <Users className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    لا يوجد مندوبين
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm || statusFilter !== 'all'
                                        ? 'لا توجد نتائج تطابق معايير البحث'
                                        : 'ابدأ بإضافة مندوب جديد'
                                    }
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Statistics and Activity */}
                    <div className="space-y-6">
                        {/* Top Performers */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">أفضل الأداء</h3>
                            <div className="space-y-4">
                                {representatives
                                    .filter(rep => rep.is_active)
                                    .sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0))
                                    .slice(0, 3)
                                    .map((rep, index) => (
                                        <div key={rep.id} className="flex items-center space-x-3 space-x-reverse">
                                            <div className="flex-shrink-0">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                                    index === 0 ? 'bg-yellow-500' :
                                                    index === 1 ? 'bg-gray-400' :
                                                    'bg-orange-600'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{rep.name_ar}</p>
                                                <p className="text-xs text-gray-500">{formatCurrency(rep.total_sales)}</p>
                                            </div>
                                            <div className="text-sm font-semibold text-green-600">
                                                {(rep.annual_achievement || 0).toFixed(0)}%
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات سريعة</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">متوسط الأداء</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {(representatives.reduce((sum, rep) => sum + (rep.annual_achievement || 0), 0) / representatives.length || 0).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">إجمالي العمولة</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(representatives.reduce((sum, rep) => sum + (rep.total_commission || 0), 0))}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">نشط هذا الشهر</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {representatives.filter(rep => rep.is_active).length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">النشاط الأخير</h3>
                                <button
                                    onClick={() => setShowAllStats(!showAllStats)}
                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    {showAllStats ? 'إظهار أقل' : 'عرض الكل'}
                                </button>
                            </div>
                            <div className="space-y-3">
                                {representatives
                                    .slice(0, showAllStats ? representatives.length : 3)
                                    .map((rep) => (
                                        <div key={rep.id} className="flex items-start space-x-3 space-x-reverse">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900">
                                                    <span className="font-medium">{rep.name_ar}</span> انضم للفريق
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDate(rep.hire_date)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Add Form Modal */}
            {showQuickAdd && (
                <QuickAddForm
                    isOpen={showQuickAdd}
                    onClose={() => setShowQuickAdd(false)}
                    onSuccess={handleQuickAddSuccess}
                />
            )}

            {/* Detailed Form Modal */}
            {showDetailedForm && (
                <DetailedForm
                    representative={editingRep}
                    incentivePlans={incentivePlans}
                    isOpen={showDetailedForm}
                    onClose={() => {
                        setShowDetailedForm(false);
                        setEditingRep(null);
                    }}
                />
            )}

            {/* Delete Modal */}
            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeletingRep(null);
                }}
                onConfirm={confirmDelete}
                title="حذف المندوب"
                message={`هل أنت متأكد من حذف المندوب "${deletingRep?.name_ar}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
            />
        </AdminLayout>
    );
}
