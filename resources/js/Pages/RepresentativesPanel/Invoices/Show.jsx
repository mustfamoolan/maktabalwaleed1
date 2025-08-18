import React from 'react';
import { Head, Link } from '@inertiajs/react';
import RepresentativeLayout from '@/Layouts/RepresentativeLayout';
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function InvoiceShow({ invoice }) {
    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { label: 'قيد الانتظار', class: 'bg-yellow-100 text-yellow-800' },
            'preparing': { label: 'قيد التجهيز', class: 'bg-blue-100 text-blue-800' },
            'shipping': { label: 'قيد التوصيل', class: 'bg-indigo-100 text-indigo-800' },
            'delivered': { label: 'تم التسليم', class: 'bg-green-100 text-green-800' },
            'returned': { label: 'مسترجع', class: 'bg-orange-100 text-orange-800' },
            'cancelled': { label: 'ملغية', class: 'bg-red-100 text-red-800' }
        };

        const config = statusConfig[status] || { label: status, class: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
                {config.label}
            </span>
        );
    };

    return (
        <RepresentativeLayout title={`فاتورة ${invoice.invoice_number}`}>
            <Head title={`فاتورة ${invoice.invoice_number}`} />

            <div className="space-y-6">
                {/* رأس الصفحة */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                فاتورة رقم: {invoice.invoice_number}
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                تاريخ الإصدار: {formatDate(invoice.invoice_date)}
                            </p>
                        </div>
                        <div className="flex items-center space-x-3 space-x-reverse">
                            {getStatusBadge(invoice.status)}
                            <Link
                                href="/representatives/invoices"
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                العودة للفواتير
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* معلومات العميل */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات العميل</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">اسم العميل</label>
                                <p className="text-gray-900">
                                    {invoice.customer ? invoice.customer.customer_name : 'عميل محذوف'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">المحافظة</label>
                                <p className="text-gray-900">
                                    {invoice.customer ? invoice.customer.governorate : '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
                                <p className="text-gray-900">
                                    {invoice.customer ? invoice.customer.phone : '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">العنوان</label>
                                <p className="text-gray-900">
                                    {invoice.customer ? invoice.customer.address : '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* معلومات المندوب */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات المندوب</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">اسم المندوب</label>
                                <p className="text-gray-900">
                                    {invoice.representative ? invoice.representative.name : '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
                                <p className="text-gray-900">
                                    {invoice.representative ? invoice.representative.phone : '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ملخص الفاتورة */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">ملخص الفاتورة</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">المجموع الفرعي:</span>
                                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">الخصم:</span>
                                <span className="font-medium text-red-600">
                                    -{formatCurrency(invoice.discount_amount || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">الضريبة:</span>
                                <span className="font-medium">{formatCurrency(invoice.tax_amount || 0)}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between">
                                <span className="text-lg font-bold text-gray-900">الإجمالي:</span>
                                <span className="text-lg font-bold text-green-600">
                                    {formatCurrency(invoice.total_amount)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">المدفوع:</span>
                                <span className="font-medium text-green-600">
                                    {formatCurrency(invoice.paid_amount)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">المتبقي:</span>
                                <span className="font-medium text-red-600">
                                    {formatCurrency(invoice.remaining_amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* تفاصيل المنتجات */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">تفاصيل المنتجات</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        المنتج
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الكمية (كارتون)
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        السعر
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الإجمالي
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {invoice.items?.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {item.product ? item.product.product_name : 'منتج محذوف'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                كود: {item.product ? item.product.product_code : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.quantity} كارتون
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(item.unit_price)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatCurrency(item.total_price)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ملاحظات */}
                {invoice.notes && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">ملاحظات</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
                    </div>
                )}
            </div>
        </RepresentativeLayout>
    );
}
