import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BarcodeManager from '@/Components/BarcodeManager';

export default function IndexTable({ products, suppliers, categories, productCategories }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProductCategory, setSelectedProductCategory] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [editingRows, setEditingRows] = useState({});
    const [newRowsCount, setNewRowsCount] = useState(0);
    const [savingRows, setSavingRows] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);
    const [selectedSupplierInModal, setSelectedSupplierInModal] = useState('');
    const [modalData, setModalData] = useState({
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
        stock_quantity: '0',
        min_stock_level: '1',
        expiry_date: '',
        image: null,
        is_active: true
    });
    const [modalSaving, setModalSaving] = useState(false);

    // إنشاء بيانات فارغة لصف جديد
    const createEmptyRow = (tempId) => ({
        id: tempId,
        name_ar: '',
        name_en: '',
        description: '',
        supplier_id: '',
        category_id: '',
        barcode: '',
        barcode_type: 'auto',
        cost_price: '0',
        purchase_price: '',
        selling_price: '',
        wholesale_price: '',
        stock_quantity: '0',
        min_stock_level: '1',
        expiry_date: '',
        image: null,
        is_active: true,
        isNew: true
    });

    // إضافة صف جديد - فتح النافذة المنسدلة فقط
    const addNewRow = () => {
        setIsEditMode(false);
        setEditingProductId(null);
        setCurrentImage(null);
        setSelectedSupplierInModal('');
        // تصفير بيانات النموذج للإضافة الجديدة
        setModalData({
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
            stock_quantity: '0',
            min_stock_level: '1',
            expiry_date: '',
            image: null,
            is_active: true
        });
        setShowAddModal(true);
    };

    // فتح النافذة للتعديل
    const openEditModal = (product) => {
        setIsEditMode(true);
        setEditingProductId(product.id);
        setSelectedSupplierInModal(product.supplier_id);
        setCurrentImage(product.image); // حفظ مسار الصورة الحالية
        setModalData({
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
            stock_quantity: product.stock_quantity || '0',
            min_stock_level: product.min_stock_level || '1',
            expiry_date: product.expiry_date || '',
            image: null, // الصورة الجديدة إن وُجدت
            is_active: product.is_active
        });
        setShowAddModal(true);
    };

    // حفظ المنتج (إضافة أو تعديل)
    const saveProduct = async () => {
        if (!modalData.name_ar || !modalData.supplier_id || !modalData.purchase_price || !modalData.selling_price) {
            alert('يرجى ملء الحقول المطلوبة (اسم المنتج، المورد، سعر الشراء، سعر البيع)');
            return;
        }

        setModalSaving(true);

        try {
            if (isEditMode && editingProductId) {
                // تعديل منتج موجود
                router.put(route('admin.products.update', editingProductId), modalData, {
                    onSuccess: () => {
                        closeModal();
                    },
                    onError: (errors) => {
                        console.error('أخطاء التعديل:', errors);
                        alert('حدث خطأ أثناء تعديل المنتج: ' + Object.values(errors).join(', '));
                    },
                    onFinish: () => {
                        setModalSaving(false);
                    }
                });
            } else {
                // إضافة منتج جديد
                router.post(route('admin.products.store'), modalData, {
                    onSuccess: () => {
                        closeModal();
                    },
                    onError: (errors) => {
                        console.error('أخطاء الحفظ:', errors);
                        alert('حدث خطأ أثناء حفظ المنتج: ' + Object.values(errors).join(', '));
                    },
                    onFinish: () => {
                        setModalSaving(false);
                    }
                });
            }
        } catch (error) {
            console.error('خطأ في الحفظ:', error);
            alert('حدث خطأ أثناء حفظ المنتج');
            setModalSaving(false);
        }
    };

    // إغلاق النافذة المنسدلة وإعادة تعيين البيانات
    const closeModal = () => {
        setShowAddModal(false);
        setIsEditMode(false);
        setEditingProductId(null);
        setCurrentImage(null);
        setSelectedSupplierInModal('');
        setModalData({
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
            stock_quantity: '0',
            min_stock_level: '1',
            expiry_date: '',
            image: null,
            is_active: true
        });
    };

    // فلترة فئات المنتجات بناءً على المورد المختار
    const getFilteredProductCategories = () => {
        if (!selectedSupplierInModal) {
            console.log('لم يتم اختيار مورد في النافذة المنسدلة');
            return []; // إذا لم يتم اختيار مورد، لا تظهر أي فئات
        }

        const selectedSupplier = suppliers.find(supplier => supplier.id == selectedSupplierInModal);
        if (!selectedSupplier) {
            console.log('لم يتم العثور على المورد في النافذة المنسدلة:', selectedSupplierInModal);
            return [];
        }

        // تجربة مسارات مختلفة للعثور على فئات المورد
        console.log('المورد المختار في النافذة المنسدلة:', selectedSupplier);
        console.log('فئات المورد - all_categories:', selectedSupplier.all_categories);
        console.log('فئات المورد - categories:', selectedSupplier.categories);
        console.log('فئات المورد - supplier_categories:', selectedSupplier.supplier_categories);

        // إرجاع فئات المورد - تجربة مسارات مختلفة
        const categories = selectedSupplier.all_categories ||
                          selectedSupplier.categories ||
                          selectedSupplier.supplier_categories ||
                          [];

        console.log('الفئات المرجعة في النافذة المنسدلة:', categories);
        return categories;
    };

    // تحديث قيمة في الصف مع منع القطع في الإدخال
    const updateRowField = (rowId, field, value) => {
        setEditingRows(prev => {
            const currentRow = prev[rowId] || {};
            return {
                ...prev,
                [rowId]: {
                    ...currentRow,
                    [field]: value
                }
            };
        });
    };

    // معالجة رفع الصورة
    const handleImageUpload = (rowId, file) => {
        if (file) {
            // التحقق من نوع الملف
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                alert('نوع الملف غير مدعوم. يرجى اختيار صورة من نوع: JPEG, PNG, GIF, أو WebP');
                return;
            }

            // التحقق من حجم الملف (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('حجم الملف كبير جداً. الحد الأقصى هو 5 ميجابايت');
                return;
            }

            console.log('معلومات الملف:', {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: new Date(file.lastModified)
            });

            updateRowField(rowId, 'image', file);

            // إنشاء معاينة للصورة
            const reader = new FileReader();
            reader.onload = (e) => {
                updateRowField(rowId, 'imagePreview', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // حفظ صف
    const saveRow = async (rowId) => {
        const rowData = editingRows[rowId];

        // إضافة مؤشر التحميل
        setSavingRows(prev => ({ ...prev, [rowId]: true }));

        // إنشاء FormData لرفع الصور
        const formData = new FormData();

        // إضافة البيانات للـ FormData
        Object.keys(rowData).forEach(key => {
            if (key !== 'isNew' && key !== 'imagePreview' && rowData[key] !== null && rowData[key] !== undefined) {
                if (key === 'image') {
                    // إرسال الصورة فقط إذا كانت ملف جديد
                    if (rowData[key] instanceof File) {
                        // تحقق إضافي من خصائص الملف
                        console.log('تفاصيل الملف قبل الإرسال:', {
                            name: rowData[key].name,
                            size: rowData[key].size,
                            type: rowData[key].type,
                            lastModified: rowData[key].lastModified
                        });

                        // إنشاء ملف جديد مع تأكيد النوع
                        const file = new File([rowData[key]], rowData[key].name, {
                            type: rowData[key].type,
                            lastModified: rowData[key].lastModified
                        });

                        formData.append(key, file);
                        console.log('إرسال صورة جديدة:', file.name);
                    } else {
                        console.log('تجاهل الصورة القديمة:', rowData[key]);
                    }
                    // تجاهل الصورة القديمة (string path) لأنها موجودة أصلاً
                } else if (key === 'is_active') {
                    // تحويل القيم البوليانية إلى strings صحيحة
                    formData.append(key, rowData[key] ? '1' : '0');
                } else {
                    formData.append(key, rowData[key]);
                }
            }
        });

        // Debug: طباعة محتويات FormData
        console.log('محتويات FormData:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}:`, {
                    name: value.name,
                    size: value.size,
                    type: value.type
                });
            } else {
                console.log(`${key}:`, value);
            }
        }

        try {
            if (rowData.isNew) {
                // إضافة _method للتعامل مع FormData في Laravel
                formData.append('_method', 'POST');

                // إنشاء منتج جديد
                router.post(route('admin.products.store'), formData, {
                    forceFormData: true,
                    onSuccess: () => {
                        setEditingRows(prev => {
                            const newRows = { ...prev };
                            delete newRows[rowId];
                            return newRows;
                        });
                        setSavingRows(prev => {
                            const newSaving = { ...prev };
                            delete newSaving[rowId];
                            return newSaving;
                        });
                    },
                    onError: (errors) => {
                        console.error('خطأ في الحفظ:', errors);
                        alert('حدث خطأ أثناء الحفظ. يرجى التحقق من البيانات.');
                        setSavingRows(prev => {
                            const newSaving = { ...prev };
                            delete newSaving[rowId];
                            return newSaving;
                        });
                    }
                });
            } else {
                // إضافة _method للتعامل مع FormData في Laravel
                formData.append('_method', 'PUT');

                // تحديث منتج موجود
                router.post(route('admin.products.update', rowData.id), formData, {
                    forceFormData: true,
                    onSuccess: () => {
                        setEditingRows(prev => {
                            const newRows = { ...prev };
                            delete newRows[rowId];
                            return newRows;
                        });
                        setSavingRows(prev => {
                            const newSaving = { ...prev };
                            delete newSaving[rowId];
                            return newSaving;
                        });
                    },
                    onError: (errors) => {
                        console.error('خطأ في التحديث:', errors);
                        alert('حدث خطأ أثناء التحديث. يرجى التحقق من البيانات.');
                        setSavingRows(prev => {
                            const newSaving = { ...prev };
                            delete newSaving[rowId];
                            return newSaving;
                        });
                    }
                });
            }
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
            alert('حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.');
            setSavingRows(prev => {
                const newSaving = { ...prev };
                delete newSaving[rowId];
                return newSaving;
            });
        }
    };    // إلغاء التعديل
    const cancelEdit = (rowId) => {
        setEditingRows(prev => {
            const newRows = { ...prev };
            delete newRows[rowId];
            return newRows;
        });
    };

    // بدء تعديل صف موجود - استخدام النافذة المنسدلة
    const startEdit = (product) => {
        openEditModal(product);
    };

    // حذف منتج
    const deleteProduct = (product) => {
        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            router.delete(route('admin.products.destroy', product.id));
        }
    };

    // فلترة المنتجات
    const filteredProducts = products.filter(product => {
        const matchesSearch = !searchTerm ||
            product.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode?.includes(searchTerm);

        const matchesSupplier = !selectedSupplier || product.supplier_id == selectedSupplier;
        const matchesCategory = !selectedCategory || product.supplier?.category?.id == selectedCategory;
        const matchesProductCategory = !selectedProductCategory || product.category?.id == selectedProductCategory;

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && product.is_active) ||
            (statusFilter === 'inactive' && !product.is_active);

        const matchesStock = stockFilter === 'all' ||
            (stockFilter === 'in_stock' && (product.stock_quantity || 0) > 0) ||
            (stockFilter === 'low_stock' && (product.stock_quantity || 0) <= (product.min_stock_level || 0) && (product.stock_quantity || 0) > 0) ||
            (stockFilter === 'out_of_stock' && (product.stock_quantity || 0) === 0);

        return matchesSearch && matchesSupplier && matchesCategory && matchesProductCategory && matchesStatus && matchesStock;
    });

    // عرض المنتجات المفلترة فقط (إزالة نظام الإضافة المباشرة)
    const allRows = filteredProducts;

    // تنسيق السعر بالدينار العراقي
    const formatPrice = (price) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price || 0);
    };

    // مكون خلية قابلة للتعديل
    const EditableCell = ({ rowId, field, value, type = 'text', options = [] }) => {
        const isEditing = editingRows[rowId];

        if (!isEditing) {
            if (type === 'image') {
                return (
                    <div className="flex items-center justify-center w-12 h-12">
                        {value ? (
                            <img
                                src={`/storage/${value}`}
                                alt="صورة المنتج"
                                className="w-full h-full object-cover rounded border"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 rounded border flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                        )}
                    </div>
                );
            }
            if (type === 'select' && options.length > 0) {
                const option = options.find(opt => opt.id == value);
                return <span className="text-xs truncate block max-w-full" title={option?.name_ar || '-'}>{option?.name_ar || '-'}</span>;
            }
            if (type === 'price') {
                return <span className="text-xs font-medium text-green-600 truncate block" title={formatPrice(value)}>{formatPrice(value)}</span>;
            }
            if (type === 'boolean') {
                return (
                    <span className={`inline-flex px-1 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${
                        value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {value ? 'نشط' : 'غير نشط'}
                    </span>
                );
            }
            return <span className="text-xs truncate block max-w-full" title={value || '-'}>{value || '-'}</span>;
        }

        if (type === 'image') {
            return (
                <div className="w-full">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                handleImageUpload(rowId, file);
                            }
                        }}
                        className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                    {isEditing.imagePreview && (
                        <div className="mt-1 w-12 h-12">
                            <img
                                src={isEditing.imagePreview}
                                alt="معاينة"
                                className="w-full h-full object-cover rounded border"
                            />
                        </div>
                    )}
                </div>
            );
        }

        if (type === 'select') {
            return (
                <select
                    value={isEditing[field] || ''}
                    onChange={(e) => updateRowField(rowId, field, e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const nextInput = e.target.closest('tr').querySelector(`input:not([readonly]), select:not([readonly])`);
                            if (nextInput && nextInput !== e.target) {
                                nextInput.focus();
                            }
                        }
                        if (e.key === 'Escape') {
                            cancelEdit(rowId);
                        }
                    }}
                    className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">اختر...</option>
                    {options.map(option => (
                        <option key={option.id} value={option.id}>
                            {option.name_ar}
                        </option>
                    ))}
                </select>
            );
        }

        if (type === 'boolean') {
            return (
                <select
                    value={isEditing[field] ? 'true' : 'false'}
                    onChange={(e) => updateRowField(rowId, field, e.target.value === 'true')}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const nextInput = e.target.closest('tr').querySelector(`input:not([readonly]), select:not([readonly])`);
                            if (nextInput && nextInput !== e.target) {
                                nextInput.focus();
                            }
                        }
                        if (e.key === 'Escape') {
                            cancelEdit(rowId);
                        }
                    }}
                    className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="true">نشط</option>
                    <option value="false">غير نشط</option>
                </select>
            );
        }

        if (type === 'barcode') {
            return (
                <div className="w-full">
                    <BarcodeManager
                        value={isEditing[field] || ''}
                        onChange={(newBarcode) => updateRowField(rowId, field, newBarcode)}
                        showGenerator={true}
                        showScanner={true}
                        generateAutomatic={true}
                        className="border-0 p-0"
                        label=""
                    />
                </div>
            );
        }

        return (
            <input
                type={type === 'price' || type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
                step={type === 'price' ? '0.01' : undefined}
                value={isEditing[field] || ''}
                onChange={(e) => updateRowField(rowId, field, e.target.value)}
                onFocus={(e) => {
                    // تحديد النص عند التركيز لمنع القطع
                    setTimeout(() => e.target.select(), 0);
                }}
                onKeyDown={(e) => {
                    // حفظ عند الضغط على Enter
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        // الانتقال للحقل التالي أو الحفظ
                        const nextInput = e.target.closest('tr').querySelector(`input:not([readonly]), select:not([readonly])`);
                        if (nextInput && nextInput !== e.target) {
                            nextInput.focus();
                        }
                    }
                    // إلغاء عند الضغط على Escape
                    if (e.key === 'Escape') {
                        cancelEdit(rowId);
                    }
                }}
                className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder={type === 'date' ? 'YYYY-MM-DD' : ''}
                autoComplete="off"
            />
        );
    };

    return (
        <AdminLayout>
            {/* Add Product Modal - Global for both Desktop and Mobile */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-blue-50">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                    {isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setSelectedSupplierInModal('');
                                    }}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {/* الصورة والمعلومات الأساسية */}
                                <div className="space-y-4">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b pb-2">المعلومات الأساسية</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">اسم المنتج (عربي) *</label>
                                        <input
                                            type="text"
                                            value={modalData.name_ar}
                                            onChange={(e) => setModalData(prev => ({...prev, name_ar: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="أدخل اسم المنتج بالعربية"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">اسم المنتج (إنجليزي)</label>
                                        <input
                                            type="text"
                                            value={modalData.name_en}
                                            onChange={(e) => setModalData(prev => ({...prev, name_en: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Product Name (English)"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                                        <textarea
                                            rows="3"
                                            value={modalData.description}
                                            onChange={(e) => setModalData(prev => ({...prev, description: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="وصف المنتج (اختياري)"
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">صورة المنتج</label>

                                        {/* عرض الصورة الحالية في وضع التعديل */}
                                        {isEditMode && currentImage && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 mb-2">الصورة الحالية:</p>
                                                <div className="relative inline-block">
                                                    <img
                                                        src={`/storage/${currentImage}`}
                                                        alt="الصورة الحالية"
                                                        className="w-24 h-24 object-cover rounded-lg border"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                        <span className="text-white text-xs">الصورة الحالية</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-blue-400 transition-colors">
                                            <svg className="mx-auto h-8 sm:h-12 w-8 sm:w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="mt-2">
                                                <label className="cursor-pointer">
                                                    <span className="mt-2 block text-xs sm:text-sm font-medium text-gray-900">
                                                        {isEditMode ? 'اضغط لتغيير الصورة' : 'اضغط لرفع صورة أو اسحب الصورة هنا'}
                                                    </span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => setModalData(prev => ({...prev, image: e.target.files[0]}))}
                                                    />
                                                </label>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">
                                                {isEditMode ? 'اترك فارغاً للاحتفاظ بالصورة الحالية • ' : ''}
                                                PNG, JPG, GIF حتى 5MB
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* التفاصيل والأسعار */}
                                <div className="space-y-4">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b pb-2">التفاصيل والأسعار</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">المورد *</label>
                                            <select
                                                value={selectedSupplierInModal}
                                                onChange={(e) => {
                                                    const supplierId = e.target.value;
                                                    setSelectedSupplierInModal(supplierId);
                                                    setModalData(prev => ({...prev, supplier_id: supplierId, category_id: ''}));
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            >
                                                <option value="">اختر المورد</option>
                                                {suppliers.map(supplier => (
                                                    <option key={supplier.id} value={supplier.id}>
                                                        {supplier.name_ar}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">فئة المنتج</label>
                                            <select
                                                value={modalData.category_id}
                                                onChange={(e) => setModalData(prev => ({...prev, category_id: e.target.value}))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                disabled={!selectedSupplierInModal}
                                            >
                                                <option value="">
                                                    {selectedSupplierInModal ? "اختر الفئة" : "اختر المورد أولاً"}
                                                </option>
                                                {/* فئات المورد المختار */}
                                                {getFilteredProductCategories().map(category => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name_ar}
                                                    </option>
                                                ))}
                                                {/* إذا لم توجد فئات للمورد، اعرض جميع الفئات كـ fallback */}
                                                {selectedSupplierInModal && getFilteredProductCategories().length === 0 &&
                                                 productCategories.map(category => (
                                                    <option key={`fallback_${category.id}`} value={category.id}>
                                                        {category.name_ar} (عام)
                                                    </option>
                                                ))}
                                            </select>
                                            {selectedSupplierInModal && getFilteredProductCategories().length === 0 && productCategories.length > 0 && (
                                                <p className="mt-1 text-xs text-blue-600">
                                                    تم عرض جميع الفئات (المورد ليس له فئات محددة)
                                                </p>
                                            )}
                                            {selectedSupplierInModal && getFilteredProductCategories().length === 0 && productCategories.length === 0 && (
                                                <p className="mt-1 text-xs text-amber-600">
                                                    لا توجد فئات منتجات متاحة
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* نظام الباركود المتقدم */}
                                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                        <BarcodeManager
                                            value={modalData.barcode}
                                            onChange={(barcode) => setModalData(prev => ({...prev, barcode}))}
                                            showGenerator={true}
                                            showScanner={true}
                                            generateAutomatic={!isEditMode} // توليد تلقائي فقط للمنتجات الجديدة
                                            label={isEditMode ? `الباركود الحالي: ${modalData.barcode || 'غير محدد'}` : "نظام الباركود المتقدم"}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">سعر الشراء *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={modalData.purchase_price}
                                                onChange={(e) => setModalData(prev => ({...prev, purchase_price: e.target.value}))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">سعر البيع *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={modalData.selling_price}
                                                onChange={(e) => setModalData(prev => ({...prev, selling_price: e.target.value}))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">سعر الجملة</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={modalData.wholesale_price}
                                                onChange={(e) => setModalData(prev => ({...prev, wholesale_price: e.target.value}))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">كمية المخزون</label>
                                            <input
                                                type="number"
                                                value={modalData.stock_quantity}
                                                onChange={(e) => setModalData(prev => ({...prev, stock_quantity: e.target.value}))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                placeholder="0"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى</label>
                                            <input
                                                type="number"
                                                value={modalData.min_stock_level}
                                                onChange={(e) => setModalData(prev => ({...prev, min_stock_level: e.target.value}))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                placeholder="1"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الصلاحية</label>
                                            <input
                                                type="date"
                                                value={modalData.expiry_date}
                                                onChange={(e) => setModalData(prev => ({...prev, expiry_date: e.target.value}))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">حالة المنتج</label>
                                        <select
                                            value={modalData.is_active}
                                            onChange={(e) => setModalData(prev => ({...prev, is_active: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        >
                                            <option value={true}>نشط</option>
                                            <option value={false}>غير نشط</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={saveProduct}
                                disabled={modalSaving}
                                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                            >
                                {modalSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {isEditMode ? 'جار التعديل...' : 'جار الحفظ...'}
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {isEditMode ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                            )}
                                        </svg>
                                        {isEditMode ? 'تعديل المنتج' : 'إضافة المنتج'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Desktop View - Hidden on mobile */}
            <div className="hidden lg:flex flex-col h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h1>
                                <p className="text-gray-600 mt-1">إدارة وتنظيم المنتجات مثل الاكسل</p>
                            </div>
                            <button
                                onClick={addNewRow}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                إضافة صف جديد
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="px-6 py-3 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="البحث..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <select
                                    value={selectedSupplier}
                                    onChange={(e) => setSelectedSupplier(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">جميع الفئات</option>
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
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="all">جميع المخزونات</option>
                                    <option value="in_stock">متوفر</option>
                                    <option value="low_stock">منخفض</option>
                                    <option value="out_of_stock">نفذ</option>
                                </select>
                            </div>

                            <div className="text-sm text-gray-600 flex items-center">
                                المجموع: {allRows.length}
                            </div>
                        </div>
                    </div>
                </div>



                {/* Excel-like Table - Full Width */}
                <div className="flex-1 bg-white overflow-hidden">
                    <div className="h-full overflow-auto">
                        <table className="w-full table-fixed border-collapse">
                            {/* Header */}
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase border-r border-gray-200 w-12">
                                        #
                                    </th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase border-r border-gray-200 w-16">
                                        الصورة
                                    </th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase border-r border-gray-200 w-40">
                                        اسم المنتج (عربي)
                                    </th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase border-r border-gray-200 w-36">
                                        اسم المنتج (إنجليزي)
                                    </th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase border-r border-gray-200 w-28">
                                        المورد
                                    </th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase border-r border-gray-200 w-24">
                                        الفئة
                                    </th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase border-r border-gray-200 w-28">
                                        الباركود
                                    </th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase border-r border-gray-200 w-28">
                                        سعر الشراء
                                    </th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase border-r border-gray-200 w-28">
                                        سعر البيع
                                    </th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase border-r border-gray-200 w-28">
                                        سعر الجملة
                                    </th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase border-r border-gray-200 w-16">
                                        المخزون
                                    </th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase border-r border-gray-200 w-16">
                                        الحد الأدنى
                                    </th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase border-r border-gray-200 w-12">
                                        الحالة
                                    </th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase w-20">
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>

                            {/* Body */}
                            <tbody className="bg-white divide-y divide-gray-200">
                                {allRows.map((row, index) => {
                                    const isEditing = editingRows[row.id];
                                    const rowId = row.id;

                                    return (
                                        <tr key={rowId} className={`hover:bg-gray-50 ${isEditing ? 'bg-blue-50 border-l-2 border-blue-400' : ''}`}>
                                            <td className="px-2 py-1 text-xs text-gray-500 border-r border-gray-200">
                                                {index + 1}
                                            </td>

                                            <td className="px-2 py-1 border-r border-gray-200">
                                                <EditableCell
                                                    rowId={rowId}
                                                    field="image"
                                                    value={row.image}
                                                    type="image"
                                                />
                                            </td>

                                            <td className="px-2 py-1 border-r border-gray-200">
                                                <EditableCell
                                                    rowId={rowId}
                                                    field="name_ar"
                                                    value={row.name_ar}
                                                />
                                            </td>

                                            <td className="px-2 py-1 border-r border-gray-200">
                                                <EditableCell
                                                    rowId={rowId}
                                                    field="name_en"
                                                    value={row.name_en}
                                                />
                                            </td>

                                            <td className="px-2 py-1 border-r border-gray-200">
                                                <EditableCell
                                                    rowId={rowId}
                                                    field="supplier_id"
                                                    value={row.supplier_id}
                                                    type="select"
                                                    options={suppliers}
                                                />
                                            </td>

                                            <td className="px-2 py-1 border-r border-gray-200">
                                                <EditableCell
                                                    rowId={rowId}
                                                    field="category_id"
                                                    value={row.category_id}
                                                    type="select"
                                                    options={productCategories}
                                                />
                                            </td>

                                            <td className="px-2 py-1 border-r border-gray-200">
                                                <EditableCell
                                                    rowId={rowId}
                                                    field="barcode"
                                                    value={row.barcode}
                                                    type="barcode"
                                                />
                                            </td>

                                            <td className="px-2 py-1 border-r border-gray-200">
                                                <EditableCell
                                                    rowId={rowId}
                                                    field="purchase_price"
                                                    value={row.purchase_price}
                                                    type="price"
                                                />
                                            </td>

                                            <td className="px-2 py-1 border-r border-gray-200">
                                                <EditableCell
                                                    rowId={rowId}
                                                    field="selling_price"
                                                    value={row.selling_price}
                                                    type="price"
                                                />
                                            </td>

                                            <td className="px-2 py-1 border-r border-gray-200">
                                                <EditableCell
                                                    rowId={rowId}
                                                    field="wholesale_price"
                                                    value={row.wholesale_price}
                                                    type="price"
                                                />
                                            </td>

                                            <td className="px-2 py-1 border-r border-gray-200">
                                                <EditableCell
                                                    rowId={rowId}
                                                    field="stock_quantity"
                                                    value={row.stock_quantity}
                                                    type="number"
                                                />
                                            </td>

                                            <td className="px-2 py-1 border-r border-gray-200">
                                                <EditableCell
                                                    rowId={rowId}
                                                    field="min_stock_level"
                                                    value={row.min_stock_level}
                                                    type="number"
                                                />
                                            </td>

                                            <td className="px-2 py-1 border-r border-gray-200">
                                                <EditableCell
                                                    rowId={rowId}
                                                    field="is_active"
                                                    value={row.is_active}
                                                    type="boolean"
                                                />
                                            </td>

                                            <td className="px-2 py-1">
                                                <div className="flex items-center gap-1">
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                onClick={() => saveRow(rowId)}
                                                                disabled={savingRows[rowId]}
                                                                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white p-1 rounded text-xs w-6 h-6 flex items-center justify-center"
                                                                title="حفظ"
                                                            >
                                                                {savingRows[rowId] ? (
                                                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                ) : (
                                                                    '✓'
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => cancelEdit(rowId)}
                                                                disabled={savingRows[rowId]}
                                                                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white p-1 rounded text-xs w-6 h-6 flex items-center justify-center"
                                                                title="إلغاء"
                                                            >
                                                                ✕
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => startEdit(row)}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-xs w-6 h-6 flex items-center justify-center"
                                                                title="تعديل"
                                                            >
                                                                ✏️
                                                            </button>
                                                            {!row.isNew && (
                                                                <button
                                                                    onClick={() => deleteProduct(row)}
                                                                    className="bg-red-600 hover:bg-red-700 text-white p-1 rounded text-xs w-6 h-6 flex items-center justify-center"
                                                                    title="حذف"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Empty State */}
                {allRows.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
                        <p className="text-gray-600 mb-4">لم يتم العثور على أي منتجات. ابدأ بإضافة منتج جديد.</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            إضافة المنتج الأول
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile & Tablet View */}
            <div className="lg:hidden min-h-screen bg-gray-50">
                {/* Mobile Header */}
                <div className="bg-white shadow-sm sticky top-0 z-40">
                    <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-gray-900">إدارة المنتجات</h1>
                                <p className="text-sm text-gray-600">إدارة وتنظيم المنتجات</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                إضافة منتج
                            </button>
                        </div>
                    </div>

                    {/* Mobile Filters */}
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="البحث..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                            />
                            <select
                                value={selectedSupplier}
                                onChange={(e) => setSelectedSupplier(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">جميع الموردين</option>
                                {suppliers.map(supplier => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name_ar}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-xs text-gray-600 mt-2 text-center">
                            المجموع: {allRows.length} منتج
                        </div>
                    </div>
                </div>

                {/* Mobile Product Cards */}
                <div className="p-4 space-y-4">
                    {allRows.map((row, index) => {
                        const isEditing = editingRows[row.id];
                        const rowId = row.id;

                        return (
                            <div
                                key={rowId}
                                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
                                    isEditing ? 'ring-2 ring-blue-400 border-blue-400' : ''
                                }`}
                            >
                                {/* Mobile Product Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                            {row.image ? (
                                                <img
                                                    src={`/storage/${row.image}`}
                                                    alt="صورة المنتج"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={isEditing.name_ar || ''}
                                                        onChange={(e) => updateRowField(rowId, 'name_ar', e.target.value)}
                                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                        placeholder="اسم المنتج (عربي)"
                                                    />
                                                ) : (
                                                    row.name_ar || 'غير محدد'
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                رقم {index + 1} • {row.barcode || 'بدون باركود'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Action Buttons */}
                                    <div className="flex items-center gap-1">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={() => saveRow(rowId)}
                                                    disabled={savingRows[rowId]}
                                                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white p-2 rounded text-xs"
                                                    title="حفظ"
                                                >
                                                    {savingRows[rowId] ? (
                                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        '✓'
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => cancelEdit(rowId)}
                                                    disabled={savingRows[rowId]}
                                                    className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white p-2 rounded text-xs"
                                                    title="إلغاء"
                                                >
                                                    ✕
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => startEdit(row)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-xs"
                                                    title="تعديل"
                                                >
                                                    ✏️
                                                </button>
                                                {!row.isNew && (
                                                    <button
                                                        onClick={() => deleteProduct(row)}
                                                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded text-xs"
                                                        title="حذف"
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Mobile Product Details */}
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">الاسم الإنجليزي</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={isEditing.name_en || ''}
                                                    onChange={(e) => updateRowField(rowId, 'name_en', e.target.value)}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                    placeholder="Product Name (English)"
                                                />
                                            ) : (
                                                <div className="text-sm text-gray-600">{row.name_en || '-'}</div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">المورد</label>
                                            {isEditing ? (
                                                <select
                                                    value={isEditing.supplier_id || ''}
                                                    onChange={(e) => updateRowField(rowId, 'supplier_id', e.target.value)}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="">اختر المورد</option>
                                                    {suppliers.map(supplier => (
                                                        <option key={supplier.id} value={supplier.id}>
                                                            {supplier.name_ar}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="text-sm text-gray-600">
                                                    {suppliers.find(s => s.id == row.supplier_id)?.name_ar || '-'}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">سعر الشراء</label>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={isEditing.purchase_price || ''}
                                                    onChange={(e) => updateRowField(rowId, 'purchase_price', e.target.value)}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                    placeholder="0"
                                                />
                                            ) : (
                                                <div className="text-sm font-medium text-green-600">{formatPrice(row.purchase_price)}</div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">سعر البيع</label>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={isEditing.selling_price || ''}
                                                    onChange={(e) => updateRowField(rowId, 'selling_price', e.target.value)}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                    placeholder="0"
                                                />
                                            ) : (
                                                <div className="text-sm font-medium text-green-600">{formatPrice(row.selling_price)}</div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">المخزون</label>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={isEditing.stock_quantity || ''}
                                                    onChange={(e) => updateRowField(rowId, 'stock_quantity', e.target.value)}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                    placeholder="0"
                                                />
                                            ) : (
                                                <div className="text-sm text-gray-600">{row.stock_quantity || '0'}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">الحالة</label>
                                            {isEditing ? (
                                                <select
                                                    value={isEditing.is_active ? 'true' : 'false'}
                                                    onChange={(e) => updateRowField(rowId, 'is_active', e.target.value === 'true')}
                                                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="true">نشط</option>
                                                    <option value="false">غير نشط</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                    row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {row.is_active ? 'نشط' : 'غير نشط'}
                                                </span>
                                            )}
                                        </div>

                                        {isEditing && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">تغيير الصورة</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            handleImageUpload(rowId, file);
                                                        }
                                                    }}
                                                    className="text-xs border border-gray-300 rounded p-1"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Mobile Empty State */}
                    {allRows.length === 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                            <div className="text-gray-400 text-4xl mb-3">📦</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
                            <p className="text-gray-600 mb-4 text-sm">لم يتم العثور على أي منتجات. ابدأ بإضافة منتج جديد.</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                            >
                                إضافة المنتج الأول
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
