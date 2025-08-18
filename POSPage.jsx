import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';

const POSPage = () => {
    useEffect(() => {
        // Hide loading screen after component loads
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }, 1000);
    }, []);

    const [isArabic, setIsArabic] = useState(true);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        discount: 0
    });
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [showCheckout, setShowCheckout] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Mock products data
    const [products, setProducts] = useState([
        {
            id: 1,
            name: 'جهاز كمبيوتر محمول',
            price: 750000,
            stock: 15,
            category: 'electronics',
            barcode: '123456789',
            image: '💻'
        },
        {
            id: 2,
            name: 'طابعة ليزر',
            price: 300000,
            stock: 8,
            category: 'electronics',
            barcode: '123456790',
            image: '🖨️'
        },
        {
            id: 3,
            name: 'ماوس لاسلكي',
            price: 25000,
            stock: 50,
            category: 'accessories',
            barcode: '123456791',
            image: '🖱️'
        },
        {
            id: 4,
            name: 'لوحة مفاتيح',
            price: 45000,
            stock: 35,
            category: 'accessories',
            barcode: '123456792',
            image: '⌨️'
        },
        {
            id: 5,
            name: 'سماعة رأس',
            price: 80000,
            stock: 20,
            category: 'accessories',
            barcode: '123456793',
            image: '🎧'
        },
        {
            id: 6,
            name: 'شاشة كمبيوتر',
            price: 400000,
            stock: 12,
            category: 'electronics',
            barcode: '123456794',
            image: '🖥️'
        },
        {
            id: 7,
            name: 'كابل USB',
            price: 15000,
            stock: 100,
            category: 'accessories',
            barcode: '123456795',
            image: '🔌'
        },
        {
            id: 8,
            name: 'هارد ديسك خارجي',
            price: 120000,
            stock: 25,
            category: 'storage',
            barcode: '123456796',
            image: '💾'
        }
    ]);

    const content = {
        ar: {
            title: 'نقطة البيع',
            subtitle: 'نظام البيع المباشر',
            search: 'البحث عن منتج أو باركود...',
            categories: {
                all: 'جميع الفئات',
                electronics: 'إلكترونيات',
                accessories: 'إكسسوارات',
                storage: 'تخزين'
            },
            product: {
                addToCart: 'إضافة للسلة',
                price: 'السعر',
                stock: 'المخزون',
                outOfStock: 'نفد المخزون'
            },
            cart: {
                title: 'سلة المشتريات',
                empty: 'السلة فارغة',
                item: 'صنف',
                quantity: 'الكمية',
                price: 'السعر',
                total: 'المجموع',
                subtotal: 'المجموع الفرعي',
                discount: 'الخصم',
                finalTotal: 'المجموع النهائي',
                clear: 'إفراغ السلة',
                checkout: 'إتمام الشراء'
            },
            customer: {
                title: 'معلومات العميل',
                name: 'اسم العميل',
                phone: 'رقم الهاتف',
                discount: 'نسبة الخصم (%)',
                optional: 'اختياري'
            },
            payment: {
                title: 'طريقة الدفع',
                methods: {
                    cash: 'نقدي',
                    card: 'بطاقة ائتمان',
                    bank: 'تحويل بنكي'
                },
                process: 'معالجة الدفع',
                processing: 'جاري المعالجة...',
                success: 'تمت العملية بنجاح',
                receipt: 'طباعة الإيصال'
            },
            actions: {
                remove: 'حذف',
                increase: 'زيادة',
                decrease: 'تقليل',
                cancel: 'إلغاء',
                confirm: 'تأكيد'
            },
            currency: 'د.ع',
            invoiceNumber: 'رقم الفاتورة'
        },
        en: {
            title: 'Point of Sale',
            subtitle: 'Direct sales system',
            search: 'Search product or barcode...',
            categories: {
                all: 'All Categories',
                electronics: 'Electronics',
                accessories: 'Accessories',
                storage: 'Storage'
            },
            product: {
                addToCart: 'Add to Cart',
                price: 'Price',
                stock: 'Stock',
                outOfStock: 'Out of Stock'
            },
            cart: {
                title: 'Shopping Cart',
                empty: 'Cart is empty',
                item: 'Item',
                quantity: 'Quantity',
                price: 'Price',
                total: 'Total',
                subtotal: 'Subtotal',
                discount: 'Discount',
                finalTotal: 'Final Total',
                clear: 'Clear Cart',
                checkout: 'Checkout'
            },
            customer: {
                title: 'Customer Information',
                name: 'Customer Name',
                phone: 'Phone Number',
                discount: 'Discount (%)',
                optional: 'Optional'
            },
            payment: {
                title: 'Payment Method',
                methods: {
                    cash: 'Cash',
                    card: 'Credit Card',
                    bank: 'Bank Transfer'
                },
                process: 'Process Payment',
                processing: 'Processing...',
                success: 'Transaction Successful',
                receipt: 'Print Receipt'
            },
            actions: {
                remove: 'Remove',
                increase: 'Increase',
                decrease: 'Decrease',
                cancel: 'Cancel',
                confirm: 'Confirm'
            },
            currency: 'IQD',
            invoiceNumber: 'Invoice Number'
        }
    };

    const currentContent = isArabic ? content.ar : content.en;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat(isArabic ? 'ar-IQ' : 'en-US').format(amount);
    };

    // Calculate cart totals
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discountAmount = (subtotal * customerInfo.discount) / 100;
    const total = subtotal - discountAmount;

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                setCart(cart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            }
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        const product = products.find(p => p.id === productId);
        if (newQuantity <= product.stock) {
            setCart(cart.map(item =>
                item.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        }
    };

    const clearCart = () => {
        setCart([]);
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateDiscount = () => {
        return (calculateSubtotal() * customerInfo.discount) / 100;
    };

    const calculateTotal = () => {
        return calculateSubtotal() - calculateDiscount();
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.barcode.includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleCheckout = async () => {
        setIsProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate invoice number
        const invoiceNumber = `INV-${Date.now()}`;

        // Update product stock
        const updatedProducts = products.map(product => {
            const cartItem = cart.find(item => item.id === product.id);
            if (cartItem) {
                return { ...product, stock: product.stock - cartItem.quantity };
            }
            return product;
        });
        setProducts(updatedProducts);

        // Clear cart and reset form
        setCart([]);
        setCustomerInfo({ name: '', phone: '', discount: 0 });
        setShowCheckout(false);
        setIsProcessing(false);

        alert(`${currentContent.payment.success}\n${currentContent.invoiceNumber}: ${invoiceNumber}`);
    };

    return (
        <div className={`min-h-screen bg-gray-50 ${isArabic ? 'rtl' : 'ltr'}`}>
            <BackButton />
            {/* Mobile Layout */}
            <div className="lg:hidden">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="px-4 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    {currentContent.title}
                                </h1>
                                <p className="text-gray-600 text-sm mt-1">
                                    {currentContent.subtitle}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowCart(true)}
                                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"
                                >
                                    🛒 ({cart.length})
                                </button>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={currentContent.search}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {Object.entries(currentContent.categories).map(([key, value]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedCategory(key)}
                                        className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                                            selectedCategory === key
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid - Mobile */}
                <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-3">
                                <div className="text-center mb-3">
                                    <div className="text-2xl mb-2">{product.image}</div>
                                    <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm font-bold text-blue-600 mb-2">
                                        {formatCurrency(product.price)} {currentContent.currency}
                                    </p>
                                    <p className={`text-xs mb-3 ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {product.stock > 0 ? `${currentContent.product.stock}: ${product.stock}` : currentContent.product.outOfStock}
                                    </p>
                                    <button
                                        onClick={() => addToCart(product)}
                                        disabled={product.stock === 0}
                                        className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-xs"
                                    >
                                        {currentContent.product.addToCart}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Cart Button for Mobile */}
            <div className="lg:hidden fixed bottom-4 right-4 z-40">
                <button
                    onClick={() => setShowCart(true)}
                    className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors relative"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13h10M17 13l2.5 5M9 19.5h.01M20 19.5h.01" />
                    </svg>
                    {cart.length > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center absolute -top-2 -right-2">
                            {cart.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Mobile Cart Modal */}
            {showCart && (
                <div className="lg:hidden fixed inset-0 bg-white z-50 flex flex-col">
                    {/* Cart Header - Fixed */}
                    <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                🛒 {currentContent.cart.title}
                            </h2>
                            <button
                                onClick={() => setShowCart(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Cart Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {cart.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🛒</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {currentContent.cart.empty}
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    ابدأ بإضافة المنتجات للسلة
                                </p>
                                <button
                                    onClick={() => setShowCart(false)}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    تصفح المنتجات
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 pb-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="text-3xl">{item.image}</div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {formatCurrency(item.price)} {currentContent.currency}
                                                </p>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-9 h-9 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 font-bold"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-lg font-bold w-12 text-center bg-white px-2 py-1 rounded border">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-9 h-9 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-600 font-bold"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    {/* Item Total */}
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-blue-600">
                                                            {formatCurrency(item.price * item.quantity)} {currentContent.currency}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cart Footer - Fixed */}
                    {cart.length > 0 && (
                        <div className="bg-white border-t border-gray-200 flex-shrink-0 shadow-lg">
                            {/* Totals Section */}
                            <div className="p-4 w-full">
                                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                                    <div className="flex justify-between text-gray-600">
                                        <span className="font-medium">{currentContent.cart.subtotal}:</span>
                                        <span className="font-bold">{formatCurrency(subtotal)} {currentContent.currency}</span>
                                    </div>
                                    {customerInfo.discount > 0 && (
                                        <div className="flex justify-between text-red-600">
                                            <span className="font-medium">{currentContent.cart.discount} ({customerInfo.discount}%):</span>
                                            <span className="font-bold">-{formatCurrency(discountAmount)} {currentContent.currency}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xl font-bold text-green-600 pt-2 border-t border-gray-300">
                                        <span>{currentContent.cart.finalTotal}:</span>
                                        <span>{formatCurrency(total)} {currentContent.currency}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setCart([])}
                                        className="flex-1 bg-red-100 text-red-800 py-4 px-4 rounded-lg hover:bg-red-200 transition-colors font-medium"
                                    >
                                        <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        {currentContent.cart.clear}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowCart(false);
                                            setShowCheckout(true);
                                        }}
                                        className="flex-2 bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors font-bold text-lg"
                                    >
                                        <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {currentContent.cart.checkout}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Desktop Layout */}
            <div className="hidden lg:flex h-screen">
                {/* Products Section */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="bg-white shadow-sm border-b">
                        <div className="px-4 py-4">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {currentContent.title}
                                    </h1>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {currentContent.subtitle}
                                    </p>
                                </div>
                            </div>

                            {/* Search and Filters */}
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder={currentContent.search}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {Object.entries(currentContent.categories).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 p-4 overflow-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">{product.image}</div>
                                        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-lg font-bold text-blue-600 mb-2">
                                            {formatCurrency(product.price)} {currentContent.currency}
                                        </p>
                                        <p className={`text-xs mb-3 ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {product.stock > 0 ? `${currentContent.product.stock}: ${product.stock}` : currentContent.product.outOfStock}
                                        </p>
                                        <button
                                            onClick={() => addToCart(product)}
                                            disabled={product.stock === 0}
                                            className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                                        >
                                            {currentContent.product.addToCart}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cart Section - Desktop */}
                <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
                    {/* Cart Header */}
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900">
                            {currentContent.cart.title}
                        </h2>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-auto p-4">
                        {cart.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13h10M17 13l2.5 5M9 19.5h.01M20 19.5h.01" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-500">{currentContent.cart.empty}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map((item) => (
                                    <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                                                {item.name}
                                            </h4>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-600 hover:text-red-800 text-xs"
                                            >
                                                {currentContent.actions.remove}
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm font-medium w-8 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">
                                                    {formatCurrency(item.price)} × {item.quantity}
                                                </p>
                                                <p className="font-bold text-gray-900">
                                                    {formatCurrency(item.price * item.quantity)} {currentContent.currency}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cart Summary */}
                    {cart.length > 0 && (
                        <div className="border-t border-gray-200 p-4">
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{currentContent.cart.subtotal}:</span>
                                    <span className="font-medium">{formatCurrency(calculateSubtotal())} {currentContent.currency}</span>
                                </div>

                                {customerInfo.discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{currentContent.cart.discount} ({customerInfo.discount}%):</span>
                                        <span className="font-medium text-red-600">-{formatCurrency(calculateDiscount())} {currentContent.currency}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>{currentContent.cart.finalTotal}:</span>
                                    <span className="text-blue-600">{formatCurrency(calculateTotal())} {currentContent.currency}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setShowCheckout(true)}
                                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    {currentContent.cart.checkout}
                                </button>
                                <button
                                    onClick={clearCart}
                                    className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    {currentContent.cart.clear}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Checkout Modal */}
            {showCheckout && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4">
                    <div className="bg-white rounded-t-lg lg:rounded-lg shadow-xl w-full lg:max-w-md max-h-[90vh] lg:max-h-auto overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 lg:p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {currentContent.cart.checkout}
                                </h2>
                                <button
                                    onClick={() => setShowCheckout(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-4 lg:p-6">
                            {/* Cart Summary for Mobile */}
                            <div className="lg:hidden mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    {currentContent.cart.title}
                                </h3>
                                {cart.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500">{currentContent.cart.empty}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-2">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                                                        {item.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-600">
                                                        {item.quantity} × {formatCurrency(item.price)} {currentContent.currency}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-sm font-medium w-8 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-red-600 hover:text-red-800 text-xs ml-1"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Cart Totals */}
                                {cart.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>{currentContent.cart.subtotal}:</span>
                                                <span>{formatCurrency(subtotal)} {currentContent.currency}</span>
                                            </div>
                                            {customerInfo.discount > 0 && (
                                                <div className="flex justify-between text-red-600">
                                                    <span>{currentContent.cart.discount} ({customerInfo.discount}%):</span>
                                                    <span>-{formatCurrency(discountAmount)} {currentContent.currency}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                                <span>{currentContent.cart.finalTotal}:</span>
                                                <span>{formatCurrency(total)} {currentContent.currency}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Customer Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    {currentContent.customer.title}
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {currentContent.customer.name} ({currentContent.customer.optional})
                                        </label>
                                        <input
                                            type="text"
                                            value={customerInfo.name}
                                            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {currentContent.customer.phone} ({currentContent.customer.optional})
                                        </label>
                                        <input
                                            type="tel"
                                            value={customerInfo.phone}
                                            onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {currentContent.customer.discount}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={customerInfo.discount}
                                            onChange={(e) => setCustomerInfo({...customerInfo, discount: parseFloat(e.target.value) || 0})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    {currentContent.payment.title}
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(currentContent.payment.methods).map(([key, value]) => (
                                        <label key={key} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={key}
                                                checked={paymentMethod === key}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">{value}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Total Summary */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>{currentContent.cart.finalTotal}:</span>
                                    <span className="text-green-600">{formatCurrency(calculateTotal())} {currentContent.currency}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCheckout(false)}
                                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    {currentContent.actions.cancel}
                                </button>
                                <button
                                    onClick={handleCheckout}
                                    disabled={isProcessing}
                                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                                >
                                    {isProcessing ? currentContent.payment.processing : currentContent.payment.process}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POSPage;
