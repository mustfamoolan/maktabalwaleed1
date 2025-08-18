import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import RepresentativeLayout from '@/Layouts/RepresentativeLayout';
import { FaSave, FaTimes, FaUser, FaPhone, FaMapMarkerAlt, FaStickyNote } from 'react-icons/fa';

export default function CustomerCreate({ representative_user }) {
    const [formData, setFormData] = useState({
        customer_name: '',
        phone: '',
        address: '',
        governorate: '',
        city: '',
        nearest_landmark: '',
        total_debt: '',
        notes: ''
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // مسح الخطأ عند التعديل
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post('/representatives/customers', formData, {
            onSuccess: () => {
                // سيتم التوجيه تلقائياً بواسطة الكنترولر
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    };

    const governorates = [
        'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'الأنبار', 'دهوك',
        'كركوك', 'بابل', 'واسط', 'صلاح الدين', 'القادسية', 'ذي قار', 'المثنى',
        'ديالى', 'ميسان', 'السليمانية', 'حلبجة'
    ];

    return (
        <RepresentativeLayout>
            <Head title="إضافة عميل جديد - المندوبين" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">إضافة عميل جديد</h1>
                    <p className="text-gray-600">تسجيل عميل جديد في منطقتك</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* اسم العميل */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaUser className="inline ml-1" />
                                    اسم العميل *
                                </label>
                                <input
                                    type="text"
                                    name="customer_name"
                                    value={formData.customer_name}
                                    onChange={handleChange}
                                    placeholder="ادخل اسم العميل"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.customer_name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.customer_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
                                )}
                            </div>

                            {/* رقم الهاتف */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaPhone className="inline ml-1" />
                                    رقم الهاتف
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="07xxxxxxxxx"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                )}
                            </div>

                            {/* المحافظة */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaMapMarkerAlt className="inline ml-1" />
                                    المحافظة *
                                </label>
                                <select
                                    name="governorate"
                                    value={formData.governorate}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.governorate ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                >
                                    <option value="">اختر المحافظة</option>
                                    {governorates.map((gov, index) => (
                                        <option key={index} value={gov}>{gov}</option>
                                    ))}
                                </select>
                                {errors.governorate && (
                                    <p className="text-red-500 text-sm mt-1">{errors.governorate}</p>
                                )}
                            </div>

                            {/* المدينة */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المدينة *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="ادخل اسم المدينة"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.city ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.city && (
                                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                                )}
                            </div>

                            {/* أقرب نقطة دالة */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    أقرب نقطة دالة
                                </label>
                                <input
                                    type="text"
                                    name="nearest_landmark"
                                    value={formData.nearest_landmark}
                                    onChange={handleChange}
                                    placeholder="مثل: جامع، مدرسة، محطة"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.nearest_landmark ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.nearest_landmark && (
                                    <p className="text-red-500 text-sm mt-1">{errors.nearest_landmark}</p>
                                )}
                            </div>

                            {/* المديونية */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المديونية الحالية (دينار عراقي)
                                </label>
                                <input
                                    type="number"
                                    name="total_debt"
                                    value={formData.total_debt}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.total_debt ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.total_debt && (
                                    <p className="text-red-500 text-sm mt-1">{errors.total_debt}</p>
                                )}
                            </div>
                        </div>

                        {/* العنوان */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                العنوان التفصيلي *
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="ادخل العنوان التفصيلي للعميل"
                                rows={3}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.address ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.address && (
                                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                            )}
                        </div>

                        {/* ملاحظات */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaStickyNote className="inline ml-1" />
                                ملاحظات
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="أي ملاحظات إضافية حول العميل"
                                rows={3}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.notes ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.notes && (
                                <p className="text-red-500 text-sm mt-1">{errors.notes}</p>
                            )}
                        </div>

                        {/* أزرار الإجراءات */}
                        <div className="flex justify-end space-x-4 space-x-reverse border-t pt-6">
                            <button
                                type="button"
                                onClick={() => router.get('/representatives/customers')}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                            >
                                <FaTimes className="ml-2" />
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                            >
                                <FaSave className="ml-2" />
                                {processing ? 'جاري الحفظ...' : 'حفظ العميل'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </RepresentativeLayout>
    );
}
