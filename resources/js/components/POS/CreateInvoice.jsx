import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/utils/helpers';

export default function CreateInvoice({ representative, customers, products }) {
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cart, setCart] = useState([]);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        representative_id: representative.id,
        customer_id: '',
        items: [],
        paid_amount: 0,
        notes: ''
    });

    // إضافة منتج للسلة
    const addToCart = (product, cartons_quantity, carton_price) => {
        const existingItem = cart.find(item => item.product_id === product.id);

        if (existingItem) {
            setCart(cart.map(item =>
                item.product_id === product.id
                    ? { ...item, cartons_quantity: item.cartons_quantity + cartons_quantity }
                    : item
            ));
        } else {
            setCart([...cart, {
                product_id: product.id,
                product_name: product.name,
                cartons_quantity,
                carton_price,
                units_per_carton: product.units_per_carton,
                total_units: cartons_quantity * product.units_per_carton,
                total_price: cartons_quantity * carton_price
            }]);
        }

        setShowProductModal(false);
        setSelectedProduct(null);
    };

    // إزالة منتج من السلة
    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product_id !== productId));
    };

    // حساب إجمالي الفاتورة
    const getTotalAmount = () => {
        return cart.reduce((total, item) => total + item.total_price, 0);
    };

    // إرسال الفاتورة
    const handleSubmit = () => {
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
            items: cart
        });

        setShowPaymentModal(true);
    };

    const submitInvoice = () => {
        post(route('invoices.store'), {
            onSuccess: () => {
                alert('تم إنشاء الفاتورة بنجاح');
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="إنشاء فاتورة جديدة" />

            <div className="min-h-screen bg-gray-50 md:p-6">
                {/* Header - مُحسّن للهواتف */}
                <div className="bg-white shadow-sm border-b md:rounded-lg md:mb-6">
                    <div className="px-4 py-3">
                        <h1 className="text-lg font-bold text-gray-900">إنشاء فاتورة جديدة</h1>
                        <p className="text-sm text-gray-600">المندوب: {representative.name}</p>
                    </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                    {/* اختيار العميل */}
                    <div className="bg-white shadow-sm md:rounded-lg">
                        <div className="px-4 py-3 border-b">
                            <h2 className="text-md font-semibold text-gray-900">اختيار العميل</h2>
                        </div>
                        <div className="p-4">
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg text-base"
                                value={selectedCustomer?.id || ''}
                                onChange={(e) => {
                                    const customer = customers.find(c => c.id == e.target.value);
                                    setSelectedCustomer(customer);
                                }}
                            >
                                <option value="">اختر عميل...</option>
                                {customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name} - {customer.governorate}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* قائمة المنتجات */}
                    <div className="bg-white shadow-sm md:rounded-lg">
                        <div className="px-4 py-3 border-b flex justify-between items-center">
                            <h2 className="text-md font-semibold text-gray-900">المنتجات</h2>
                            <button
                                onClick={() => setShowProductModal(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                إضافة منتج
                            </button>
                        </div>

                        <div className="divide-y">
                            {cart.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    لم يتم إضافة أي منتجات بعد
                                </div>
                            ) : (
                                cart.map((item, index) => (
                                    <div key={index} className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                                                <div className="text-sm text-gray-600 mt-1 space-y-1">
                                                    <div>الكمية: {item.cartons_quantity} كرتون</div>
                                                    <div>القطع: {item.total_units} قطعة</div>
                                                    <div>سعر الكرتون: {formatCurrency(item.carton_price)}</div>
                                                </div>
                                            </div>
                                            <div className="text-left ml-4">
                                                <div className="text-lg font-bold text-green-600">
                                                    {formatCurrency(item.total_price)}
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.product_id)}
                                                    className="text-red-600 text-sm mt-1"
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* الإجمالي وأزرار العمليات */}
                    {cart.length > 0 && (
                        <div className="bg-white shadow-sm md:rounded-lg">
                            <div className="p-4 border-b">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">الإجمالي:</span>
                                    <span className="text-xl font-bold text-green-600">
                                        {formatCurrency(getTotalAmount())}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!selectedCustomer || cart.length === 0}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg text-lg font-medium disabled:bg-gray-400"
                                >
                                    إنشاء الفاتورة
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* نافذة إضافة منتج */}
                {showProductModal && (
                    <ProductModal
                        products={products}
                        selectedProduct={selectedProduct}
                        setSelectedProduct={setSelectedProduct}
                        onAdd={addToCart}
                        onClose={() => {
                            setShowProductModal(false);
                            setSelectedProduct(null);
                        }}
                    />
                )}

                {/* نافذة الدفع */}
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
            </div>
        </AuthenticatedLayout>
    );
}

// مكون نافذة إضافة منتج
function ProductModal({ products, selectedProduct, setSelectedProduct, onAdd, onClose }) {
    const [cartons_quantity, setCartonesQuantity] = useState(1);
    const [carton_price, setCartonPrice] = useState(0);

    useEffect(() => {
        if (selectedProduct) {
            setCartonPrice(selectedProduct.selling_price);
        }
    }, [selectedProduct]);

    const handleAdd = () => {
        if (!selectedProduct || cartons_quantity <= 0 || carton_price <= 0) {
            alert('يجب اختيار منتج وإدخال كمية وسعر صحيح');
            return;
        }

        onAdd(selectedProduct, cartons_quantity, carton_price);
        setCartonesQuantity(1);
        setCartonPrice(0);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end md:items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-t-lg md:rounded-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">إضافة منتج</h3>
                    <button onClick={onClose} className="text-gray-500 text-xl">×</button>
                </div>

                <div className="p-4 space-y-4">
                    {/* اختيار المنتج */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            اختيار المنتج
                        </label>
                        <select
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            value={selectedProduct?.id || ''}
                            onChange={(e) => {
                                const product = products.find(p => p.id == e.target.value);
                                setSelectedProduct(product);
                            }}
                        >
                            <option value="">اختر منتج...</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name} - {product.units_per_carton} قطعة/كرتون
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedProduct && (
                        <>
                            {/* معلومات المنتج */}
                            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                                <div>المخزون: {selectedProduct.stock_quantity} قطعة</div>
                                <div>قطعة/كرتون: {selectedProduct.units_per_carton}</div>
                                <div>سعر البيع المقترح: {formatCurrency(selectedProduct.selling_price)}</div>
                            </div>

                            {/* كمية الكراتين */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    عدد الكراتين
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                    value={cartons_quantity}
                                    onChange={(e) => setCartonesQuantity(parseInt(e.target.value) || 1)}
                                />
                                <div className="text-sm text-gray-600 mt-1">
                                    إجمالي القطع: {cartons_quantity * selectedProduct.units_per_carton}
                                </div>
                            </div>

                            {/* سعر الكرتون */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    سعر الكرتون (دينار عراقي)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                    value={carton_price}
                                    onChange={(e) => setCartonPrice(parseFloat(e.target.value) || 0)}
                                />
                            </div>

                            {/* الإجمالي */}
                            <div className="bg-green-50 p-3 rounded-lg">
                                <div className="text-lg font-semibold text-green-800">
                                    إجمالي السعر: {formatCurrency(cartons_quantity * carton_price)}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="sticky bottom-0 bg-white border-t p-4">
                    <button
                        onClick={handleAdd}
                        disabled={!selectedProduct}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:bg-gray-400"
                    >
                        إضافة للسلة
                    </button>
                </div>
            </div>
        </div>
    );
}

// مكون نافذة الدفع
function PaymentModal({ totalAmount, paidAmount, setPaidAmount, notes, setNotes, onSubmit, onClose, processing }) {
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end md:items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-t-lg md:rounded-lg">
                <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">تفاصيل الدفع</h3>
                    <button onClick={onClose} className="text-gray-500 text-xl">×</button>
                </div>

                <div className="p-4 space-y-4">
                    {/* إجمالي الفاتورة */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-lg font-semibold">
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
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                        />
                    </div>

                    {/* المبلغ المتبقي */}
                    <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="text-md font-medium text-yellow-800">
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

                <div className="sticky bottom-0 bg-white border-t p-4">
                    <button
                        onClick={onSubmit}
                        disabled={processing}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium disabled:bg-gray-400"
                    >
                        {processing ? 'جاري الإنشاء...' : 'إنشاء الفاتورة'}
                    </button>
                </div>
            </div>
        </div>
    );
}
