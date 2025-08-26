import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FaArrowLeft,
    FaPrint,
    FaEdit,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaUser,
    FaBox,
    FaMoneyBillWave,
    FaTruck,
    FaCalendarAlt,
    FaNotesMedical,
    FaCheckCircle,
    FaExclamationTriangle,
    FaClock
} from 'react-icons/fa';

const Show = ({ sale }) => {
    const [newStatus, setNewStatus] = useState(sale.status);
    const [statusNotes, setStatusNotes] = useState('');
    const [updating, setUpdating] = useState(false);

    // حالات الفواتير
    const statusOptions = [
        { value: 'created', label: 'تم إنشاؤها', color: 'gray' },
        { value: 'pending', label: 'في الانتظار', color: 'yellow' },
        { value: 'preparing', label: 'قيد التجهيز', color: 'blue' },
        { value: 'ready_for_delivery', label: 'جاهز للتسليم', color: 'purple' },
        { value: 'out_for_delivery', label: 'مع السائق', color: 'indigo' },
        { value: 'delivered', label: 'تم التسليم', color: 'green' },
        { value: 'awaiting_approval', label: 'في انتظار الموافقة', color: 'orange' },
        { value: 'completed', label: 'مكتمل', color: 'emerald' },
        { value: 'partial_return', label: 'إرجاع جزئي', color: 'red' },
        { value: 'full_return', label: 'إرجاع كامل', color: 'red' },
        { value: 'cancelled', label: 'ملغي', color: 'red' },
        { value: 'partial_cancelled', label: 'إلغاء جزئي', color: 'red' },
    ];

    // تحديث حالة الفاتورة
    const updateStatus = () => {
        if (newStatus === sale.status && !statusNotes) {
            alert('لم يتم تغيير أي شيء');
            return;
        }

        setUpdating(true);
        router.patch(`/admin/invoices/${sale.id}/status`, {
            status: newStatus,
            status_notes: statusNotes
        }, {
            onFinish: () => setUpdating(false),
            onSuccess: () => {
                alert('تم تحديث حالة الفاتورة بنجاح');
                setStatusNotes('');
            }
        });
    };

    // الحصول على لون الحالة
    const getStatusColor = (status) => {
        const statusObj = statusOptions.find(s => s.value === status);
        return statusObj?.color || 'gray';
    };

    // أيقونة الحالة
    const getStatusIcon = (status) => {
        switch (status) {
            case 'created': return <FaClock className="w-4 h-4" />;
            case 'pending': return <FaExclamationTriangle className="w-4 h-4" />;
            case 'preparing': return <FaEdit className="w-4 h-4" />;
            case 'ready_for_delivery':
            case 'out_for_delivery': return <FaTruck className="w-4 h-4" />;
            case 'delivered':
            case 'completed': return <FaCheckCircle className="w-4 h-4" />;
            default: return <FaClock className="w-4 h-4" />;
        }
    };

    return (
        <AdminLayout title={`فاتورة ${sale.sale_number}`}>
            <Head title={`فاتورة ${sale.sale_number}`} />

            <div className="space-y-6">
                {/* شريط التنقل */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/invoices"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
                        >
                            <FaArrowLeft className="w-4 h-4" />
                            العودة للفواتير
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">فاتورة {sale.sale_number}</h1>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(sale.status)}-100 text-${getStatusColor(sale.status)}-800`}>
                            {getStatusIcon(sale.status)}
                            {statusOptions.find(s => s.value === sale.status)?.label || sale.status}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href={`/admin/invoices/${sale.id}/print`}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <FaPrint className="w-4 h-4" />
                            طباعة
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* تفاصيل الفاتورة الرئيسية */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* معلومات أساسية */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات الفاتورة</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الفاتورة</label>
                                    <p className="text-lg font-semibold text-gray-900">{sale.sale_number}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البيع</label>
                                    <p className="text-gray-900">{new Date(sale.sale_date).toLocaleDateString('ar-SA')}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع البيع</label>
                                    <p className="text-gray-900">
                                        {sale.sale_type === 'customer' ? 'عميل' :
                                         sale.sale_type === 'representative' ? 'مندوب' : 'نقدي'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">حالة الدفع</label>
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        sale.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                        sale.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {sale.payment_status === 'paid' ? 'مدفوع كاملاً' :
                                         sale.payment_status === 'partial' ? 'دفع جزئي' : 'دين'}
                                    </span>
                                </div>
                            </div>

                            {/* المبالغ */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-3">ملخص المبالغ</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-600">المجموع الفرعي</label>
                                        <p className="font-semibold text-gray-900">{parseInt(sale.subtotal).toLocaleString()} د.ع</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600">الخصم</label>
                                        <p className="font-semibold text-red-600">{parseInt(sale.discount_amount).toLocaleString()} د.ع</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600">الإجمالي</label>
                                        <p className="font-bold text-blue-600">{parseInt(sale.total_amount).toLocaleString()} د.ع</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600">الربح</label>
                                        <p className="font-bold text-green-600">{parseInt(sale.total_profit).toLocaleString()} د.ع</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <label className="block text-xs text-gray-600">المبلغ المدفوع</label>
                                        <p className="font-semibold text-green-600">{parseInt(sale.paid_amount).toLocaleString()} د.ع</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600">المتبقي</label>
                                        <p className="font-semibold text-red-600">{parseInt(sale.remaining_amount).toLocaleString()} د.ع</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* تفاصيل المندوب */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaUser className="w-5 h-5 text-blue-600" />
                                تفاصيل المندوب
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المندوب</label>
                                    <p className="text-gray-900">{sale.seller_representative?.name || 'غير محدد'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                                    <p className="text-gray-900 flex items-center gap-2">
                                        <FaPhone className="w-4 h-4 text-gray-400" />
                                        {sale.seller_representative?.phone || 'غير محدد'}
                                    </p>
                                </div>
                                {sale.seller_representative?.email && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                                        <p className="text-gray-900 flex items-center gap-2">
                                            <FaEnvelope className="w-4 h-4 text-gray-400" />
                                            {sale.seller_representative.email}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* تفاصيل العميل */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaUser className="w-5 h-5 text-green-600" />
                                تفاصيل العميل
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل</label>
                                    <p className="text-gray-900">{sale.customer?.name || sale.customer_name || 'عميل حاضر'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                                    <p className="text-gray-900 flex items-center gap-2">
                                        <FaPhone className="w-4 h-4 text-gray-400" />
                                        {sale.customer?.phone || sale.customer_phone || 'غير محدد'}
                                    </p>
                                </div>
                                {sale.customer?.address && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                                        <p className="text-gray-900 flex items-center gap-2">
                                            <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                                            {sale.customer.address}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* أصناف الفاتورة */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaBox className="w-5 h-5 text-purple-600" />
                                أصناف الفاتورة ({sale.items?.length || 0})
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">سعر التكلفة</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">سعر البيع</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الخصم</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجمالي</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الربح</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {sale.items?.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {item.product?.image && (
                                                            <img
                                                                src={`/storage/${item.product.image}`}
                                                                alt={item.product.name_ar}
                                                                className="w-8 h-8 rounded object-cover"
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="font-medium text-gray-900">{item.product?.name_ar}</div>
                                                            <div className="text-xs text-gray-500">{item.product?.barcode}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
                                                <td className="px-4 py-3">{parseInt(item.unit_cost_price).toLocaleString()} د.ع</td>
                                                <td className="px-4 py-3">{parseInt(item.unit_sale_price).toLocaleString()} د.ع</td>
                                                <td className="px-4 py-3 text-red-600">{parseInt(item.unit_discount).toLocaleString()} د.ع</td>
                                                <td className="px-4 py-3 font-medium">
                                                    {parseInt((item.unit_sale_price - item.unit_discount) * item.quantity).toLocaleString()} د.ع
                                                </td>
                                                <td className="px-4 py-3 font-medium text-green-600">
                                                    {parseInt(item.profit_amount).toLocaleString()} د.ع
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* معلومات إضافية */}
                        {(sale.primary_supplier || sale.primary_category || sale.notes) && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات إضافية</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {sale.primary_supplier && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">المورد الرئيسي</label>
                                            <p className="text-gray-900">{sale.primary_supplier.name_ar}</p>
                                        </div>
                                    )}

                                    {sale.primary_category && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">القسم الرئيسي</label>
                                            <p className="text-gray-900">{sale.primary_category.name_ar}</p>
                                        </div>
                                    )}
                                </div>

                                {sale.notes && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{sale.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* الشريط الجانبي */}
                    <div className="space-y-6">
                        {/* تحديث حالة الفاتورة */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaEdit className="w-5 h-5 text-blue-600" />
                                تحديث الحالة
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الحالة الجديدة</label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات (اختياري)</label>
                                    <textarea
                                        value={statusNotes}
                                        onChange={(e) => setStatusNotes(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="أدخل ملاحظات حول تحديث الحالة..."
                                    />
                                </div>

                                <button
                                    onClick={updateStatus}
                                    disabled={updating}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {updating ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <FaEdit className="w-4 h-4" />
                                    )}
                                    {updating ? 'جاري التحديث...' : 'تحديث الحالة'}
                                </button>
                            </div>
                        </div>

                        {/* التتبع الزمني */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaCalendarAlt className="w-5 h-5 text-green-600" />
                                التتبع الزمني
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-600">تاريخ الإنشاء</label>
                                    <p className="text-sm text-gray-900">{new Date(sale.created_at).toLocaleString('ar-SA')}</p>
                                </div>

                                {sale.sent_at && (
                                    <div>
                                        <label className="block text-xs text-gray-600">تاريخ الإرسال</label>
                                        <p className="text-sm text-gray-900">{new Date(sale.sent_at).toLocaleString('ar-SA')}</p>
                                    </div>
                                )}

                                {sale.prepared_at && (
                                    <div>
                                        <label className="block text-xs text-gray-600">تاريخ التجهيز</label>
                                        <p className="text-sm text-gray-900">{new Date(sale.prepared_at).toLocaleString('ar-SA')}</p>
                                    </div>
                                )}

                                {sale.delivered_at && (
                                    <div>
                                        <label className="block text-xs text-gray-600">تاريخ التسليم</label>
                                        <p className="text-sm text-gray-900">{new Date(sale.delivered_at).toLocaleString('ar-SA')}</p>
                                    </div>
                                )}

                                {sale.approved_at && (
                                    <div>
                                        <label className="block text-xs text-gray-600">تاريخ الاعتماد</label>
                                        <p className="text-sm text-gray-900">{new Date(sale.approved_at).toLocaleString('ar-SA')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* معلومات الدين */}
                        {sale.debt && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaMoneyBillWave className="w-5 h-5 text-red-600" />
                                    معلومات الدين
                                </h3>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-600">المبلغ الأصلي</label>
                                        <p className="text-sm font-medium text-gray-900">{parseInt(sale.debt.original_amount).toLocaleString()} د.ع</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-gray-600">المبلغ المتبقي</label>
                                        <p className="text-sm font-medium text-red-600">{parseInt(sale.debt.remaining_amount).toLocaleString()} د.ع</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-gray-600">تاريخ الاستحقاق</label>
                                        <p className="text-sm text-gray-900">{new Date(sale.debt.due_date).toLocaleDateString('ar-SA')}</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-gray-600">حالة الدين</label>
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                            sale.debt.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {sale.debt.status === 'active' ? 'نشط' : 'مسدد'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Show;
