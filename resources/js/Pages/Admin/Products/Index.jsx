import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Plus, Search, Filter, Eye, Edit3, Trash2, Package,
    TrendingUp, AlertTriangle, CheckCircle, XCircle,
    BarChart3, Users, DollarSign, Package2, Calendar,
    ShoppingCart, Star, Zap
} from 'lucide-react';

export default function Index({ products, suppliers, categories, productCategories }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const { data, setData, post, processing, errors, reset } = useForm({
        name_ar: '',
        name_en: '',
        description: '',
        supplier_id: '',
        category_id: '',
        barcode: '',
        barcode_type: 'auto',
        cost_price: '',
        purchase_price: '',
        selling_price: '',
        wholesale_price: '',
        stock_quantity: '',
        min_stock_level: '',
        expiry_date: '',
        image: null,
        is_active: true
    });

    // إحصائيات المنتجات
    const stats = {
        total: products.length,
        active: products.filter(p => p.is_active).length,
        inactive: products.filter(p => !p.is_active).length,
        lowStock: products.filter(p => (p.stock_quantity || 0) <= (p.min_stock_level || 0)).length,
        outOfStock: products.filter(p => (p.stock_quantity || 0) === 0).length,
        totalValue: products.reduce((sum, p) => sum + ((p.selling_price || 0) * (p.stock_quantity || 0)), 0),
        expiringSoon: products.filter(p => {
            if (!p.expiry_date) return false;
            const daysUntilExpiry = Math.ceil((new Date(p.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
        }).length
    };

    // تصفية المنتجات
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSupplier = !selectedSupplier || product.supplier_id == selectedSupplier;
        const matchesCategory = !selectedCategory || product.category_id == selectedCategory;
        const matchesStatus = statusFilter === 'all' ||
                            (statusFilter === 'active' && product.is_active) ||
                            (statusFilter === 'inactive' && !product.is_active);

        const currentStock = product.stock_quantity || 0;
        const minStock = product.min_stock_level || 0;
        const matchesStock = stockFilter === 'all' ||
                           (stockFilter === 'in_stock' && currentStock > minStock) ||
                           (stockFilter === 'low_stock' && currentStock <= minStock && currentStock > 0) ||
                           (stockFilter === 'out_of_stock' && currentStock === 0);

        return matchesSearch && matchesSupplier && matchesCategory && matchesStatus && matchesStock;
    });

    // تطبيق الصفحات
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // دوال التنسيق
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0).replace('IQD', '').trim() + ' IQD';
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US').format(num || 0);
    };

    const getStockStatusColor = (product) => {
        const currentStock = product.stock_quantity || 0;
        const minStock = product.min_stock_level || 0;

        if (currentStock === 0) return 'text-red-600 bg-red-100';
        if (currentStock <= minStock) return 'text-orange-600 bg-orange-100';
        return 'text-green-600 bg-green-100';
    };

    const getStockStatusText = (product) => {
        const currentStock = product.stock_quantity || 0;
        const minStock = product.min_stock_level || 0;

        if (currentStock === 0) return 'نفدت الكمية';
        if (currentStock <= minStock) return 'كمية قليلة';
        return 'متوفر';
    };

    // دوال المعالجة
    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();

        // إضافة جميع البيانات إلى FormData
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
                if (key === 'image' && data[key] instanceof File) {
                    formData.append(key, data[key]);
                } else if (key === 'is_active') {
                    formData.append(key, data[key] ? '1' : '0');
                } else {
                    formData.append(key, data[key]);
                }
            }
        });

        if (editingProduct) {
            formData.append('_method', 'PUT');
            router.post(route('admin.products.update', editingProduct.id), formData, {
                forceFormData: true,
                onSuccess: () => {
                    setShowCreateForm(false);
                    setEditingProduct(null);
                    reset();
                },
                onError: (errors) => {
                    console.error('خطأ في التحديث:', errors);
                }
            });
        } else {
            router.post(route('admin.products.store'), formData, {
                forceFormData: true,
                onSuccess: () => {
                    setShowCreateForm(false);
                    reset();
                },
                onError: (errors) => {
                    console.error('خطأ في الإضافة:', errors);
                }
            });
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setData({
            name_ar: product.name_ar || '',
            name_en: product.name_en || '',
            description: product.description || '',
            supplier_id: product.supplier_id || '',
            category_id: product.category_id || '',
            barcode: product.barcode || '',
            barcode_type: product.barcode_type || 'auto',
            cost_price: product.cost_price || '',
            purchase_price: product.purchase_price || '',
            selling_price: product.selling_price || '',
            wholesale_price: product.wholesale_price || '',
            stock_quantity: product.stock_quantity || '',
            min_stock_level: product.min_stock_level || '',
            expiry_date: product.expiry_date || '',
            image: null,
            is_active: product.is_active
        });
        setShowCreateForm(true);
    };

    const handleDelete = (product) => {
        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            router.delete(route('admin.products.destroy', product.id));
        }
    };

    const toggleStatus = (product) => {
        router.post(route('admin.products.toggle-status', product.id));
    };

    const resetForm = () => {
        setEditingProduct(null);
        setShowCreateForm(false);
        reset();
    };

    return (
        <AdminLayout>
            <Head title="إدارة المنتجات" />

            <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم المنتجات</h1>
                        <p className="text-gray-600 mt-1">إدارة المنتجات والمخزون</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.get(route('admin.products.table'))}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <BarChart3 className="w-5 h-5" />
                            عرض الجدول
                        </button>
                        <button
                            onClick={() => {
                                setEditingProduct(null);
                                setShowCreateForm(true);
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            إضافة منتج جديد
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">إجمالي المنتجات</p>
                                <p className="text-3xl font-bold text-blue-900">{formatNumber(stats.total)}</p>
                                <p className="text-sm text-blue-600 mt-1">
                                    نشط: {formatNumber(stats.active)} | غير نشط: {formatNumber(stats.inactive)}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-full">
                                <Package className="w-8 h-8 text-blue-700" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">قيمة المخزون</p>
                                <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalValue)}</p>
                                <p className="text-sm text-green-600 mt-1">القيمة الإجمالية</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-full">
                                <DollarSign className="w-8 h-8 text-green-700" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700">تنبيهات المخزون</p>
                                <p className="text-3xl font-bold text-orange-900">{formatNumber(stats.lowStock + stats.outOfStock)}</p>
                                <p className="text-sm text-orange-600 mt-1">
                                    قليل: {formatNumber(stats.lowStock)} | نفد: {formatNumber(stats.outOfStock)}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-full">
                                <AlertTriangle className="w-8 h-8 text-orange-700" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-700">منتهية الصلاحية</p>
                                <p className="text-3xl font-bold text-red-900">{formatNumber(stats.expiringSoon)}</p>
                                <p className="text-sm text-red-600 mt-1">خلال 30 يوم</p>
                            </div>
                            <div className="p-3 bg-red-200 rounded-full">
                                <Calendar className="w-8 h-8 text-red-700" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel - Products List */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">جميع المنتجات</h2>
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
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="البحث في المنتجات..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <select
                                    value={selectedSupplier}
                                    onChange={(e) => setSelectedSupplier(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">جميع الموردين</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name_ar}
                                        </option>
                                    ))}
                                </select>

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
                                    value={stockFilter}
                                    onChange={(e) => setStockFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="all">جميع المخزون</option>
                                    <option value="in_stock">متوفر</option>
                                    <option value="low_stock">كمية قليلة</option>
                                    <option value="out_of_stock">نفدت الكمية</option>
                                </select>
                            </div>
                        </div>

                        {/* Products Table */}
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
                                            المنتج
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            السعر
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            المخزون
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            الحالة
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            الإجراءات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        {product.image ? (
                                                            <img
                                                                className="h-12 w-12 rounded-lg object-cover"
                                                                src={`/storage/${product.image}`}
                                                                alt={product.name_ar}
                                                            />
                                                        ) : (
                                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                                                                <Package className="w-6 h-6 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mr-4">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {product.name_ar}
                                                        </div>
                                                        {product.name_en && (
                                                            <div className="text-sm text-gray-500">
                                                                {product.name_en}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-gray-400">
                                                            {product.barcode || 'لا يوجد باركود'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-gray-900">
                                                        {formatCurrency(product.selling_price)}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        تكلفة: {formatCurrency(product.cost_price)}
                                                    </div>
                                                    {product.wholesale_price && (
                                                        <div className="text-gray-500">
                                                            جملة: {formatCurrency(product.wholesale_price)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-gray-900">
                                                        {formatNumber(product.stock_quantity)} وحدة
                                                    </div>
                                                    <div className="text-gray-500">
                                                        الحد الأدنى: {formatNumber(product.min_stock_level)}
                                                    </div>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(product)}`}>
                                                        {getStockStatusText(product)}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-2">
                                                    {product.is_active ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            نشط
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            غير نشط
                                                        </span>
                                                    )}
                                                    {product.supplier && (
                                                        <div className="text-xs text-gray-500">
                                                            {product.supplier.name_ar}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2 space-x-reverse">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                                                        title="تعديل"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleStatus(product)}
                                                        className={`p-1 rounded transition-colors ${
                                                            product.is_active
                                                                ? 'text-green-600 hover:text-green-900'
                                                                : 'text-gray-400 hover:text-gray-600'
                                                        }`}
                                                        title={product.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
                                                    >
                                                        {product.is_active ? (
                                                            <CheckCircle className="w-4 h-4" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product)}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                                                        title="حذف"
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
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    عرض {((currentPage - 1) * itemsPerPage) + 1} إلى {Math.min(currentPage * itemsPerPage, filteredProducts.length)} من {filteredProducts.length} نتيجة
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        السابق
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        التالي
                                    </button>
                                </div>
                            </div>
                        )}

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-12">
                                <Package className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    لا يوجد منتجات
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm || selectedSupplier || statusFilter !== 'all'
                                        ? 'لا توجد نتائج تطابق معايير البحث'
                                        : 'ابدأ بإضافة منتج جديد'
                                    }
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Quick Info */}
                    <div className="space-y-6">
                        {/* Top Products */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">المنتجات الأكثر قيمة</h3>
                            <div className="space-y-4">
                                {products
                                    .filter(p => p.is_active)
                                    .sort((a, b) => ((b.selling_price || 0) * (b.stock_quantity || 0)) - ((a.selling_price || 0) * (a.stock_quantity || 0)))
                                    .slice(0, 3)
                                    .map((product, index) => (
                                        <div key={product.id} className="flex items-center space-x-3 space-x-reverse">
                                            <div className="flex-shrink-0">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                                    index === 0 ? 'bg-yellow-500' :
                                                    index === 1 ? 'bg-gray-400' :
                                                    'bg-orange-600'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{product.name_ar}</p>
                                                <p className="text-xs text-gray-500">{formatCurrency((product.selling_price || 0) * (product.stock_quantity || 0))}</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Stock Alerts */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">تنبيهات المخزون</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">نفدت الكمية</span>
                                    <span className="text-sm font-semibold text-red-600">
                                        {stats.outOfStock}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">كمية قليلة</span>
                                    <span className="text-sm font-semibold text-orange-600">
                                        {stats.lowStock}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">تنتهي قريباً</span>
                                    <span className="text-sm font-semibold text-yellow-600">
                                        {stats.expiringSoon}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setStockFilter('low_stock')}
                                    className="w-full text-right px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                                >
                                    عرض المنتجات قليلة المخزون
                                </button>
                                <button
                                    onClick={() => setStockFilter('out_of_stock')}
                                    className="w-full text-right px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    عرض المنتجات المنتهية
                                </button>
                                <button
                                    onClick={() => setStatusFilter('inactive')}
                                    className="w-full text-right px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    عرض المنتجات غير النشطة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Product Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                                </h3>
                                <button
                                    onClick={resetForm}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* اسم المنتج بالعربية */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        اسم المنتج (عربي) *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name_ar}
                                        onChange={(e) => setData('name_ar', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                    {errors.name_ar && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name_ar}</p>
                                    )}
                                </div>

                                {/* اسم المنتج بالإنجليزية */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        اسم المنتج (إنجليزي)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name_en}
                                        onChange={(e) => setData('name_en', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                {/* المورد */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        المورد *
                                    </label>
                                    <select
                                        value={data.supplier_id}
                                        onChange={(e) => setData('supplier_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">اختر المورد</option>
                                        {suppliers.map(supplier => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.name_ar}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.supplier_id && (
                                        <p className="text-red-500 text-sm mt-1">{errors.supplier_id}</p>
                                    )}
                                </div>

                                {/* الفئة */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الفئة
                                    </label>
                                    <select
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="">اختر الفئة</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name_ar}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* سعر التكلفة */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        سعر التكلفة
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.cost_price}
                                        onChange={(e) => setData('cost_price', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                {/* سعر الشراء */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        سعر الشراء *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.purchase_price}
                                        onChange={(e) => setData('purchase_price', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                    {errors.purchase_price && (
                                        <p className="text-red-500 text-sm mt-1">{errors.purchase_price}</p>
                                    )}
                                </div>

                                {/* سعر البيع */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        سعر البيع *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.selling_price}
                                        onChange={(e) => setData('selling_price', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                    {errors.selling_price && (
                                        <p className="text-red-500 text-sm mt-1">{errors.selling_price}</p>
                                    )}
                                </div>

                                {/* سعر الجملة */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        سعر الجملة
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.wholesale_price}
                                        onChange={(e) => setData('wholesale_price', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                {/* كمية المخزون */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        كمية المخزون *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={data.stock_quantity}
                                        onChange={(e) => setData('stock_quantity', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                    {errors.stock_quantity && (
                                        <p className="text-red-500 text-sm mt-1">{errors.stock_quantity}</p>
                                    )}
                                </div>

                                {/* الحد الأدنى للمخزون */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الحد الأدنى للمخزون *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={data.min_stock_level}
                                        onChange={(e) => setData('min_stock_level', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                    {errors.min_stock_level && (
                                        <p className="text-red-500 text-sm mt-1">{errors.min_stock_level}</p>
                                    )}
                                </div>

                                {/* تاريخ انتهاء الصلاحية */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        تاريخ انتهاء الصلاحية
                                    </label>
                                    <input
                                        type="date"
                                        value={data.expiry_date}
                                        onChange={(e) => setData('expiry_date', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* الوصف */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الوصف
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            {/* رفع الصورة */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    صورة المنتج
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('image', e.target.files[0])}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                {errors.image && (
                                    <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                                )}
                            </div>

                            {/* حالة المنتج */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_active" className="mr-2 block text-sm text-gray-900">
                                    منتج نشط
                                </label>
                            </div>

                            {/* أزرار الحفظ */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'جاري الحفظ...' : (editingProduct ? 'تحديث' : 'حفظ')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
