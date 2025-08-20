import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import {
    X,
    Save,
    User,
    Phone,
    Lock,
    MapPin,
    Eye,
    EyeOff,
    Plus,
} from 'lucide-react';

export default function QuickAddRepresentativeForm({ isOpen, onClose, onSuccess }) {
    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);

    const { data, setData, errors, reset } = useForm({
        name_ar: '',
        phone: '',
        password: '',
        address: '',
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post(route('admin.sales-representatives.store'), {
            name_ar: data.name_ar,
            phone: data.phone,
            address: data.address,
            password: data.password,
            is_active: data.is_active,
            quick_add: true, // معرف الإضافة السريعة
        }, {
            onSuccess: (page) => {
                setProcessing(false);
                reset();
                onClose();
                toast.success('تم إضافة المندوب بنجاح! يمكنك الآن إكمال بياناته.');
                if (onSuccess) onSuccess();
            },
            onError: (errors) => {
                setProcessing(false);
                console.error('Validation errors:', errors);
                if (errors.name_ar) toast.error(errors.name_ar[0]);
                else if (errors.phone) toast.error(errors.phone[0]);
                else if (errors.password) toast.error(errors.password[0]);
                else toast.error('يرجى التحقق من البيانات المدخلة');
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-600" />
                        إضافة مندوب جديد
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* الاسم */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            اسم المندوب *
                        </label>
                        <div className="relative">
                            <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={data.name_ar}
                                onChange={(e) => setData('name_ar', e.target.value)}
                                className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.name_ar ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="أدخل اسم المندوب"
                                required
                            />
                        </div>
                        {errors.name_ar && (
                            <p className="mt-1 text-sm text-red-600">{errors.name_ar}</p>
                        )}
                    </div>

                    {/* رقم الهاتف */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            رقم الهاتف *
                        </label>
                        <div className="relative">
                            <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.phone ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="05xxxxxxxx"
                                required
                            />
                        </div>
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                        )}
                    </div>

                    {/* العنوان */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            العنوان
                        </label>
                        <div className="relative">
                            <MapPin className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                            <textarea
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                rows={3}
                                className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.address ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="أدخل عنوان المندوب"
                            />
                        </div>
                        {errors.address && (
                            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                        )}
                    </div>

                    {/* كلمة المرور */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            كلمة المرور *
                        </label>
                        <div className="relative">
                            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={`w-full pr-10 pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.password ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    {/* حالة النشاط */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_active" className="mr-3 block text-sm text-gray-900">
                            مندوب نشط
                        </label>
                    </div>

                    {/* ملاحظة */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-700">
                            <strong>ملاحظة:</strong> سيتم إضافة المندوب بالمعلومات الأساسية. يمكنك إكمال بقية التفاصيل (الراتب، الحوافز، المعلومات المالية) لاحقاً من خلال تعديل بيانات المندوب.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'جاري الحفظ...' : 'إضافة المندوب'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
