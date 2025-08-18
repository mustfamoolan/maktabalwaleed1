import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Warehouse({ products = [], suppliers = [], supplierTypes = [] }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [filteredSuppliers, setFilteredSuppliers] = useState(suppliers);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        supplier_type_id: '',
        supplier_id: '',
        purchase_price: '',
        selling_price: '',
        cartons_count: '',
        units_per_carton: '',
        weight: '',
        barcode: '',
        purchase_date: new Date().toISOString().split('T')[0],
        image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== '') {
                formData.append(key, data[key]);
            }
        });

        if (selectedProduct) {
            formData.append('_method', 'PUT');
            router.post(`/admin/warehouse/${selectedProduct.id}`, formData, {
                onSuccess: () => {
                    setShowAddForm(false);
                    setSelectedProduct(null);
                    reset();
                },
                onError: (errors) => {
                    console.log('خطأ في التحديث:', errors);
                }
            });
        } else {
            router.post('/admin/warehouse', formData, {
                onSuccess: () => {
                    setShowAddForm(false);
                    reset();
                },
                onError: (errors) => {
                    console.log('خطأ في الإضافة:', errors);
                }
            });
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setData({
            name: product.name,
            supplier_type_id: product.supplier_type_id,
            supplier_id: product.supplier_id,
            purchase_price: product.purchase_price,
            selling_price: product.selling_price,
            cartons_count: product.cartons_count,
            units_per_carton: product.units_per_carton,
            weight: product.weight || '',
            barcode: product.barcode,
            purchase_date: product.purchase_date,
            image: null,
        });

        // فلترة الموردين بناء على النوع المحدد
        if (product.supplier_type_id) {
            const filtered = suppliers.filter(supplier =>
                supplier.supplier_types?.some(type => type.id === product.supplier_type_id)
            );
            setFilteredSuppliers(filtered);
        }

        setShowAddForm(true);
    };

    const handleSupplierTypeChange = (typeId) => {
        setData('supplier_type_id', typeId);
        setData('supplier_id', ''); // إعادة تعيين المورد

        // فلترة الموردين بناء على النوع المحدد
        const filtered = suppliers.filter(supplier =>
            supplier.supplier_types?.some(type => type.id == typeId)
        );
        setFilteredSuppliers(filtered);
    };

    const generateBarcode = () => {
        const randomBarcode = Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        setData('barcode', randomBarcode);
    };

    // بيانات وهمية للاختبار
    const mockProducts = [
        {
            id: 1,
            name: 'منظف فيري الأزرق',
            supplier_type: { name: 'المنظفات' },
            supplier: { company_name: 'شركة الأمل للتوريدات' },
            purchase_price: 15.50,
            selling_price: 18.00,
            cartons_count: 50,
            units_per_carton: 12,
            weight: 2.5,
            barcode: '1234567890123',
            purchase_date: '2025-08-15',
            is_active: true
        },
        {
            id: 2,
            name: 'حفاظات بامبرز كبير',
            supplier_type: { name: 'الحفاظات' },
            supplier: { company_name: 'مؤسسة النور التجارية' },
            purchase_price: 25.00,
            selling_price: 30.00,
            cartons_count: 20,
            units_per_carton: 4,
            weight: 8.0,
            barcode: '1234567890124',
            purchase_date: '2025-08-10',
            is_active: true
        },
    ];

    const mockSupplierTypes = [
        { id: 1, name: 'المنظفات' },
        { id: 2, name: 'المواد الغذائية' },
        { id: 3, name: 'الحفاظات' },
    ];

    const mockSuppliers = [
        {
            id: 1,
            company_name: 'شركة الأمل للتوريدات',
            supplier_types: [{ id: 1, name: 'المنظفات' }, { id: 2, name: 'المواد الغذائية' }]
        },
        {
            id: 2,
            company_name: 'مؤسسة النور التجارية',
            supplier_types: [{ id: 3, name: 'الحفاظات' }]
        },
    ];

    const displayProducts = products.length > 0 ? products : mockProducts;
    const displaySupplierTypes = supplierTypes.length > 0 ? supplierTypes : mockSupplierTypes;
    const displaySuppliers = suppliers.length > 0 ? suppliers : mockSuppliers;

    return (
        <AdminLayout>
            <Head title="إدارة المخزن - المقر الرئيسي" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l7 7m-7 0l7-7" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">إدارة المخزن</h1>
                                    <p className="text-sm text-gray-600">إدارة المنتجات والمخزون</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddForm(true);
                                    setSelectedProduct(null);
                                    setFilteredSuppliers(displaySuppliers);
                                    reset();
                                }}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 border border-transparent rounded-lg font-medium text-white hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                            >
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                إضافة منتج جديد
                            </button>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">إجمالي المنتجات</p>
                                        <p className="text-lg font-bold text-gray-900">{displayProducts.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">إجمالي الكراتين</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {displayProducts.reduce((sum, product) => sum + (product.cartons_count || 0), 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">إجمالي العلب</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {displayProducts.reduce((sum, product) => sum + ((product.cartons_count || 0) * (product.units_per_carton || 0)), 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.863-.833-2.633 0L4.18 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">مخزون منخفض</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {displayProducts.filter(product => (product.cartons_count || 0) <= 5).length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add/Edit Form */}
                {showAddForm && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                {selectedProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* اسم المنتج */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        اسم المنتج *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="اسم المنتج"
                                        required
                                    />
                                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                                </div>

                                {/* نوع المنتج */}
                                <div>
                                    <label htmlFor="supplier_type_id" className="block text-sm font-medium text-gray-700 mb-2">
                                        نوع المنتج *
                                    </label>
                                    <select
                                        id="supplier_type_id"
                                        value={data.supplier_type_id}
                                        onChange={(e) => handleSupplierTypeChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">اختر نوع المنتج</option>
                                        {displaySupplierTypes.map((type) => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                    {errors.supplier_type_id && <p className="text-red-600 text-sm mt-1">{errors.supplier_type_id}</p>}
                                </div>

                                {/* المورد */}
                                <div>
                                    <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700 mb-2">
                                        المورد *
                                    </label>
                                    <select
                                        id="supplier_id"
                                        value={data.supplier_id}
                                        onChange={(e) => setData('supplier_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        disabled={!data.supplier_type_id}
                                    >
                                        <option value="">اختر المورد</option>
                                        {filteredSuppliers.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>{supplier.company_name}</option>
                                        ))}
                                    </select>
                                    {errors.supplier_id && <p className="text-red-600 text-sm mt-1">{errors.supplier_id}</p>}
                                </div>

                                {/* سعر الشراء */}
                                <div>
                                    <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700 mb-2">
                                        سعر الشراء (دينار) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        id="purchase_price"
                                        value={data.purchase_price}
                                        onChange={(e) => setData('purchase_price', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.purchase_price && <p className="text-red-600 text-sm mt-1">{errors.purchase_price}</p>}
                                </div>

                                {/* سعر البيع */}
                                <div>
                                    <label htmlFor="selling_price" className="block text-sm font-medium text-gray-700 mb-2">
                                        سعر البيع (دينار) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        id="selling_price"
                                        value={data.selling_price}
                                        onChange={(e) => setData('selling_price', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.selling_price && <p className="text-red-600 text-sm mt-1">{errors.selling_price}</p>}
                                </div>

                                {/* عدد الكراتين */}
                                <div>
                                    <label htmlFor="cartons_count" className="block text-sm font-medium text-gray-700 mb-2">
                                        عدد الكراتين *
                                    </label>
                                    <input
                                        type="number"
                                        id="cartons_count"
                                        value={data.cartons_count}
                                        onChange={(e) => setData('cartons_count', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0"
                                        required
                                    />
                                    {errors.cartons_count && <p className="text-red-600 text-sm mt-1">{errors.cartons_count}</p>}
                                </div>

                                {/* عدد العلب في الكارتون */}
                                <div>
                                    <label htmlFor="units_per_carton" className="block text-sm font-medium text-gray-700 mb-2">
                                        عدد العلب في الكارتون *
                                    </label>
                                    <input
                                        type="number"
                                        id="units_per_carton"
                                        value={data.units_per_carton}
                                        onChange={(e) => setData('units_per_carton', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0"
                                        required
                                    />
                                    {errors.units_per_carton && <p className="text-red-600 text-sm mt-1">{errors.units_per_carton}</p>}
                                </div>

                                {/* الوزن */}
                                <div>
                                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                                        الوزن (كيلو)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        id="weight"
                                        value={data.weight}
                                        onChange={(e) => setData('weight', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                    />
                                    {errors.weight && <p className="text-red-600 text-sm mt-1">{errors.weight}</p>}
                                </div>

                                {/* الباركود */}
                                <div>
                                    <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-2">
                                        الباركود *
                                    </label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            id="barcode"
                                            value={data.barcode}
                                            onChange={(e) => setData('barcode', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="123456789012"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={generateBarcode}
                                            className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-l-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            توليد
                                        </button>
                                    </div>
                                    {errors.barcode && <p className="text-red-600 text-sm mt-1">{errors.barcode}</p>}
                                </div>

                                {/* تاريخ الشراء */}
                                <div>
                                    <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 mb-2">
                                        تاريخ الشراء *
                                    </label>
                                    <input
                                        type="date"
                                        id="purchase_date"
                                        value={data.purchase_date}
                                        onChange={(e) => setData('purchase_date', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.purchase_date && <p className="text-red-600 text-sm mt-1">{errors.purchase_date}</p>}
                                </div>

                                {/* صورة المنتج */}
                                <div>
                                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                                        صورة المنتج
                                    </label>
                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={(e) => setData('image', e.target.files[0])}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setSelectedProduct(null);
                                        reset();
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {processing ? 'جاري الحفظ...' : (selectedProduct ? 'تحديث' : 'حفظ')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Products Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">#</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">اسم المنتج</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">النوع</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">المورد</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">سعر الشراء</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">سعر البيع</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">الكراتين</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">العلب</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">الباركود</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">الصورة</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {displayProducts.map((product, index) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-200">{index + 1}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-l border-gray-200">{product.name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-200">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {product.supplier_type?.name || product.supplier_type.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-200">{product.supplier?.company_name || product.supplier.company_name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-200">{product.purchase_price} د.ع</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-200">{product.selling_price} د.ع</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-200">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                product.cartons_count <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                {product.cartons_count}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-200">{product.cartons_count * product.units_per_carton}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-200 font-mono">{product.barcode}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-200">
                                            <div className="flex justify-center">
                                                {product.image ? (
                                                    <img
                                                        src={`/storage/${product.image}`}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow duration-200"
                                                        onClick={() => {
                                                            setSelectedImage({
                                                                src: `/storage/${product.image}`,
                                                                alt: product.name
                                                            });
                                                            setShowImageModal(true);
                                                        }}
                                                        onError={(e) => {
                                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMxOS41ODE3IDMyIDE2IDI4LjQxODMgMTYgMjRDMTYgMTkuNTgxNyAxOS41ODE3IDE2IDI0IDE2QzI4LjQxODMgMTYgMzIgMTkuNTgxNyAzMiAyNEMzMiAyOC40MTgzIDI4LjQxODMgMzIgMjQgMzJaIiBmaWxsPSIjOUM5OTlCIi8+CjwvcGF0aD4KPC9zdmc+';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2 space-x-reverse">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    تعديل
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    حذف
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {showImageModal && selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
                    <div className="max-w-3xl max-h-[90vh] bg-white rounded-lg p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">{selectedImage.alt}</h3>
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <img
                            src={selectedImage.src}
                            alt={selectedImage.alt}
                            className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg"
                        />
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
