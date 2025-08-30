import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ProductReports from '@/Components/ProductReports';
import BarcodeManager from '@/Components/BarcodeManager';

export default function Index({ products, suppliers, categories, productCategories }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showReports, setShowReports] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProductCategory, setSelectedProductCategory] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [selectedSupplierInForm, setSelectedSupplierInForm] = useState('');

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
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
        pieces_per_carton: '',
        piece_weight_grams: '',
        expiry_date: '',
        image: null,
        is_active: true
    });

    // تصفية المنتجات
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSupplier = !selectedSupplier || product.supplier_id == selectedSupplier;
        const matchesCategory = !selectedCategory || product.supplier?.category?.id == selectedCategory;
        const matchesProductCategory = !selectedProductCategory || product.category?.id == selectedProductCategory;
        const matchesStatus = statusFilter === 'all' ||
                            (statusFilter === 'active' && product.is_active) ||
                            (statusFilter === 'inactive' && !product.is_active);

        const matchesStock = stockFilter === 'all' ||
                           (stockFilter === 'low' && product.stock_quantity <= product.min_stock_level) ||
                           (stockFilter === 'out' && product.stock_quantity <= 0) ||
                           (stockFilter === 'normal' && product.stock_quantity > product.min_stock_level);

        return matchesSearch && matchesSupplier && matchesCategory && matchesProductCategory && matchesStatus && matchesStock;
    });

    // فلترة فئات المنتجات بناءً على المورد المختار
    const getFilteredProductCategories = () => {
        if (!selectedSupplierInForm) {
            console.log('لم يتم اختيار مورد');
            return []; // إذا لم يتم اختيار مورد، لا تظهر أي فئات
        }

        const selectedSupplier = suppliers.find(supplier => supplier.id == selectedSupplierInForm);
        if (!selectedSupplier) {
            console.log('لم يتم العثور على المورد:', selectedSupplierInForm);
            return [];
        }

        // تجربة مسارات مختلفة للعثور على فئات المورد
        console.log('المورد المختار في النموذج:', selectedSupplier);
        console.log('فئات المورد - all_categories:', selectedSupplier.all_categories);
        console.log('فئات المورد - categories:', selectedSupplier.categories);
        console.log('فئات المورد - supplier_categories:', selectedSupplier.supplier_categories);

        // إرجاع فئات المورد - تجربة مسارات مختلفة
        const categories = selectedSupplier.all_categories ||
                          selectedSupplier.categories ||
                          selectedSupplier.supplier_categories ||
                          [];

        console.log('الفئات المرجعة:', categories);
        return categories;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingProduct) {
            put(route('admin.products.update', editingProduct.id), {
                onSuccess: () => {
                    setShowCreateForm(false);
                    setEditingProduct(null);
                    setSelectedSupplierInForm('');
                    reset();
                },
                onError: (errors) => {
                    console.log('أخطاء التحديث:', errors);
                }
            });
        } else {
            post(route('admin.products.store'), {
                onSuccess: () => {
                    setShowCreateForm(false);
                    setSelectedSupplierInForm('');
                    reset();
                },
                onError: (errors) => {
                    console.log('أخطاء الحفظ:', errors);
                }
            });
        }
    };

    const handleEdit = (product) => {
        setData({
            name_ar: product.name_ar,
            name_en: product.name_en || '',
            description: product.description || '',
            supplier_id: product.supplier_id,
            category_id: product.category_id || '',
            barcode: product.barcode || '',
            barcode_type: product.barcode_type || 'auto',
            cost_price: product.cost_price || '',
            purchase_price: product.purchase_price || '',
            selling_price: product.selling_price,
            wholesale_price: product.wholesale_price || '',
            stock_quantity: product.stock_quantity || product.current_stock || 0,
            min_stock_level: product.min_stock_level || 0,
            pieces_per_carton: product.pieces_per_carton || '',
            piece_weight_grams: product.piece_weight_grams || '',
            expiry_date: product.expiry_date || '',
            image: null,
            is_active: product.is_active
        });
        setEditingProduct(product);
        setSelectedSupplierInForm(product.supplier_id);
        setShowCreateForm(true);
    };

    const handleDelete = (product) => {
        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            destroy(route('admin.products.destroy', product.id));
        }
    };

    const toggleStatus = (product) => {
        put(route('admin.products.toggle-status', product.id), {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const generateBarcode = () => {
        if (data.barcode_type === 'auto') {
            setData('barcode', '');
        }
    };

    const getStockStatusColor = (product) => {
        const stock = product.stock_quantity || product.current_stock || 0;
        if (stock <= 0) return 'text-red-600 bg-red-50';
        if (stock <= product.min_stock_level) return 'text-yellow-600 bg-yellow-50';
        return 'text-green-600 bg-green-50';
    };

    const getStockStatusText = (product) => {
        const stock = product.stock_quantity || product.current_stock || 0;
        if (stock <= 0) return 'نفذ المخزون';
        if (stock <= product.min_stock_level) return 'مخزون منخفض';
        return 'متوفر';
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR'
        }).format(price);
    };

    return (
        <AdminLayout>
            <Head title="إدارة المنتجات" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h1>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowReports(!showReports)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        {showReports ? 'إخفاء التقارير' : 'عرض التقارير'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowCreateForm(true);
                                            setEditingProduct(null);
                                            reset();
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                    >
                                        إضافة منتج جديد
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="البحث (اسم، باركود...)"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <select
                                        value={selectedSupplier}
                                        onChange={(e) => setSelectedSupplier(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">جميع الموردين</option>
                                        {suppliers.map(supplier => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.name_ar}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <select
                                        value={selectedProductCategory}
                                        onChange={(e) => setSelectedProductCategory(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">جميع فئات المنتجات</option>
                                        {productCategories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name_ar}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="all">جميع الحالات</option>
                                        <option value="active">نشط</option>
                                        <option value="inactive">غير نشط</option>
                                    </select>
                                </div>

                                <div>
                                    <select
                                        value={stockFilter}
                                        onChange={(e) => setStockFilter(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="all">جميع المخزون</option>
                                        <option value="normal">متوفر</option>
                                        <option value="low">مخزون منخفض</option>
                                        <option value="out">نفذ المخزون</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        {/* Product Image */}
                                        <div className="h-48 bg-gray-100 relative">
                                            {product.image ? (
                                                <img
                                                    src={`/storage/${product.image}`}
                                                    alt={product.name_ar}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Status Badge */}
                                            <div className="absolute top-2 right-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    product.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {product.is_active ? 'نشط' : 'غير نشط'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                                                {product.name_ar}
                                            </h3>

                                            {product.name_en && (
                                                <p className="text-gray-500 text-sm mb-2 line-clamp-1">
                                                    {product.name_en}
                                                </p>
                                            )}

                                            {/* Barcode */}
                                            {product.barcode && (
                                                <div className="mb-2">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                                        {product.barcode}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Supplier & Category */}
                                            <div className="space-y-1 mb-2">
                                                <p className="text-gray-600 text-sm">
                                                    المورد: {product.supplier?.name_ar}
                                                </p>
                                                {product.category && (
                                                    <p className="text-gray-600 text-sm">
                                                        الفئة: {product.category.name_ar}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Stock Status */}
                                            <div className="mb-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(product)}`}>
                                                    {getStockStatusText(product)} ({product.stock_quantity || product.current_stock || 0})
                                                </span>
                                            </div>

                                            {/* Prices */}
                                            <div className="space-y-1 mb-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">سعر البيع:</span>
                                                    <span className="font-medium text-green-600">
                                                        {formatPrice(product.selling_price)}
                                                    </span>
                                                </div>

                                                {product.cost_price && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">التكلفة:</span>
                                                        <span className="font-medium">
                                                            {formatPrice(product.cost_price)}
                                                        </span>
                                                    </div>
                                                )}

                                                {product.profit_margin && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">الربح:</span>
                                                        <span className="font-medium text-blue-600">
                                                            {formatPrice(product.profit_margin)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Expiry Date */}
                                            {product.expiry_date && (
                                                <div className="mb-3">
                                                    <span className="text-xs text-gray-500">
                                                        انتهاء الصلاحية: {new Date(product.expiry_date).toLocaleDateString('ar-SA')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="px-4 pb-4 flex justify-between">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="تعديل"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="حذف"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => toggleStatus(product)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    product.is_active
                                                        ? 'text-red-600 hover:bg-red-50'
                                                        : 'text-green-600 hover:bg-green-50'
                                                }`}
                                                title={product.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
                                            >
                                                {product.is_active ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-gray-500 text-lg">لا توجد منتجات تطابق المعايير المحددة</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Form */}
            {showCreateForm && (
                <div className="bg-white rounded-lg shadow-lg mb-6 border border-gray-200">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setEditingProduct(null);
                                    setSelectedSupplierInForm('');
                                    reset();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                            <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Basic Info */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            اسم المنتج (عربي) *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name_ar}
                                            onChange={(e) => setData('name_ar', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.name_ar && <p className="text-red-500 text-xs mt-1">{errors.name_ar}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            اسم المنتج (إنجليزي)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name_en}
                                            onChange={(e) => setData('name_en', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            المورد *
                                        </label>
                                        <select
                                            value={data.supplier_id}
                                            onChange={(e) => {
                                                const supplierId = e.target.value;
                                                setData('supplier_id', supplierId);
                                                setSelectedSupplierInForm(supplierId);
                                                // إعادة تعيين فئة المنتج عند تغيير المورد
                                                setData('category_id', '');
                                            }}
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">اختر المورد</option>
                                            {suppliers.map(supplier => (
                                                <option key={supplier.id} value={supplier.id}>
                                                    {supplier.name_ar}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.supplier_id && <p className="text-red-500 text-xs mt-1">{errors.supplier_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            فئة المنتج *
                                        </label>
                                        <select
                                            value={data.category_id}
                                            onChange={(e) => setData('category_id', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            disabled={!selectedSupplierInForm}
                                            required
                                        >
                                            <option value="">
                                                {selectedSupplierInForm ? "اختر الفئة" : "اختر المورد أولاً"}
                                            </option>
                                            {/* فئات المورد المختار */}
                                            {getFilteredProductCategories().map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name_ar}
                                                </option>
                                            ))}
                                            {/* إذا لم توجد فئات للمورد، اعرض جميع الفئات كـ fallback */}
                                            {selectedSupplierInForm && getFilteredProductCategories().length === 0 &&
                                             productCategories.map(category => (
                                                <option key={`fallback_${category.id}`} value={category.id}>
                                                    {category.name_ar} (عام)
                                                </option>
                                            ))}
                                        </select>
                                        {selectedSupplierInForm && getFilteredProductCategories().length === 0 && productCategories.length > 0 && (
                                            <p className="mt-1 text-xs text-blue-600">
                                                تم عرض جميع الفئات (المورد ليس له فئات محددة)
                                            </p>
                                        )}
                                        {selectedSupplierInForm && getFilteredProductCategories().length === 0 && productCategories.length === 0 && (
                                            <p className="mt-1 text-xs text-amber-600">
                                                لا توجد فئات منتجات متاحة
                                            </p>
                                        )}
                                        {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
                                    </div>

                                    {/* Barcode Section */}
                                    <div className="col-span-2">
                                        <BarcodeManager
                                            value={data.barcode}
                                            onChange={(newBarcode) => setData('barcode', newBarcode)}
                                            showGenerator={true}
                                            showScanner={true}
                                            generateAutomatic={true}
                                            label="نظام الباركود المتقدم"
                                        />
                                        {errors.barcode && <p className="text-red-500 text-xs mt-1">{errors.barcode}</p>}
                                    </div>

                                    {/* Prices */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            سعر الشراء *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.purchase_price}
                                            onChange={(e) => setData('purchase_price', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.purchase_price && <p className="text-red-500 text-xs mt-1">{errors.purchase_price}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            سعر التكلفة
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.cost_price}
                                            onChange={(e) => setData('cost_price', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            سعر البيع *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.selling_price}
                                            onChange={(e) => setData('selling_price', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.selling_price && <p className="text-red-500 text-xs mt-1">{errors.selling_price}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            سعر الجملة
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.wholesale_price}
                                            onChange={(e) => setData('wholesale_price', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Stock */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            الكمية المتوفرة *
                                        </label>
                                        <input
                                            type="number"
                                            value={data.stock_quantity}
                                            onChange={(e) => setData('stock_quantity', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            الحد الأدنى للمخزون *
                                        </label>
                                        <input
                                            type="number"
                                            value={data.min_stock_level}
                                            onChange={(e) => setData('min_stock_level', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Pieces per Carton */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            عدد القطع في الكارتون
                                        </label>
                                        <input
                                            type="number"
                                            value={data.pieces_per_carton}
                                            onChange={(e) => setData('pieces_per_carton', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="عدد القطع في الكارتون"
                                        />
                                    </div>

                                    {/* Piece Weight */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            وزن القطعة (غرام)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.piece_weight_grams}
                                            onChange={(e) => setData('piece_weight_grams', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="وزن القطعة بالغرام"
                                        />
                                    </div>

                                    {/* Expiry Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            تاريخ انتهاء الصلاحية
                                        </label>
                                        <input
                                            type="date"
                                            value={data.expiry_date}
                                            onChange={(e) => setData('expiry_date', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            صورة المنتج
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('image', e.target.files[0])}
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        الوصف
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    ></textarea>
                                </div>

                                {/* Status */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_active" className="mr-2 block text-sm text-gray-900">
                                        منتج نشط
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setEditingProduct(null);
                                            setSelectedSupplierInForm('');
                                            reset();
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'جاري الحفظ...' : (editingProduct ? 'تحديث' : 'حفظ')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
            )}

            {/* Reports Section */}
            {showReports && (
                <div className="mt-8">
                    <ProductReports products={filteredProducts} />
                </div>
            )}
        </AdminLayout>
    );
}
