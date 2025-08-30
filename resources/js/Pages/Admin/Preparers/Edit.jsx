import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FaSave,
    FaTimes,
    FaUser,
    FaPhone,
    FaLock,
    FaMoneyBillWave,
    FaStickyNote,
    FaToggleOn,
    FaToggleOff,
    FaUserTie,
    FaArrowRight
} from 'react-icons/fa';

const Edit = ({ preparer }) => {
    const [formData, setFormData] = useState({
        name: preparer.name || '',
        phone: preparer.phone || '',
        password: '', // فارغ للأمان
        salary: preparer.salary || '',
        is_active: preparer.is_active ?? true,
        notes: preparer.notes || ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // إزالة كلمة المرور إذا كانت فارغة
        const submitData = { ...formData };
        if (!submitData.password) {
            delete submitData.password;
        }

        router.put(`/admin/preparers/${preparer.id}`, submitData, {
            onSuccess: () => {
                // سيتم التوجيه التلقائي إلى صفحة الفهرس
            },
            onError: (errors) => {
                setErrors(errors);
                setLoading(false);
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // مسح الخطأ عند التغيير
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    return (
        <AdminLayout title={`تعديل المجهز: ${preparer.name}`}>
            <Head title={`تعديل المجهز: ${preparer.name}`} />

            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <Link
                                    href="/admin/preparers"
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FaArrowRight className="w-4 h-4" />
                                </Link>
                                <div className="p-2 bg-yellow-500 rounded-lg">
                                    <FaUserTie className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">تعديل بيانات المجهز</h1>
                                    <p className="text-gray-600">{preparer.name} - ID: {preparer.id}</p>
                                </div>
                            </div>
                            <Link
                                href={`/admin/preparers/${preparer.id}`}
                                className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <FaTimes className="w-4 h-4 mr-2" />
                                إلغاء
                            </Link>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* اسم المجهز */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaUser className="inline w-4 h-4 ml-1" />
                                اسم المجهز *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="أدخل اسم المجهز الكامل"
                                required
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* رقم الهاتف */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaPhone className="inline w-4 h-4 ml-1" />
                                رقم الهاتف *
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                                    errors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="07XX XXX XXXX"
                                required
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                            )}
                        </div>

                        {/* كلمة المرور */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaLock className="inline w-4 h-4 ml-1" />
                                كلمة المرور الجديدة
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                                    errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="اتركه فارغاً إذا لم تريد تغيير كلمة المرور"
                                minLength="6"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                اترك هذا الحقل فارغاً إذا لم تريد تغيير كلمة المرور الحالية
                            </p>
                        </div>

                        {/* الراتب الأساسي */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaMoneyBillWave className="inline w-4 h-4 ml-1" />
                                الراتب الأساسي (د.ع)
                            </label>
                            <input
                                type="number"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                                    errors.salary ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                            />
                            {errors.salary && (
                                <p className="mt-1 text-sm text-red-600">{errors.salary}</p>
                            )}
                        </div>

                        {/* الحالة */}
                        <div>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className="relative">
                                    <div className={`block w-14 h-8 rounded-full transition-colors ${
                                        formData.is_active ? 'bg-green-500' : 'bg-gray-300'
                                    }`}></div>
                                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                                        formData.is_active ? 'transform translate-x-6' : ''
                                    }`}></div>
                                </div>
                                <span className="mr-3 text-sm font-medium text-gray-700">
                                    {formData.is_active ? (
                                        <>
                                            <FaToggleOn className="inline w-4 h-4 ml-1 text-green-500" />
                                            المجهز نشط
                                        </>
                                    ) : (
                                        <>
                                            <FaToggleOff className="inline w-4 h-4 ml-1 text-gray-400" />
                                            المجهز غير نشط
                                        </>
                                    )}
                                </span>
                            </label>
                        </div>

                        {/* ملاحظات */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaStickyNote className="inline w-4 h-4 ml-1" />
                                ملاحظات
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="3"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                                    errors.notes ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="أي ملاحظات إضافية عن المجهز..."
                            />
                            {errors.notes && (
                                <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                            )}
                        </div>

                        {/* أزرار الإجراءات */}
                        <div className="flex items-center justify-end space-x-3 space-x-reverse pt-6 border-t border-gray-200">
                            <Link
                                href={`/admin/preparers/${preparer.id}`}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                إلغاء
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        جاري التحديث...
                                    </>
                                ) : (
                                    <>
                                        <FaSave className="w-4 h-4 mr-2" />
                                        حفظ التغييرات
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Edit;
