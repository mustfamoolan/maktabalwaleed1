import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PreparerLayout from '../../../Layouts/PreparerLayout';
import { FaArrowRight, FaBoxOpen, FaUser, FaPhone, FaDollarSign, FaListUl, FaCheckCircle, FaClock } from 'react-icons/fa';

export default function ShowCompletedInvoice({ invoice }) {
    // بيانات تجريبية إذا لم تتوفر من السيرفر
    // تجهيز البيانات الحقيقية أو التجريبية
    let data;
    if (invoice && invoice.items && invoice.items.length > 0) {
        data = {
            sale_number: invoice.sale_number,
            customer_name: invoice.customer_name || (invoice.customer && invoice.customer.name),
            customer_phone: invoice.customer_phone || (invoice.customer && invoice.customer.phone),
            total_amount: invoice.total_amount,
            created_at: invoice.created_at,
            completed_at: invoice.completed_at,
            items: invoice.items.map((item) => ({
                id: item.id,
                name: item.product ? (item.product.name_ar || item.product.name_en || item.product.name || item.name) : item.name,
                quantity: item.quantity,
                unit: item.product ? (item.product.unit_ar || item.product.unit || '') : (item.unit || ''),
                image: item.product ? (item.product.image_url || item.product.image) : null
            })),
            seller_representative: invoice.sellerRepresentative || invoice.seller_representative,
            primary_supplier: invoice.primarySupplier || invoice.primary_supplier,
            items_count: invoice.items_count,
            status: invoice.status,
            delivery_status: invoice.delivery_status,
        };
    } else {
        data = {
            sale_number: 'INV-2025-001',
            customer_name: 'أحمد محمد علي',
            customer_phone: '07701234567',
            total_amount: 250000,
            created_at: '2025-08-29T10:30:00',
            completed_at: '2025-08-29T11:00:00',
            items: [
                { id: 1, name: 'منتج 1', quantity: 2, unit: 'قطعة', price: 10000 },
                { id: 2, name: 'منتج 2', quantity: 1, unit: 'كرتون', price: 50000 },
                { id: 3, name: 'منتج 3', quantity: 5, unit: 'قطعة', price: 2000 },
            ],
            seller_representative: { name: 'محمد الأحمد', phone: '07809876543' },
            primary_supplier: { name_ar: 'مورد المواد الغذائية' },
            items_count: 8,
            status: 'completed',
            delivery_status: 'تم التسليم',
        };
    }

    // حساب الوزن الكلي للفاتورة
    const totalWeightGrams = data.items.reduce((sum, item) => {
        // محاولة جلب الوزن من المنتج
        const product = invoice && invoice.items && invoice.items.find(i => i.id === item.id)?.product;
        const pieceWeight = parseFloat(product?.piece_weight_grams) || 0;
        const piecesPerCarton = parseFloat(product?.pieces_per_carton) || 1;
        const quantitySold = parseFloat(item.quantity) || 0;
        return sum + (quantitySold * piecesPerCarton * pieceWeight);
    }, 0);
    const totalWeightKg = totalWeightGrams / 1000;

    return (
        <PreparerLayout title={`تفاصيل الفاتورة ${data.sale_number}`}>
            <Head title={`تفاصيل الفاتورة ${data.sale_number}`} />
            <div className="max-w-md mx-auto p-2 sm:p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <Link href="/preparer/invoices/completed" className="text-green-600 flex items-center text-sm">
                        <FaArrowRight className="ml-1" /> رجوع
                    </Link>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{data.delivery_status || 'مكتمل'}</span>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-2">
                    <div className="flex items-center space-x-2 space-x-reverse mb-2">
                        <FaListUl className="w-5 h-5 text-green-500" />
                        <span className="font-bold text-lg">{data.sale_number}</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse text-sm">
                        <FaUser className="w-4 h-4 text-gray-400" />
                        <span>{data.customer_name}</span>
                        <FaPhone className="w-4 h-4 text-gray-400 ml-2" />
                        <span>{data.customer_phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse text-sm">
                        <FaDollarSign className="w-4 h-4 text-gray-400" />
                        <span>{parseInt(data.total_amount).toLocaleString('en-US')} IQD</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500">
                        <FaClock className="w-4 h-4 text-gray-400" />
                        <span>تم التجهيز: {new Date(data.completed_at).toLocaleString('en-US', {
                            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}</span>
                    </div>
                </div>

                {/* المنتجات */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center mb-3">
                        <FaBoxOpen className="w-5 h-5 text-green-500 ml-2" />
                        <span className="font-bold">المنتجات ({data.items.length})</span>
                    </div>
                    <ul className="divide-y divide-gray-100">
                        {data.items.map((item) => (
                            <li key={item.id} className="py-2 flex items-center justify-between">
                                <div className="flex items-center">
                                    <img
                                        src={
                                            item.image
                                                ? item.image.startsWith('http')
                                                    ? item.image
                                                    : `/storage/${item.image}`
                                                : '/images/no-product-image.png'
                                        }
                                        alt={item.name}
                                        className="w-10 h-10 object-cover rounded ml-2 border"
                                        onError={e => { e.target.src = '/images/no-product-image.png'; }}
                                    />
                                    <span className="font-medium">{item.name}</span>
                                    <span className="mx-2 text-xs text-gray-500">({item.unit})</span>
                                </div>
                                <div className="text-sm text-gray-700 font-bold">
                                    {item.quantity}
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* الوزن الكلي للفاتورة */}
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
                        <div className="font-semibold text-purple-900 mb-1">الوزن الكلي للفاتورة</div>
                        <div className="text-2xl font-bold text-purple-700">
                            {totalWeightGrams > 0 ? totalWeightGrams.toLocaleString() : '0'} غرام
                        </div>
                        {totalWeightKg >= 1 && (
                            <div className="text-lg text-purple-600 mt-1">
                                ({totalWeightKg.toFixed(2)} كيلو غرام)
                            </div>
                        )}
                        {totalWeightGrams === 0 && (
                            <div className="text-sm text-gray-500 mt-1">
                                (لا توجد بيانات وزن للمنتجات)
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PreparerLayout>
    );
}
