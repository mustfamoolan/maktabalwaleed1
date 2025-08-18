import React, { useState } from 'react';
import { Head } from '@inertiajs/react';

export default function OrderConfirmation() {
    const [orderStatus, setOrderStatus] = useState('pending'); // pending, approved, rejected
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sample order data - this would come from QR code scanning
    const [orderData] = useState({
        orderNumber: 'ORD-2025-0810-001',
        invoiceNumber: '231',
        companyName: 'شركة التجارة الالكترونية المتقدمة',
        companyLogo: 'https://homed.team/wp-content/uploads/2024/09/Untitle222222d-1.png',
        invoiceDate: '04-02-2024',
        dueDate: '18-02-2024',
        clientName: 'ABC Company',
        items: [
            {
                id: 1,
                name: 'هاتف ذكي سامسونج جالاكسي S24',
                quantity: 1
            },
            {
                id: 2,
                name: 'سماعات لاسلكية ابل إيربودز',
                quantity: 2
            },
            {
                id: 3,
                name: 'حافظة هاتف جلدية فاخرة',
                quantity: 1
            },
            {
                id: 4,
                name: 'شاحن لاسلكي سريع',
                quantity: 1
            },
            {
                id: 5,
                name: 'لابتوب ديل انسبايرون 15',
                quantity: 1
            },
            {
                id: 6,
                name: 'ماوس لاسلكي لوجيتك',
                quantity: 3
            },
            {
                id: 7,
                name: 'كيبورد ميكانيكي',
                quantity: 1
            },
            {
                id: 8,
                name: 'شاشة كمبيوتر 24 بوصة',
                quantity: 2
            },
            {
                id: 9,
                name: 'كاميرا كانون EOS',
                quantity: 1
            },
            {
                id: 10,
                name: 'طابعة HP ليزر',
                quantity: 1
            },
            {
                id: 11,
                name: 'تابلت آيباد برو',
                quantity: 1
            },
            {
                id: 12,
                name: 'ساعة ذكية ابل واتش',
                quantity: 2
            },
            {
                id: 13,
                name: 'سبيكر بلوتوث JBL',
                quantity: 1
            },
            {
                id: 14,
                name: 'هارد ديسك خارجي 1TB',
                quantity: 2
            },
            {
                id: 15,
                name: 'كابل USB-C سريع',
                quantity: 5
            },
            {
                id: 16,
                name: 'حامل هاتف للسيارة',
                quantity: 3
            },
            {
                id: 17,
                name: 'بطارية محمولة 20000mAh',
                quantity: 1
            },
            {
                id: 18,
                name: 'ميكروفون لاسلكي',
                quantity: 2
            },
            {
                id: 19,
                name: 'مصباح LED ذكي',
                quantity: 4
            },
            {
                id: 20,
                name: 'راوتر واي فاي TP-Link',
                quantity: 1
            }
        ]
    });

    // Handle order confirmation
    const handleOrderConfirmation = async (status) => {
        if (status === 'rejected' && !notes.trim()) {
            alert('يجب كتابة سبب الرفض في الملاحظات');
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            setOrderStatus(status);

            // Here you would make the actual API call
            console.log('Order confirmation:', {
                orderNumber: orderData.orderNumber,
                status: status,
                notes: notes,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error confirming order:', error);
            alert('حدث خطأ أثناء تأكيد الطلب. حاول مرة أخرى.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head title="تأكيد الطلب - العملاء" />

            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

                    {/* Header */}
                    <div className="bg-white px-6 py-6 border-b border-gray-100">
                        <div className="text-center">
                            <h1 className="text-xl font-bold text-gray-900">{orderData.companyName}</h1>
                            <p className="text-gray-500 text-sm">#{orderData.invoiceNumber}</p>
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="px-6 py-4 space-y-4">

                        {/* Date Section */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-xs font-medium text-gray-500 mb-1">تاريخ الفاتورة</p>
                                <p className="text-sm font-bold text-gray-900">{orderData.invoiceDate}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-xs font-medium text-gray-500 mb-1">تاريخ الاستحقاق</p>
                                <p className="text-sm font-bold text-gray-900">{orderData.dueDate}</p>
                            </div>
                        </div>

                        {/* Client Section */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-medium text-gray-500 mb-1">العميل</p>
                            <p className="text-sm font-bold text-gray-900">{orderData.clientName}</p>
                        </div>

                        {/* Items Header */}
                        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600 border-b border-gray-100 pb-2">
                            <div className="col-span-6 text-right">المنتج</div>
                            <div className="col-span-3 text-center">الكمية</div>
                            <div className="col-span-3 text-center">المجموع</div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-2">
                            {orderData.items.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-12 gap-2 items-center py-2">
                                    <div className="col-span-6">
                                        <h4 className="font-medium text-gray-900 text-sm leading-tight">
                                            {item.name}
                                        </h4>
                                    </div>
                                    <div className="col-span-3 text-center">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                                            {item.quantity}
                                        </span>
                                    </div>
                                    <div className="col-span-3 text-center">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {item.quantity} قطعة
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary Section */}
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <div className="bg-gray-100 rounded-xl p-4 flex justify-between items-center">
                                <span className="text-base font-bold text-gray-900">إجمالي العناصر</span>
                                <span className="text-lg font-bold text-gray-900">
                                    {orderData.items.reduce((sum, item) => sum + item.quantity, 0)} قطعة
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Confirmation Section */}
                    {orderStatus === 'pending' && (
                        <div className="px-6 py-6 border-t border-gray-100">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">تأكيد الطلب</h3>
                                <p className="text-gray-600 text-sm">راجع التفاصيل واتخذ قرارك</p>
                            </div>

                            {/* Notes Section */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span>ملاحظات</span>
                                        <span className="text-red-500">*</span>
                                    </div>
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none text-sm bg-white transition-all duration-200"
                                    placeholder="اكتب أي ملاحظات على الطلب (مطلوب عند الرفض)"
                                />
                                <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1 space-x-reverse">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>الملاحظات مطلوبة عند رفض الطلب</span>
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={() => handleOrderConfirmation('approved')}
                                    disabled={isSubmitting}
                                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>جارٍ الإرسال...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            <span>تأكيد الاستلام</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleOrderConfirmation('rejected')}
                                    disabled={isSubmitting}
                                    className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>جارٍ المعالجة...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6l-2 2 2 2m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>رفض الاستلام</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Confirmation Result */}
                    {orderStatus !== 'pending' && (
                        <div className="px-6 py-6 border-t border-gray-100">
                            {orderStatus === 'approved' ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">تم الموافقة! 🎉</h3>
                                    <p className="text-gray-600 text-sm mb-4"></p>
                                    <div className="bg-green-50 rounded-xl p-4 mb-4">
                                        <p className="text-xs text-green-600 font-medium mb-1">وقت الموافقة</p>
                                        <p className="text-sm font-bold text-green-800">{new Date().toLocaleString('ar-IQ')}</p>
                                    </div>
                                    {/* شكر العميل */}
                                    <div className="bg-blue-50 rounded-xl p-4 mt-2">
                                        <p className="text-base font-bold text-blue-800 mb-2">شكراً جزيلاً لثقتكم بنا وشرائكم من متجرنا!</p>
                                        <p className="text-sm text-blue-700">نتمنى أن تكون تجربتكم معنا مميزة ونرحب بكم دائماً.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">تم الرفض</h3>
                                    <p className="text-gray-600 text-sm mb-4">لم تتم الموافقة على الطلب</p>
                                    {notes && (
                                        <div className="bg-red-50 rounded-xl p-4">
                                            <p className="text-xs text-red-600 font-medium mb-2">السبب:</p>
                                            <p className="text-sm text-red-800 font-medium text-right">{notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
