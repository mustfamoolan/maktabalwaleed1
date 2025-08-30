import React from 'react';
import { Head } from '@inertiajs/react';
import RepresentativeLayout from '@/Layouts/RepresentativeLayout';
import {
    FaArrowLeft,
    FaWeight,
    FaBox,
    FaCalculator,
    FaUser,
    FaCalendar,
    FaMoneyBill
} from 'react-icons/fa';

const SaleDetails = ({ sale }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatWeight = (grams) => {
        if (!grams || grams === 0) return '0 غرام';

        if (grams >= 1000) {
            return `${grams.toLocaleString()} غرام (${(grams / 1000).toFixed(2)} كغ)`;
        }
        return `${grams.toLocaleString()} غرام`;
    };

    const goBack = () => {
        window.history.back();
    };

    return (
        <RepresentativeLayout title="تفاصيل الفاتورة">
            <Head title="تفاصيل الفاتورة" />

            <div className="space-y-6">
                {/* شريط التنقل */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
                        >
                            <FaArrowLeft className="w-4 h-4" />
                            العودة
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">تفاصيل الفاتورة</h1>
                    </div>
                    <div className="text-sm text-gray-600">
                        رقم الفاتورة: {sale.sale_number || sale.id}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* معلومات الفاتورة الأساسية */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* بيانات العميل والبيع */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaUser className="w-5 h-5 text-blue-600" />
                                معلومات البيع
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع البيع</label>
                                    <div className="text-sm text-gray-900">
                                        {sale.sale_type === 'customer' ? 'عميل' :
                                         sale.sale_type === 'representative' ? 'مندوب' : 'نقدي'}
                                    </div>
                                </div>

                                {sale.customer && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">العميل</label>
                                        <div className="text-sm text-gray-900">{sale.customer.name}</div>
                                        {sale.customer.phone && (
                                            <div className="text-xs text-gray-600">{sale.customer.phone}</div>
                                        )}
                                    </div>
                                )}

                                {sale.customer_name && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل</label>
                                        <div className="text-sm text-gray-900">{sale.customer_name}</div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البيع</label>
                                    <div className="text-sm text-gray-900 flex items-center gap-1">
                                        <FaCalendar className="w-3 h-3" />
                                        {formatDate(sale.sale_date)}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">حالة الدفع</label>
                                    <div className={`text-sm font-medium ${
                                        sale.payment_status === 'paid' ? 'text-green-600' :
                                        sale.payment_status === 'partial' ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                        {sale.payment_status === 'paid' ? 'مدفوع' :
                                         sale.payment_status === 'partial' ? 'مدفوع جزئياً' : 'دين'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* المنتجات المباعة */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaBox className="w-5 h-5 text-green-600" />
                                المنتجات المباعة
                            </h3>

                            <div className="space-y-4">
                                {sale.items.map((item, index) => (
                                    <div key={index} className="border border-gray-100 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{item.product.name_ar}</h4>
                                                <div className="text-sm text-gray-600">
                                                    الكمية: {item.quantity} × {item.unit_sale_price} د.ع
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-gray-900">
                                                    {(item.quantity * item.unit_sale_price).toFixed(2)} د.ع
                                                </div>
                                            </div>
                                        </div>

                                        {/* معلومات الوزن */}
                                        {item.item_total_weight_grams > 0 && (
                                            <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                <div className="text-sm">
                                                    <div className="font-medium text-purple-900 mb-1">تفاصيل الوزن:</div>
                                                    <div className="text-purple-700">
                                                        {item.quantity} كارتون × {item.pieces_per_carton} قطعة × {item.piece_weight_grams} غ =
                                                        <span className="font-semibold ml-2">
                                                            {formatWeight(item.item_total_weight_grams)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* الملخص والوزن */}
                    <div className="space-y-6">
                        {/* ملخص الوزن الكلي */}
                        {sale.total_weight_grams > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaWeight className="w-5 h-5 text-purple-600" />
                                    الوزن الكلي
                                </h3>

                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-700 mb-2">
                                        {sale.total_weight_grams.toLocaleString()} غرام
                                    </div>
                                    {sale.total_weight_kg >= 1 && (
                                        <div className="text-lg text-purple-600">
                                            ({sale.total_weight_kg.toFixed(2)} كيلو غرام)
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ملخص المبالغ */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaMoneyBill className="w-5 h-5 text-green-600" />
                                ملخص المبالغ
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>المجموع الفرعي:</span>
                                    <span className="font-semibold">{sale.subtotal?.toFixed(2) || sale.total_amount.toFixed(2)} د.ع</span>
                                </div>

                                {sale.discount_amount > 0 && (
                                    <div className="flex justify-between text-sm text-red-600">
                                        <span>الخصم:</span>
                                        <span className="font-semibold">-{sale.discount_amount.toFixed(2)} د.ع</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>الإجمالي:</span>
                                    <span className="text-blue-600">{sale.total_amount.toFixed(2)} د.ع</span>
                                </div>

                                <div className="flex justify-between text-sm text-green-600">
                                    <span>المدفوع:</span>
                                    <span className="font-semibold">{sale.paid_amount.toFixed(2)} د.ع</span>
                                </div>

                                {sale.remaining_amount > 0 && (
                                    <div className="flex justify-between text-sm text-red-600">
                                        <span>المتبقي:</span>
                                        <span className="font-semibold">{sale.remaining_amount.toFixed(2)} د.ع</span>
                                    </div>
                                )}

                                {sale.total_profit > 0 && (
                                    <div className="flex justify-between text-sm text-purple-600 border-t pt-2">
                                        <span>الربح المتوقع:</span>
                                        <span className="font-semibold">{sale.total_profit.toFixed(2)} د.ع</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ملاحظات */}
                        {sale.notes && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">ملاحظات</h3>
                                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                    {sale.notes}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RepresentativeLayout>
    );
};

export default SaleDetails;
