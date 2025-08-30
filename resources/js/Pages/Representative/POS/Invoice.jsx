import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import RepresentativeLayout from '@/Layouts/RepresentativeLayout';
import {
    FaShoppingCart,
    FaUser,
    FaSave,
    FaExclamationTriangle,
    FaCheckCircle,
    FaArrowLeft
} from 'react-icons/fa';

const Invoice = ({ cart = [], customers, representatives }) => {
    // حالة العميل والدفع
    const [saleType, setSaleType] = useState('customer'); // فقط عميل
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    // حالة الحسابات
    const [paidAmount, setPaidAmount] = useState(0);
    const [notes, setNotes] = useState('');
    const [dueDate, setDueDate] = useState('');

    // حالة التحميل والأخطاء
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // حساب المجاميع
    const calculateTotals = () => {
        const subtotal = cart.reduce((sum, item) => {
            const itemTotal = item.quantity * item.unit_sale_price;
            return sum + itemTotal;
        }, 0);

        const total = subtotal;
        const remaining = total - paidAmount;

        // حساب الوزن الكلي
        const totalWeight = cart.reduce((sum, item) => {
            const pieceWeight = parseFloat(item.product?.piece_weight_grams) || 0; // وزن القطعة بالغرام
            const piecesPerCarton = parseFloat(item.product?.pieces_per_carton) || 1; // عدد القطع في الكارتون
            const quantitySold = parseFloat(item.quantity) || 0; // عدد الكراتين المباعة

            // الوزن = عدد الكراتين × عدد القطع في الكارتون × وزن القطعة الواحدة
            const itemWeight = quantitySold * piecesPerCarton * pieceWeight;
            return sum + itemWeight;
        }, 0);

        return {
            subtotal: subtotal,
            total: total,
            remaining: remaining,
            totalWeightGrams: totalWeight, // بالغرام
            totalWeightKg: totalWeight / 1000, // بالكيلو
            profit: cart.reduce((sum, item) => {
                const itemProfit = (item.unit_sale_price - (item.product.purchase_price || 0)) * item.quantity;
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
            newErrors.cart = 'لا توجد منتجات في السلة';
        }

        if (!selectedCustomer) {
            newErrors.customer = 'يجب اختيار عميل';
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

        try {
            const saleData = {
                sale_type: 'customer',
                customer_name: null,
                customer_phone: null,
                customer_id: selectedCustomer?.id,
                representative_id: null,
                subtotal: totals.subtotal,
                discount_amount: 0,
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
                    unit_discount: 0,
                    total_price: item.unit_sale_price * item.quantity
                }))
            };

            router.post('/representatives/pos', saleData, {
                onSuccess: (data) => {
                    const weightMessage = totals.totalWeightGrams > 0
                        ? `\nالوزن الكلي: ${totals.totalWeightGrams.toLocaleString()} غرام${totals.totalWeightKg >= 1 ? ` (${totals.totalWeightKg.toFixed(2)} كغ)` : ''}`
                        : '';

                    alert(`تم إنجاز البيع بنجاح! الفاتورة الآن في حالة الانتظار${weightMessage}`);
                    // العودة إلى صفحة نقطة البيع مباشرة
                    router.visit('/representatives/pos');
                },
                onError: (errors) => {
                    console.error('خطأ في البيع:', errors);
                    setErrors(errors || { general: 'فشل في إنجاز البيع' });
                },
                onFinish: () => {
                    setLoading(false);
                }
            });

        } catch (error) {
            console.error('خطأ في الشبكة:', error);
            alert('خطأ في الاتصال بالخادم');
            setLoading(false);
        }
    };

    // العودة للخلف
    const goBack = () => {
        router.visit('/representatives/pos');
    };    return (
        <RepresentativeLayout title="فاتورة البيع">
            <Head title="فاتورة البيع" />

            <div className="space-y-3">
                {/* شريط التنقل المبسط */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
                        >
                            <FaArrowLeft className="w-4 h-4" />
                            العودة
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">فاتورة البيع</h1>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <FaShoppingCart className="w-5 h-5" />
                        <span className="text-sm font-medium">{cart.length} منتج</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* قسم تفاصيل الفاتورة */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-3 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">تفاصيل الفاتورة</h3>
                        </div>

                        <div className="p-3">
                            {/* عرض المنتجات */}
                            <div className="space-y-2 mb-3">
                                <h4 className="font-semibold text-gray-900 text-sm">المنتجات:</h4>
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="font-medium text-gray-900 text-sm">{item.product.name}</div>
                                            <div className="text-xs text-gray-600">
                                                {item.quantity} × {item.unit_sale_price} د.ع
                                            </div>
                                            {/* معلومات الكارتون والوزن */}
                                            <div className="text-xs text-green-600 mt-1">
                                                {parseFloat(item.product?.pieces_per_carton) > 0 && (
                                                    <span className="mr-2">
                                                        🧩 {item.product.pieces_per_carton} قطعة/كارتون
                                                    </span>
                                                )}
                                                {parseFloat(item.product?.piece_weight_grams) > 0 && (
                                                    <span>
                                                        ⚖️ {item.product.piece_weight_grams} غ/قطعة
                                                    </span>
                                                )}
                                            </div>
                                            {/* وزن هذا المنتج */}
                                            {parseFloat(item.product?.piece_weight_grams) > 0 && (
                                                <div className="text-xs text-purple-600">
                                                    الوزن الكلي: {(parseFloat(item.quantity) * (parseFloat(item.product.pieces_per_carton) || 1) * parseFloat(item.product.piece_weight_grams)).toLocaleString()} غرام
                                                    {(parseFloat(item.quantity) * (parseFloat(item.product.pieces_per_carton) || 1) * parseFloat(item.product.piece_weight_grams)) >= 1000 && (
                                                        <span className="ml-1">
                                                            ({((parseFloat(item.quantity) * (parseFloat(item.product.pieces_per_carton) || 1) * parseFloat(item.product.piece_weight_grams)) / 1000).toFixed(2)} كغ)
                                                        </span>
                                                    )}
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        ({item.quantity} كارتون × {item.product.pieces_per_carton || 1} قطعة × {item.product.piece_weight_grams} غ)
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="font-semibold text-gray-900 text-sm">
                                            {(item.unit_sale_price * item.quantity).toFixed(2)} د.ع
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* عرض الوزن الكلي للفاتورة */}
                            <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <h4 className="font-semibold text-purple-900 text-sm mb-2 flex items-center gap-2">
                                    ⚖️ الوزن الكلي للفاتورة
                                </h4>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-700">
                                        {totals.totalWeightGrams > 0 ? totals.totalWeightGrams.toLocaleString() : '0'} غرام
                                    </div>
                                    {totals.totalWeightKg >= 1 && (
                                        <div className="text-lg text-purple-600 mt-1">
                                            ({totals.totalWeightKg.toFixed(2)} كيلو غرام)
                                        </div>
                                    )}
                                    {totals.totalWeightGrams === 0 && (
                                        <div className="text-sm text-gray-500 mt-1">
                                            (لا توجد بيانات وزن للمنتجات)
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* المجاميع */}
                            <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                                <div className="flex justify-between text-sm">
                                    <span>المجموع الفرعي:</span>
                                    <span className="font-semibold">{totals.subtotal.toFixed(2)} د.ع</span>
                                </div>
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>الربح المتوقع:</span>
                                    <span className="font-semibold">{totals.profit.toFixed(2)} د.ع</span>
                                </div>
                                <div className="flex justify-between text-base font-bold border-t pt-1 mt-1">
                                    <span>الإجمالي:</span>
                                    <span className="text-blue-600">{totals.total.toFixed(2)} د.ع</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* قسم معلومات العميل والدفع */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-3 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">معلومات العميل والدفع</h3>
                        </div>

                        <div className="p-3 space-y-3">
                            {/* اختيار العميل */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">العميل</label>
                                <select
                                    value={selectedCustomer?.id || ''}
                                    onChange={(e) => {
                                        const customer = customers.find(c => c.id == e.target.value);
                                        setSelectedCustomer(customer);
                                    }}
                                    className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                        errors.customer ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">اختر عميل</option>
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name} {customer.phone && `- ${customer.phone}`}
                                        </option>
                                    ))}
                                </select>
                                {errors.customer && <p className="text-red-500 text-xs mt-1">{errors.customer}</p>}
                            </div>

                            {/* المبلغ المدفوع */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">المبلغ المدفوع</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                                    className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                        errors.paidAmount ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="0.00"
                                />
                                {errors.paidAmount && <p className="text-red-500 text-xs mt-1">{errors.paidAmount}</p>}
                            </div>

                            {/* المتبقي */}
                            <div className={`flex justify-between text-sm p-2 rounded-lg ${
                                totals.remaining > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                            }`}>
                                <span>المتبقي:</span>
                                <span className="font-semibold">{totals.remaining.toFixed(2)} د.ع</span>
                            </div>

                            {/* تاريخ الاستحقاق للدين */}
                            {totals.remaining > 0 && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">تاريخ الاستحقاق</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                            errors.dueDate ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
                                </div>
                            )}

                            {/* الملاحظات */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">ملاحظات</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="ملاحظات إضافية..."
                                />
                            </div>

                            {/* حالة الدفع */}
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                                {getPaymentStatus() === 'paid' && (
                                    <>
                                        <FaCheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="text-sm text-green-700 font-medium">دفع كامل</span>
                                    </>
                                )}
                                {getPaymentStatus() === 'partial' && (
                                    <>
                                        <FaExclamationTriangle className="w-4 h-4 text-yellow-500" />
                                        <span className="text-sm text-yellow-700 font-medium">دفع جزئي</span>
                                    </>
                                )}
                                {getPaymentStatus() === 'debt' && (
                                    <>
                                        <FaExclamationTriangle className="w-4 h-4 text-red-500" />
                                        <span className="text-sm text-red-700 font-medium">دين كامل</span>
                                    </>
                                )}
                            </div>

                            {/* أزرار الإجراءات */}
                            <div className="flex gap-2 pt-3">
                                <button
                                    onClick={completeSale}
                                    disabled={loading || cart.length === 0}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <FaSave className="w-4 h-4" />
                                    )}
                                    إنجاز البيع
                                </button>
                                <button
                                    onClick={goBack}
                                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                                >
                                    إلغاء
                                </button>
                            </div>

                            {/* عرض الأخطاء */}
                            {Object.keys(errors).length > 0 && (
                                <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="text-red-700 text-xs">
                                        {Object.values(errors).map((error, index) => (
                                            <div key={index}>• {error}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </RepresentativeLayout>
    );
};

export default Invoice;
