import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import RepresentativeLayout from '@/Layouts/RepresentativeLayout';
import {
    FaShoppingCart,
    FaSearch,
    FaBarcode,
    FaPlus,
    FaMinus,
    FaTrash,
    FaUser,
    FaUsers,
    FaMoneyBillWave,
    FaCalculator,
    FaPrint,
    FaSave,
    FaTimes,
    FaExclamationTriangle,
    FaCheckCircle
} from 'react-icons/fa';

const Index = ({ products, customers, representatives, flash }) => {
    // حالة السلة والمنتجات
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState(products || []);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // استخراج الفئات من المنتجات
    const categories = [...new Set((products || []).map(product => product.category).filter(Boolean))];

    // حالة العميل والدفع
    const [saleType, setSaleType] = useState('cash'); // cash, customer, representative
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedRepresentative, setSelectedRepresentative] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    // حالة الحسابات
    const [paidAmount, setPaidAmount] = useState(0);
    const [notes, setNotes] = useState('');
    const [dueDate, setDueDate] = useState('');

    // حالة التحميل والأخطاء
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // حالة إظهار السلة
    const [showCart, setShowCart] = useState(false);

    // حالة عرض الصورة
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // مراجع العناصر
    const barcodeRef = useRef(null);
    const searchRef = useRef(null);

    // تصفية المنتجات بناءً على البحث والفئة
    useEffect(() => {
        let filtered = products || [];

        // تصفية حسب الفئة
        if (selectedCategory) {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // تصفية حسب البحث
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.barcode.includes(searchTerm)
            );
        }

        setFilteredProducts(filtered);
    }, [searchTerm, selectedCategory, products]);

    // عرض رسالة النجاح عند اكتمال البيع
    useEffect(() => {
        if (flash?.success) {
            alert(flash.success);
        }
    }, [flash]);

    // تفريغ السلة عند تحميل الصفحة (بداية جلسة جديدة)
    useEffect(() => {
        // تفريغ السلة عند تحميل الصفحة للبداية بجلسة نظيفة
        clearCart();
    }, []);

    // التعامل مع البحث بالباركود
    const handleBarcodeSearch = async () => {
        if (!barcodeInput.trim()) return;

        // البحث في المنتجات المحلية أولاً
        const localProduct = products.find(p => p.barcode === barcodeInput);
        if (localProduct) {
            addToCart(localProduct);
            setBarcodeInput('');
            return;
        }

        // البحث من الخادم إذا لم يوجد محلياً
        try {
            const response = await fetch(`/representatives/pos/search-product?barcode=${barcodeInput}`);
            const data = await response.json();

            if (data.product) {
                addToCart(data.product);
            } else {
                alert('لم يتم العثور على المنتج');
            }
        } catch (error) {
            console.error('خطأ في البحث:', error);
            alert('خطأ في البحث عن المنتج');
        }

        setBarcodeInput('');
    };

    // فتح الصورة في نافذة منبثقة
    const openImageModal = (product) => {
        const imageSrc = product.image ? `/storage/${product.image}` : '/images/no-product-image.png';
        setSelectedImage({
            src: imageSrc,
            name: product.name,
            barcode: product.barcode
        });
        setShowImageModal(true);
    };

    // إضافة للسلة
    const addToCart = (product) => {
        if (product.quantity <= 0) {
            alert('المنتج غير متوفر في المخزون');
            return;
        }

        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            if (existingItem.quantity + 1 > product.quantity) {
                alert(`الكمية المتاحة: ${product.quantity}`);
                return;
            }
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            const newItem = {
                id: product.id,
                product: product,
                quantity: 1,
                unit_sale_price: parseFloat(product.selling_price || 0),
                unit_discount: 0
            };
            setCart([...cart, newItem]);
        }
    };

    // تحديث كمية السلة
    const updateCartQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        setCart(cart.map(item => {
            if (item.id === itemId) {
                const product = item.product;
                if (newQuantity > product.quantity) {
                    alert(`الكمية المتاحة: ${product.quantity}`);
                    return item;
                }
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    // حذف من السلة
    const removeFromCart = (itemId) => {
        setCart(cart.filter(item => item.id !== itemId));
    };

    // مسح السلة
    const clearCart = () => {
        setCart([]);
        setSelectedCustomer(null);
        setSelectedRepresentative(null);
        setCustomerName('');
        setCustomerPhone('');
        setPaidAmount(0);
        setNotes('');
        setDueDate('');
        setErrors({});
    };

    // حساب المجاميع
    const calculateTotals = () => {
        const subtotal = cart.reduce((sum, item) => {
            const itemTotal = parseFloat(item.quantity || 0) * parseFloat(item.unit_sale_price || 0);
            return sum + itemTotal;
        }, 0);

        const total = subtotal;
        const remaining = total - parseFloat(paidAmount || 0);

        // حساب الوزن الكلي
        const totalWeight = cart.reduce((sum, item) => {
            const pieceWeight = parseFloat(item.product?.piece_weight_grams) || 0;
            const piecesPerCarton = parseFloat(item.product?.pieces_per_carton) || 1;
            const quantitySold = parseFloat(item.quantity) || 0;

            // الوزن = عدد الكراتين × عدد القطع في الكارتون × وزن القطعة الواحدة
            const itemWeight = quantitySold * piecesPerCarton * pieceWeight;
            return sum + itemWeight;
        }, 0);

        return {
            subtotal: subtotal,
            total: total,
            remaining: remaining,
            totalWeightGrams: totalWeight,
            totalWeightKg: totalWeight / 1000,
            profit: cart.reduce((sum, item) => {
                const itemProfit = (parseFloat(item.unit_sale_price || 0) - parseFloat(item.product?.purchase_price || 0)) * parseFloat(item.quantity || 0);
                return sum + itemProfit;
            }, 0)
        };
    };

    const totals = calculateTotals();

    // تحديد حالة الدفع
    const getPaymentStatus = () => {
        if (totals.remaining <= 0) return 'paid';
        if (paidAmount > 0) return 'partial';
        return 'debt';
    };

    // التحقق من صحة البيانات
    const validateSale = () => {
        const newErrors = {};

        if (cart.length === 0) {
            newErrors.cart = 'يجب إضافة منتج واحد على الأقل';
        }

        if (saleType === 'customer' && !selectedCustomer) {
            newErrors.customer = 'يجب اختيار عميل';
        }

        if (saleType === 'representative' && !selectedRepresentative) {
            newErrors.representative = 'يجب اختيار مندوب';
        }

        if (saleType === 'cash' && (!customerName.trim())) {
            newErrors.customerName = 'يجب إدخال اسم العميل';
        }

        if (totals.remaining > 0 && !dueDate) {
            newErrors.dueDate = 'يجب تحديد تاريخ الاستحقاق للديون';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // إنجاز البيع
    const completeSale = async () => {
        if (!validateSale()) {
            return;
        }

        setLoading(true);

        const saleData = {
            sale_type: saleType,
            customer_name: saleType === 'cash' ? customerName : null,
            customer_phone: saleType === 'cash' ? customerPhone : null,
            customer_id: saleType === 'customer' ? selectedCustomer?.id : null,
            representative_id: saleType === 'representative' ? selectedRepresentative?.id : null,
            subtotal: totals.subtotal,
            discount_amount: 0, // إزالة الخصم
            total_amount: totals.total,
            paid_amount: paidAmount,
            remaining_amount: totals.remaining,
            payment_status: getPaymentStatus(),
            due_date: totals.remaining > 0 ? dueDate : null,
            notes: notes,
            items: cart.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
                unit_sale_price: item.unit_sale_price,
                unit_discount: 0, // إزالة الخصم
                total_price: item.unit_sale_price * item.quantity
            }))
        };

        router.post('/representatives/pos', saleData, {
            onSuccess: (page) => {
                // تم إنجاز البيع بنجاح
                clearCart();
                setShowCart(false);
            },
            onError: (errors) => {
                console.error('خطأ في البيع:', errors);
                setErrors(errors);
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    return (
        <RepresentativeLayout title="نقطة البيع">
            <Head title="نقطة البيع" />

            <div className="space-y-4">
                {/* البحث والفلاتر */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* البحث في المنتجات */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">البحث</label>
                            <div className="relative">
                                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="اسم المنتج أو الباركود..."
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* فلتر الفئات */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">جميع الفئات</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* مسح الباركود */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الباركود</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <FaBarcode className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        ref={barcodeRef}
                                        type="text"
                                        value={barcodeInput}
                                        onChange={(e) => setBarcodeInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                                        placeholder="مسح الباركود..."
                                        className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    onClick={handleBarcodeSearch}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    إضافة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* قائمة المنتجات */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="max-h-[70vh] overflow-y-auto">
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 p-3">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                        {/* صورة المنتج */}
                                        <div className="relative mb-2">
                                            <img
                                                src={product.image ? `/storage/${product.image}` : '/images/no-product-image.png'}
                                                alt={product.name}
                                                className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => openImageModal(product)}
                                                onError={(e) => {
                                                    e.target.src = '/images/no-product-image.png';
                                                }}
                                            />
                                            <div className="absolute top-1 right-1 bg-white px-1 py-0.5 rounded text-xs font-medium text-gray-600 shadow-sm">
                                                #{product.barcode}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h4 className="font-semibold text-gray-900 text-sm leading-tight overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{product.name}</h4>
                                            {product.category && (
                                                <div className="text-xs text-blue-600 font-medium">
                                                    {product.category}
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-600">
                                                {product.supplier_name || 'غير محدد'}
                                            </div>
                                            {/* معلومات الكارتون والوزن */}
                                            {(product.pieces_per_carton || product.piece_weight_grams) && (
                                                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                                    {product.pieces_per_carton && (
                                                        <span className="mr-2">🧩 {product.pieces_per_carton}/كارتون</span>
                                                    )}
                                                    {product.piece_weight_grams && (
                                                        <span>⚖️ {product.piece_weight_grams}غ</span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm">
                                                    <span className="text-green-600 font-semibold">{product.selling_price} د.ع</span>
                                                    <span className="text-gray-500 text-xs">/{product.unit}</span>
                                                </div>
                                                <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                                    {product.quantity}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => addToCart(product)}
                                                disabled={product.quantity <= 0}
                                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <FaPlus className="w-3 h-3" />
                                                إضافة
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-gray-500">لا توجد منتجات متاحة</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* الزر العائم للسلة */}
            <button
                onClick={() => setShowCart(!showCart)}
                className="fixed bottom-6 left-6 w-16 h-16 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 flex items-center justify-center z-40"
            >
                <FaShoppingCart className="w-6 h-6" />
                {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {cart.length}
                    </span>
                )}
            </button>

            {/* نافذة السلة المنبثقة */}
            {showCart && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        {/* رأس النافذة */}
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-green-600 text-white">
                            <h3 className="text-lg font-bold">السلة والدفع</h3>
                            <button
                                onClick={() => setShowCart(false)}
                                className="text-white hover:text-gray-200 p-1"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col h-full max-h-[80vh]">
                            {/* قسم السلة */}
                            <div className="flex-1">
                                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-900">منتجات السلة</h4>
                                    {cart.length > 0 && (
                                        <button
                                            onClick={clearCart}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="مسح السلة"
                                        >
                                            <FaTrash className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {cart.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <FaShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">السلة فارغة</p>
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto max-h-96">
                                        {cart.map((item) => (
                                            <div key={item.id} className="p-4 border-b border-gray-100 last:border-b-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-medium text-gray-900 text-sm">{item.product.name}</h4>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <FaTimes className="w-3 h-3" />
                                                    </button>
                                                </div>

                                                {/* الكمية */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <button
                                                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                                        className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                                    >
                                                        <FaMinus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-sm font-medium min-w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                                        className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                                    >
                                                        <FaPlus className="w-3 h-3" />
                                                    </button>
                                                </div>

                                                {/* السعر */}
                                                <div className="space-y-2">
                                                    <div>
                                                        <label className="block text-xs text-gray-600">سعر البيع</label>
                                                        <div className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-gray-100 text-gray-700">
                                                            {parseFloat(item.unit_sale_price || 0).toFixed(2)} د.ع
                                                        </div>
                                                    </div>
                                                    {/* معلومات الوزن والكارتون */}
                                                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                                        {item.product.pieces_per_carton && (
                                                            <div>🧩 {item.product.pieces_per_carton} قطعة/كارتون</div>
                                                        )}
                                                        {item.product.piece_weight_grams && (
                                                            <div>⚖️ {item.product.piece_weight_grams} غ/قطعة</div>
                                                        )}
                                                        {item.product.piece_weight_grams && (
                                                            <div className="text-purple-600 font-medium">
                                                                الوزن الكلي: {(item.quantity * (item.product.pieces_per_carton || 1) * item.product.piece_weight_grams).toLocaleString()} غرام
                                                                <div className="text-xs text-gray-500">
                                                                    ({item.quantity} كارتون × {item.product.pieces_per_carton || 1} قطعة × {item.product.piece_weight_grams} غ)
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-2 pt-2 border-t border-gray-100">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        المجموع: {(parseFloat(item.unit_sale_price || 0) * parseFloat(item.quantity || 0)).toFixed(2)} د.ع
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* المجموع النهائي وأزرار الإجراءات */}
                                {cart.length > 0 && (
                                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                                        {/* المجاميع */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span>المجموع الفرعي:</span>
                                                <span className="font-semibold">{totals.subtotal.toFixed(2)} د.ع</span>
                                            </div>
                                            {/* الوزن الكلي */}
                                            {totals.totalWeightGrams > 0 && (
                                                <div className="flex justify-between text-sm text-purple-600">
                                                    <span>الوزن الكلي:</span>
                                                    <span className="font-semibold">
                                                        {totals.totalWeightGrams.toLocaleString()} غرام
                                                        {totals.totalWeightKg >= 1 && (
                                                            <span className="ml-1">({totals.totalWeightKg.toFixed(2)} كغ)</span>
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                                <span>الإجمالي:</span>
                                                <span className="text-green-600">{totals.total.toFixed(2)} د.ع</span>
                                            </div>
                                        </div>

                                        {/* أزرار الإجراءات */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setShowCart(false);
                                                    router.visit('/representatives/pos/invoice', {
                                                        method: 'post',
                                                        data: { cart: cart }
                                                    });
                                                }}
                                                disabled={cart.length === 0}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <FaCalculator className="w-4 h-4" />
                                                إتمام الدفع
                                            </button>
                                            <button
                                                onClick={clearCart}
                                                className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                            >
                                                مسح
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* نافذة عرض الصورة */}
            {showImageModal && selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowImageModal(false)}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* رأس النافذة */}
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{selectedImage.name}</h3>
                                <p className="text-sm text-gray-600">باركود: #{selectedImage.barcode}</p>
                            </div>
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <FaTimes className="w-6 h-6" />
                            </button>
                        </div>

                        {/* الصورة */}
                        <div className="p-4">
                            <img
                                src={selectedImage.src}
                                alt={selectedImage.name}
                                className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                                onError={(e) => {
                                    e.target.src = '/images/no-product-image.png';
                                }}
                            />
                        </div>

                        {/* زر الإغلاق */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </RepresentativeLayout>
    );
};

export default Index;
