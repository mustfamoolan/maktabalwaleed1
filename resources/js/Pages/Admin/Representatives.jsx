import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Representatives({ representatives = [] }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedRepresentative, setSelectedRepresentative] = useState(null);

    const { data, setData, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        password: '',
        notes: '',
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedRepresentative) {
            router.put(`/admin/representatives/${selectedRepresentative.id}`, data, {
                onSuccess: () => {
                    setShowAddForm(false);
                    setSelectedRepresentative(null);
                    reset();
                },
                onError: (errors) => {
                    console.log('خطأ في التحديث:', errors);
                }
            });
        } else {
            router.post('/admin/representatives', data, {
                onSuccess: () => {
                    setShowAddForm(false);
                    reset();
                },
                onError: (errors) => {
                    console.log('خطأ في الإضافة:', errors);
                }
            });
        }
    };

    const handleEdit = (representative) => {
        setSelectedRepresentative(representative);
        setData({
            name: representative.name,
            phone: representative.phone,
            password: '', // لا نعرض كلمة المرور الحالية
            notes: representative.notes || '',
            is_active: representative.is_active,
        });
        setShowAddForm(true);
    };

    const handleDelete = (representative) => {
        if (confirm(`هل أنت متأكد من حذف المندوب ${representative.name}؟`)) {
            router.delete(`/admin/representatives/${representative.id}`);
        }
    };

    // بيانات تجريبية في حالة عدم وجود مندوبين
    const mockRepresentatives = [
        {
            id: 1,
            name: 'أحمد محمد',
            phone: '07701234567',
            is_active: true,
            notes: 'مندوب منطقة بغداد',
            created_at: '2024-01-15'
        },
        {
            id: 2,
            name: 'محمد علي',
            phone: '07801234567',
            is_active: true,
            notes: 'مندوب منطقة البصرة',
            created_at: '2024-01-10'
        },
    ];

    const displayRepresentatives = representatives.length > 0 ? representatives : mockRepresentatives;

    return (
        <AdminLayout>
            <Head title="إدارة المندوبين - المقر الرئيسي" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">إدارة المندوبين</h1>
                                    <p className="text-sm text-gray-600">إدارة فريق المبيعات والمندوبين</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddForm(true);
                                    setSelectedRepresentative(null);
                                    reset();
                                }}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg font-medium text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                            >
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                إضافة مندوب جديد
                            </button>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">إجمالي المندوبين</p>
                                        <p className="text-2xl font-bold text-gray-900">{displayRepresentatives.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">المندوبين النشطين</p>
                                        <p className="text-2xl font-bold text-gray-900">{displayRepresentatives.filter(rep => rep.is_active).length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">المندوبين غير النشطين</p>
                                        <p className="text-2xl font-bold text-gray-900">{displayRepresentatives.filter(rep => !rep.is_active).length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add/Edit Form */}
                {showAddForm && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                {selectedRepresentative ? 'تعديل المندوب' : 'إضافة مندوب جديد'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* اسم المندوب */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        اسم المندوب *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="اسم المندوب"
                                        required
                                    />
                                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                                </div>

                                {/* رقم الهاتف */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        رقم الهاتف *
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="07xxxxxxxxx"
                                        dir="ltr"
                                        maxLength="11"
                                        required
                                    />
                                    {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                                </div>

                                {/* كلمة المرور */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        كلمة المرور {selectedRepresentative ? '(اتركها فارغة إذا لم ترد التغيير)' : '*'}
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="كلمة المرور"
                                        required={!selectedRepresentative}
                                    />
                                    {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                                </div>

                                {/* الحالة */}
                                {selectedRepresentative && (
                                    <div>
                                        <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-2">
                                            حالة المندوب
                                        </label>
                                        <select
                                            id="is_active"
                                            value={data.is_active ? '1' : '0'}
                                            onChange={(e) => setData('is_active', e.target.value === '1')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="1">نشط</option>
                                            <option value="0">غير نشط</option>
                                        </select>
                                    </div>
                                )}

                                {/* الملاحظات */}
                                <div className="md:col-span-2">
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                        ملاحظات
                                    </label>
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="ملاحظات إضافية عن المندوب"
                                    />
                                    {errors.notes && <p className="text-red-600 text-sm mt-1">{errors.notes}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setSelectedRepresentative(null);
                                        reset();
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {processing ? 'جاري الحفظ...' : (selectedRepresentative ? 'تحديث' : 'حفظ')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Representatives Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">#</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">اسم المندوب</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">رقم الهاتف</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">الحالة</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">الملاحظات</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {displayRepresentatives.map((representative, index) => (
                                    <tr key={representative.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-200">{index + 1}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-l border-gray-200">{representative.name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-200 font-mono" dir="ltr">{representative.phone}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-200">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                representative.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {representative.is_active ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 border-l border-gray-200 max-w-xs">
                                            <div className="truncate" title={representative.notes}>
                                                {representative.notes || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2 space-x-reverse">
                                                <button
                                                    onClick={() => handleEdit(representative)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    تعديل
                                                </button>
                                                <Link
                                                    href={`/admin/representatives/${representative.id}/manage`}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    إدارة الراتب والأهداف
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(representative)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
