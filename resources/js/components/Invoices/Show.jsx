import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function InvoiceShow({ invoice }) {
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(invoice.paid_amount);

    const statusOptions = [
        { value: 'pending', label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'preparing', label: 'قيد التجهيز', color: 'bg-blue-100 text-blue-800' },
        { value: 'shipping', label: 'قيد التوصيل', color: 'bg-indigo-100 text-indigo-800' },
        { value: 'delivered', label: 'تم التسليم', color: 'bg-green-100 text-green-800' },
        { value: 'returned', label: 'مسترجع', color: 'bg-orange-100 text-orange-800' },
        { value: 'cancelled', label: 'ملغية', color: 'bg-red-100 text-red-800' }
    ];

    const getCurrentStatusConfig = () => {
        return statusOptions.find(option => option.value === invoice.status) ||
               { label: invoice.status, color: 'bg-gray-100 text-gray-800' };
    };

    const updateStatus = (newStatus) => {
        if (confirm('هل أنت متأكد من تغيير حالة الفاتورة؟')) {
            setIsUpdatingStatus(true);
            router.patch(route('invoices.updateStatus', invoice.id), {
                status: newStatus
            }, {
                onFinish: () => setIsUpdatingStatus(false)
            });
        }
    };

    const updatePayment = () => {
        if (paymentAmount > invoice.total_amount) {
            alert('المبلغ المدفوع لا يمكن أن يكون أكبر من إجمالي الفاتورة');
            return;
        }

        setIsUpdatingPayment(true);
        router.patch(route('invoices.updatePayment', invoice.id), {
            paid_amount: paymentAmount
        }, {
            onFinish: () => setIsUpdatingPayment(false)
        });
    };

    const printInvoice = () => {
        window.open(route('invoices.print', invoice.id), '_blank');
    };

    return (
        <AuthenticatedLayout>
            <Head title={`فاتورة رقم ${invoice.invoice_number}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* رأس الصفحة */}
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                فاتورة رقم {invoice.invoice_number}
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                تاريخ الإنشاء: {formatDate(invoice.invoice_date)}
                            </p>
                        </div>
                        <div className="flex space-x-3 space-x-reverse">
                            <Link
                                href={route('invoices.index')}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
                            >
                                رجوع للقائمة
                            </Link>
                            <button
                                onClick={printInvoice}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                            >
                                طباعة
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* معلومات الفاتورة الأساسية */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* بيانات العميل والمندوب */}
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b">
                                    <h3 className="text-lg font-medium text-gray-900">معلومات الفاتورة</h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">بيانات العميل</h4>
                                            <div className="text-sm space-y-2">
                                                <div><span className="font-medium">الاسم:</span> {invoice.customer.name}</div>
                                                <div><span className="font-medium">الهاتف:</span> {invoice.customer.phone}</div>
                                                <div><span className="font-medium">المحافظة:</span> {invoice.customer.governorate}</div>
                                                <div><span className="font-medium">المدينة:</span> {invoice.customer.city}</div>
                                                {invoice.customer.landmark && (
                                                    <div><span className="font-medium">علامة مميزة:</span> {invoice.customer.landmark}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">بيانات المندوب</h4>
                                            <div className="text-sm space-y-2">
                                                <div><span className="font-medium">الاسم:</span> {invoice.representative.name}</div>
                                                <div><span className="font-medium">الهاتف:</span> {invoice.representative.phone}</div>
                                                <div><span className="font-medium">المنطقة:</span> {invoice.representative.area}</div>
                                            </div>
                                        </div>
                                    </div>
                                    {invoice.notes && (
                                        <div className="mt-6 pt-6 border-t">
                                            <h4 className="font-medium text-gray-900 mb-2">ملاحظات</h4>
                                            <p className="text-sm text-gray-600">{invoice.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* عناصر الفاتورة */}
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b">
                                    <h3 className="text-lg font-medium text-gray-900">عناصر الفاتورة</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                    المنتج
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                    عدد الكراتين
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                    قطعة/كرتون
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                    إجمالي القطع
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                    سعر الكرتون
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                    الإجمالي
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {invoice.items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.product.name}
                                                        </div>
                                                        {item.notes && (
                                                            <div className="text-sm text-gray-500">
                                                                {item.notes}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.cartons_quantity}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.units_per_carton}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {item.total_units}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(item.carton_price)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                        {formatCurrency(item.total_price)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-sm font-medium text-gray-900 text-left">
                                                    الإجمالي الكلي:
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-green-600">
                                                    {formatCurrency(invoice.total_amount)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* الشريط الجانبي */}
                        <div className="space-y-6">
                            {/* الحالة الحالية وإدارة الحالة */}
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b">
                                    <h3 className="text-lg font-medium text-gray-900">حالة الفاتورة</h3>
                                </div>
                                <div className="p-6">
                                    <div className="mb-4">
                                        <span className={`px-3 py-2 rounded-full text-sm font-medium ${getCurrentStatusConfig().color}`}>
                                            {getCurrentStatusConfig().label}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {invoice.status === 'pending' && (
                                            <button
                                                onClick={() => updateStatus('preparing')}
                                                disabled={isUpdatingStatus}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                                            >
                                                بدء التجهيز
                                            </button>
                                        )}

                                        {invoice.status === 'preparing' && (
                                            <button
                                                onClick={() => updateStatus('shipping')}
                                                disabled={isUpdatingStatus}
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                                            >
                                                شحن الطلب
                                            </button>
                                        )}

                                        {invoice.status === 'shipping' && (
                                            <button
                                                onClick={() => updateStatus('delivered')}
                                                disabled={isUpdatingStatus}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                                            >
                                                تأكيد التسليم
                                            </button>
                                        )}

                                        {['pending', 'preparing'].includes(invoice.status) && (
                                            <button
                                                onClick={() => updateStatus('cancelled')}
                                                disabled={isUpdatingStatus}
                                                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                                            >
                                                إلغاء الفاتورة
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* معلومات المدفوعات */}
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b">
                                    <h3 className="text-lg font-medium text-gray-900">المدفوعات</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">إجمالي الفاتورة:</span>
                                        <span className="text-sm font-medium">{formatCurrency(invoice.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">المبلغ المدفوع:</span>
                                        <span className="text-sm font-medium text-green-600">{formatCurrency(invoice.paid_amount)}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2">
                                        <span className="text-sm font-medium">المبلغ المتبقي:</span>
                                        <span className={`text-sm font-bold ${invoice.remaining_amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(invoice.remaining_amount)}
                                        </span>
                                    </div>

                                    {/* تحديث المدفوعات */}
                                    <div className="mt-6 pt-4 border-t">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            تحديث المبلغ المدفوع
                                        </label>
                                        <div className="flex space-x-2 space-x-reverse">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max={invoice.total_amount}
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                                                className="flex-1 border-gray-300 rounded-lg text-sm"
                                            />
                                            <button
                                                onClick={updatePayment}
                                                disabled={isUpdatingPayment || paymentAmount === invoice.paid_amount}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                                            >
                                                تحديث
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* معلومات إضافية */}
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b">
                                    <h3 className="text-lg font-medium text-gray-900">معلومات إضافية</h3>
                                </div>
                                <div className="p-6 space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">تاريخ التسليم المتوقع:</span>
                                        <span>{invoice.delivery_date ? formatDate(invoice.delivery_date) : 'غير محدد'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">حالة الطباعة:</span>
                                        <span className={invoice.is_printed ? 'text-green-600' : 'text-red-600'}>
                                            {invoice.is_printed ? 'تم طباعتها' : 'لم تُطبع بعد'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">عدد الأصناف:</span>
                                        <span>{invoice.items.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">إجمالي القطع:</span>
                                        <span>{invoice.items.reduce((total, item) => total + item.total_units, 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
