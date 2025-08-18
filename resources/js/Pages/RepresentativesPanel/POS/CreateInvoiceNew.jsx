import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import RepresentativeLayout from '@/Layouts/RepresentativeLayout';
import { formatCurrency } from '@/utils/helpers';
import {
    FaShoppingCart,
    FaSearch,
    FaPlus,
    FaMinus,
    FaTrash,
    FaBarcode,
    FaUser,
    FaMoneyBillWave,
    FaTh,
    FaList,
    FaFilter
} from 'react-icons/fa';

export default function CreateInvoice({ representative, customers, products }) {
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // grid or list

    const { data, setData, post, processing, errors } = useForm({
        representative_id: representative.id,
        customer_id: '',
        items: [],
        paid_amount: 0,
        notes: ''
    });

    // فلترة المنتجات
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.barcode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === '' || product.supplier_type?.name === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // الحصول على الفئات المتاحة
    const categories = [...new Set(products.map(p => p.supplier_type?.name).filter(Boolean))];

    // إضافة منتج للسلة
    const addToCart = (product, quantity = 1) => {
        // التحقق من توفر المخزون (الكراتين)
        if (product.cartons_count < quantity) {
            alert(`عذراً، المتوفر فقط ${product.cartons_count} كرتون من هذا المنتج`);
            return;
        }

        const existingItem = cart.find(item => item.product_id === product.id);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            // التحقق من عدم تجاوز المخزون المتاح
            if (newQuantity > product.cartons_count) {
                alert(`عذراً، المتوفر فقط ${product.cartons_count} كرتون من هذا المنتج`);
                return;
            }
            updateCartQuantity(product.id, newQuantity);
        } else {
            setCart([...cart, {
                product_id: product.id,
                product_name: product.name,
                product_image: product.image,
                quantity: quantity,
                unit_price: product.selling_price,
                total_price: quantity * product.selling_price,
                cartons_stock: product.cartons_count,
                units_per_carton: product.units_per_carton
            }]);
        }
    };

    // تحديث كمية المنتج في السلة
    const updateCartQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        // البحث عن المنتج للتحقق من المخزون
        const product = products.find(p => p.id === productId);
        if (product && newQuantity > product.cartons_count) {
            alert(`عذراً، المتوفر فقط ${product.cartons_count} كرتون من هذا المنتج`);
            return;
        }

        setCart(cart.map(item =>
            item.product_id === productId
                ? {
                    ...item,
                    quantity: newQuantity,
                    total_price: newQuantity * item.unit_price
                }
                : item
        ));
    };

    // إزالة منتج من السلة
    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product_id !== productId));
    };

    // حساب إجمالي الفاتورة
    const getTotalAmount = () => {
        return cart.reduce((total, item) => total + item.total_price, 0);
    };

    // إتمام الفاتورة
    const handleCheckout = () => {
        if (cart.length === 0) {
            alert('يجب إضافة منتجات للفاتورة');
            return;
        }

        if (!selectedCustomer) {
            alert('يجب اختيار عميل');
            return;
        }

        setData({
            ...data,
            customer_id: selectedCustomer.id,
            items: cart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                notes: item.notes
            }))
        });

        setShowPaymentModal(true);
    };

    const submitInvoice = () => {
        post(route('invoices.store'), {
            onSuccess: () => {
                alert('تم إنشاء الفاتورة بنجاح');
                setCart([]);
                setSelectedCustomer(null);
                setShowPaymentModal(false);
            }
        });
    };

    return (
        <RepresentativeLayout title="نقطة البيع">
            <Head title="نقطة البيع" />

            {/* Mobile Layout */}
            <div className="lg:hidden min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="px-4 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">نقطة البيع</h1>
                                <p className="text-gray-600 text-sm mt-1">نظام البيع المباشر</p>
                            </div>
                            <button
                                onClick={() => setShowCart(true)}
                                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 relative"
                            >
                                <FaShoppingCart />
                                ({cart.length})
                                {cart.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {cart.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-3">
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="البحث عن منتج أو باركود..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            <button
                                onClick={() => setSelectedCategory('')}
                                className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                                    selectedCategory === ''
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                جميع الفئات
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                                        selectedCategory === category
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Products Grid - Mobile */}
                <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAdd={() => addToCart(product)}
                                mobile={true}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex h-screen bg-gray-50">
                {/* Left Sidebar - Categories & Customer */}
                <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                    {/* Logo/Title */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <FaShoppingCart className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">نقطة البيع</h1>
                                <p className="text-xs text-gray-500">نظام البيع المباشر</p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Selection */}
                    <div className="p-4 border-b border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">العميل</label>
                        <select
                            value={selectedCustomer?.id || ''}
                            onChange={(e) => {
                                const customer = customers.find(c => c.id == e.target.value);
                                setSelectedCustomer(customer);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        >
                            <option value="">اختر العميل...</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Categories */}
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">الفئات</h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => setSelectedCategory('')}
                                className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                                    selectedCategory === ''
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                جميع الفئات ({products.length})
                            </button>
                            {categories.map(category => {
                                const count = products.filter(p => p.supplier_type?.name === category).length;
                                return (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                                            selectedCategory === category
                                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {category} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="p-4">
                        <div className="flex rounded-lg border border-gray-200 p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'grid'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <FaTh />
                                شبكة
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'list'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <FaList />
                                قائمة
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Top Search Bar */}
                    <div className="bg-white border-b border-gray-200 p-4">
                        <div className="relative">
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="البحث عن منتج بالاسم أو الباركود..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Products Area */}
                    <div className="flex-1 p-6 overflow-auto">
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAdd={() => addToCart(product)}
                                        mobile={false}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredProducts.map(product => (
                                    <ProductListItem
                                        key={product.id}
                                        product={product}
                                        onAdd={() => addToCart(product)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Cart */}
                <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
                    <CartSection
                        cart={cart}
                        selectedCustomer={selectedCustomer}
                        customers={customers}
                        onSelectCustomer={setSelectedCustomer}
                        onUpdateQuantity={updateCartQuantity}
                        onRemoveItem={removeFromCart}
                        onCheckout={handleCheckout}
                        onClearCart={() => setCart([])}
                        getTotalAmount={getTotalAmount}
                    />
                </div>
            </div>

            {/* Mobile Cart Modal */}
            {showCart && (
                <MobileCartModal
                    cart={cart}
                    selectedCustomer={selectedCustomer}
                    customers={customers}
                    onSelectCustomer={setSelectedCustomer}
                    onUpdateQuantity={updateCartQuantity}
                    onRemoveItem={removeFromCart}
                    onClose={() => setShowCart(false)}
                    onCheckout={handleCheckout}
                    onClearCart={() => setCart([])}
                    getTotalAmount={getTotalAmount}
                />
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    totalAmount={getTotalAmount()}
                    paidAmount={data.paid_amount}
                    setPaidAmount={(amount) => setData('paid_amount', amount)}
                    notes={data.notes}
                    setNotes={(notes) => setData('notes', notes)}
                    onSubmit={submitInvoice}
                    onClose={() => setShowPaymentModal(false)}
                    processing={processing}
                />
            )}
        </RepresentativeLayout>
    );
}

// مكون بطاقة المنتج
function ProductCard({ product, onAdd, mobile = false }) {
    const cartons = product.cartons_count;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="text-center">
                {/* صورة المنتج */}
                <div className="mb-3">
                    {product.image ? (
                        <img
                            src={`/storage/${product.image}`}
                            alt={product.name}
                            className={`mx-auto object-cover rounded-lg ${
                                mobile ? 'w-16 h-16' : 'w-20 h-20'
                            }`}
                            onError={(e) => {
                                e.target.src = '/images/default-product.png';
                            }}
                        />
                    ) : (
                        <div className={`mx-auto bg-gray-100 rounded-lg flex items-center justify-center ${
                            mobile ? 'w-16 h-16' : 'w-20 h-20'
                        }`}>
                            <FaBarcode className="text-gray-400 text-xl" />
                        </div>
                    )}
                </div>

                {/* اسم المنتج */}
                <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${
                    mobile ? 'text-xs' : 'text-sm'
                }`}>
                    {product.name}
                </h3>

                {/* السعر للكرتون */}
                <p className={`font-bold text-blue-600 mb-2 ${
                    mobile ? 'text-sm' : 'text-base'
                }`}>
                    {formatCurrency(product.selling_price)}/كرتون
                </p>

                {/* عدد الكراتين المتوفرة */}
                <p className={`mb-3 ${
                    cartons > 10
                        ? 'text-green-600'
                        : cartons > 0
                            ? 'text-yellow-600'
                            : 'text-red-600'
                } ${mobile ? 'text-xs' : 'text-sm'}`}>
                    {cartons > 0
                        ? `متوفر: ${cartons} كرتون`
                        : 'نفد المخزون'
                    }
                </p>

                {/* زر إضافة للسلة */}
                <button
                    onClick={onAdd}
                    disabled={cartons === 0}
                    className={`w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
                        mobile ? 'text-xs' : 'text-sm'
                    }`}
                >
                    إضافة كرتون للسلة
                </button>
            </div>
        </div>
    );
}

// مكون عرض المنتج كقائمة
function ProductListItem({ product, onAdd }) {
    const cartons = product.cartons_count;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
                {/* صورة المنتج */}
                <div className="flex-shrink-0">
                    {product.image ? (
                        <img
                            src={`/storage/${product.image}`}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                                e.target.src = '/images/default-product.png';
                            }}
                        />
                    ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FaBarcode className="text-gray-400 text-xl" />
                        </div>
                    )}
                </div>

                {/* معلومات المنتج */}
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">الباركود: {product.barcode}</p>
                    <p className="text-sm text-gray-600">الفئة: {product.supplier_type?.name || 'غير محدد'}</p>
                </div>

                {/* السعر والمخزون */}
                <div className="text-center">
                    <p className="text-lg font-bold text-blue-600 mb-1">
                        {formatCurrency(product.selling_price)}/كرتون
                    </p>
                    <p className={`text-sm mb-2 ${
                        cartons > 10
                            ? 'text-green-600'
                            : cartons > 0
                                ? 'text-yellow-600'
                                : 'text-red-600'
                    }`}>
                        {cartons > 0
                            ? `${cartons} كرتون`
                            : 'نفد المخزون'
                        }
                    </p>
                </div>

                {/* زر إضافة */}
                <div className="flex-shrink-0">
                    <button
                        onClick={onAdd}
                        disabled={cartons === 0}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        إضافة كرتون
                    </button>
                </div>
            </div>
        </div>
    );
}

// مكون السلة
function CartSection({ cart, selectedCustomer, customers, onSelectCustomer, onUpdateQuantity, onRemoveItem, onCheckout, onClearCart, getTotalAmount }) {
    return (
        <>
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FaShoppingCart />
                        سلة المشتريات
                    </h2>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                        {cart.length}
                    </span>
                </div>
            </div>

            {/* Customer Selection */}
            <div className="p-4 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">العميل</label>
                <select
                    value={selectedCustomer?.id || ''}
                    onChange={(e) => {
                        const customer = customers.find(c => c.id == e.target.value);
                        onSelectCustomer(customer);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                    <option value="">اختر العميل...</option>
                    {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                            {customer.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-auto p-4">
                {cart.length === 0 ? (
                    <div className="text-center py-8">
                        <FaShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">السلة فارغة</p>
                        <p className="text-sm text-gray-400 mt-2">ابدأ بإضافة المنتجات</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cart.map((item) => (
                            <div key={item.product_id} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-start gap-3">
                                    {/* صورة المنتج */}
                                    <div className="flex-shrink-0">
                                        {item.product_image ? (
                                            <img
                                                src={`/storage/${item.product_image}`}
                                                alt={item.product_name}
                                                className="w-12 h-12 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.target.src = '/images/default-product.png';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <FaBarcode className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                                            {item.product_name}
                                        </h4>
                                        <p className="text-xs text-gray-600 mb-2">
                                            {formatCurrency(item.unit_price)}/كرتون × {item.quantity} كرتون
                                        </p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                                                    className="w-6 h-6 rounded bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 text-sm"
                                                >
                                                    <FaMinus />
                                                </button>
                                                <span className="text-sm font-medium w-8 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                                                    className="w-6 h-6 rounded bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-600 text-sm"
                                                >
                                                    <FaPlus />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => onRemoveItem(item.product_id)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </div>

                                        <div className="text-right mt-2">
                                            <p className="font-bold text-blue-600 text-sm">
                                                {formatCurrency(item.total_price)}
                                            </p>
                                        </div>
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
                    <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-lg font-bold border-t pt-3">
                            <span>الإجمالي:</span>
                            <span className="text-green-600">{formatCurrency(getTotalAmount())}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={onCheckout}
                            disabled={!selectedCustomer}
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <FaMoneyBillWave className="inline-block mr-2" />
                            إتمام الشراء
                        </button>
                        <button
                            onClick={onClearCart}
                            className="w-full bg-red-100 text-red-800 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors font-medium"
                        >
                            <FaTrash className="inline-block mr-2" />
                            إفراغ السلة
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

// مكون سلة الجوال
function MobileCartModal({ cart, selectedCustomer, customers, onSelectCustomer, onUpdateQuantity, onRemoveItem, onClose, onCheckout, onClearCart, getTotalAmount }) {
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
            <div className="bg-white w-full max-h-[90vh] rounded-t-lg flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">سلة المشتريات</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Customer Selection */}
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">العميل</label>
                    <select
                        value={selectedCustomer?.id || ''}
                        onChange={(e) => {
                            const customer = customers.find(c => c.id == e.target.value);
                            onSelectCustomer(customer);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                        <option value="">اختر العميل...</option>
                        {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>
                                {customer.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Cart Content */}
                <div className="flex-1 overflow-auto p-4">
                    {cart.length === 0 ? (
                        <div className="text-center py-12">
                            <FaShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">السلة فارغة</h3>
                            <p className="text-gray-500 mb-6">ابدأ بإضافة المنتجات للسلة</p>
                            <button
                                onClick={onClose}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                تصفح المنتجات
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.product_id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        {/* صورة المنتج */}
                                        <div className="flex-shrink-0">
                                            {item.product_image ? (
                                                <img
                                                    src={`/storage/${item.product_image}`}
                                                    alt={item.product_name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                    onError={(e) => {
                                                        e.target.src = '/images/default-product.png';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <FaBarcode className="text-gray-400 text-xl" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {item.product_name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {formatCurrency(item.unit_price)}/كرتون × {item.quantity} كرتون
                                            </p>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                                                        className="w-9 h-9 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 font-bold"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-lg font-bold w-12 text-center bg-white px-2 py-1 rounded border">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                                                        className="w-9 h-9 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-600 font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-blue-600">
                                                        {formatCurrency(item.total_price)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => onRemoveItem(item.product_id)}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="flex justify-between text-xl font-bold text-green-600">
                                <span>الإجمالي:</span>
                                <span>{formatCurrency(getTotalAmount())}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClearCart}
                                className="flex-1 bg-red-100 text-red-800 py-3 px-4 rounded-lg hover:bg-red-200 transition-colors font-medium"
                            >
                                إفراغ السلة
                            </button>
                            <button
                                onClick={() => {
                                    onClose();
                                    onCheckout();
                                }}
                                disabled={!selectedCustomer}
                                className="flex-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-bold disabled:bg-gray-400"
                            >
                                إتمام الشراء
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// مكون نافذة الدفع
function PaymentModal({ totalAmount, paidAmount, setPaidAmount, notes, setNotes, onSubmit, onClose, processing }) {
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-6 text-center">تفاصيل الدفع</h3>

                    <div className="space-y-4">
                        {/* إجمالي الفاتورة */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-lg font-bold text-center">
                                إجمالي الفاتورة: {formatCurrency(totalAmount)}
                            </div>
                        </div>

                        {/* المبلغ المدفوع */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                المبلغ المدفوع (دينار عراقي)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max={totalAmount}
                                className="w-full p-3 border border-gray-300 rounded-lg text-lg"
                                value={paidAmount}
                                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        {/* المبلغ المتبقي */}
                        <div className="bg-yellow-50 p-3 rounded-lg">
                            <div className="text-center font-medium text-yellow-800">
                                المبلغ المتبقي: {formatCurrency(totalAmount - paidAmount)}
                            </div>
                        </div>

                        {/* ملاحظات */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ملاحظات (اختيارية)
                            </label>
                            <textarea
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                rows="3"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="أي ملاحظات إضافية..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={processing}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium disabled:bg-gray-400"
                        >
                            {processing ? 'جاري الإنشاء...' : 'إنشاء الفاتورة'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
