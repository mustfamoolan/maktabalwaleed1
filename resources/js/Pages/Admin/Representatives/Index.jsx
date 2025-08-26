import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ representatives = [] }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingRepresentative, setEditingRepresentative] = useState(null);
    const [selectedRepresentatives, setSelectedRepresentatives] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const { data, setData, post, put, reset, errors } = useForm({
        name: '',
        phone: '',
        password: '',
        address: '',
        status: 'active'
    });

    React.useEffect(() => {
        if (editingRepresentative) {
            setData({
                name: editingRepresentative.name || '',
                phone: editingRepresentative.phone || '',
                password: '', // كلمة مرور فارغة عند التعديل (لن تتغير إلا إذا أدخل المستخدم قيمة جديدة)
                address: editingRepresentative.address || '',
                status: editingRepresentative.status || 'active'
            });
        }
    }, [editingRepresentative]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingRepresentative) {
            put(route('admin.representatives.update', editingRepresentative.id), {
                onSuccess: () => {
                    reset();
                    setEditingRepresentative(null);
                    setShowCreateForm(false);
                }
            });
        } else {
            post(route('admin.representatives.store'), {
                onSuccess: () => {
                    reset();
                    setShowCreateForm(false);
                }
            });
        }
    };

    const handleCancel = () => {
        reset();
        setEditingRepresentative(null);
        setShowCreateForm(false);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRepresentatives(representatives.map(rep => rep.id));
        } else {
            setSelectedRepresentatives([]);
        }
    };

    const handleSelectRepresentative = (repId) => {
        if (selectedRepresentatives.includes(repId)) {
            setSelectedRepresentatives(selectedRepresentatives.filter(id => id !== repId));
        } else {
            setSelectedRepresentatives([...selectedRepresentatives, repId]);
        }
    };

    const filteredRepresentatives = representatives.filter(rep =>
        (rep.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rep.phone || '').includes(searchTerm)
    );

    const getInitials = (name) => {
        if (!name) return 'NN';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-screen-2xl mx-auto px-6 py-6">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">إدارة المندوبين</h1>
                                <p className="text-sm text-gray-600 mt-2">إجمالي {representatives.length} مندوب نشط في النظام</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => alert('تصدير البيانات')}
                                    className="flex items-center gap-2 px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-4-4m4 4l4-4m3-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    تصدير البيانات
                                </button>
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                    إضافة مندوب جديد
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm font-medium text-gray-600">إجمالي المندوبين</p>
                                    <p className="text-3xl font-bold text-gray-900">{representatives.length}</p>
                                    <p className="text-xs text-green-600 mt-1">+12% من الشهر الماضي</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-green-100 text-green-600">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm font-medium text-gray-600">المندوبين النشطين</p>
                                    <p className="text-3xl font-bold text-gray-900">{representatives.filter(rep => rep.status === 'active').length}</p>
                                    <p className="text-xs text-green-600 mt-1">معدل النشاط 94%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                    </svg>
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm font-medium text-gray-600">متوسط المبيعات</p>
                                    <p className="text-3xl font-bold text-gray-900">45.2K</p>
                                    <p className="text-xs text-yellow-600 mt-1">ر.س شهرياً</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                    </svg>
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm font-medium text-gray-600">معدل الإنجاز العام</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {representatives.length > 0
                                            ? Math.round(representatives.reduce((sum, rep) => sum + (rep.overall_achievement_percentage || 0), 0) / representatives.length)
                                            : 0}%
                                    </p>
                                    <p className="text-xs text-purple-600 mt-1">متوسط جميع الأهداف</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Filters and Search */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
                        <div className="p-6">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                                <div className="flex flex-col lg:flex-row gap-4 flex-1">
                                    <div className="relative flex-1 max-w-lg">
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="block w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="البحث عن المندوبين بالاسم أو رقم الهاتف أو القسم..."
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <select className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[140px] transition-all duration-200">
                                            <option>جميع الأقسام</option>
                                            <option>مبيعات</option>
                                            <option>تسويق</option>
                                            <option>دعم فني</option>
                                            <option>إدارة</option>
                                        </select>

                                        <select className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[140px] transition-all duration-200">
                                            <option>جميع المستويات</option>
                                            <option>مبتدئ</option>
                                            <option>متوسط</option>
                                            <option>متقدم</option>
                                            <option>خبير</option>
                                        </select>

                                        <select className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[140px] transition-all duration-200">
                                            <option>جميع الحالات</option>
                                            <option>نشط</option>
                                            <option>غير نشط</option>
                                            <option>معلق</option>
                                        </select>

                                        <button className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-300 rounded-xl transition-colors duration-200">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"></path>
                                            </svg>
                                            فلاتر متقدمة
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                                        <button className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors duration-200" title="عرض قائمة">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                            </svg>
                                        </button>
                                        <button className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-r border-gray-300 transition-colors duration-200" title="عرض بطاقات">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                    <button className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-300 rounded-xl transition-colors duration-200" title="تصدير">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                        </svg>
                                    </button>
                                    <button className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-300 rounded-xl transition-colors duration-200" title="طباعة">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modern Clean Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50/50">
                                    <tr className="border-b border-gray-100">
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center justify-end gap-2">
                                                <span>المندوب</span>
                                            </div>
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الهاتف
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            نسبة الإنجاز
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الحالة
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الإجراءات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {filteredRepresentatives.map((representative, index) => {
                                        const achievementPercentage = representative.overall_achievement_percentage || 0;
                                        const isActive = representative.is_active;
                                        return (
                                            <tr
                                                key={representative.id}
                                                className="hover:bg-gray-50/50 cursor-pointer transition-colors duration-150 border-b border-gray-50"
                                                onClick={() => window.location.href = `/admin/representatives/${representative.id}/profile`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                                                {getInitials(representative.name)}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {representative.name || 'غير محدد'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                ID: {representative.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {representative.phone || 'غير محدد'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {achievementPercentage}%
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {representative.total_targets_count || 0} هدف
                                                                </span>
                                                            </div>
                                                            <div className="w-20 bg-gray-200 rounded-full h-2.5">
                                                                <div
                                                                    className={`h-2.5 rounded-full transition-all duration-300 ${
                                                                        achievementPercentage >= 90 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                                                        achievementPercentage >= 75 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                                                        achievementPercentage >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                                                        achievementPercentage > 0 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                                                        'bg-gray-300'
                                                                    }`}
                                                                    style={{width: `${Math.min(achievementPercentage, 100)}%`}}
                                                                ></div>
                                                            </div>
                                                            {(representative.total_targets_count || 0) === 0 && (
                                                                <span className="text-xs text-gray-400 mt-1 block">لا توجد أهداف محددة</span>
                                                            )}
                                                        </div>
                                                        <div className={`p-1.5 rounded-full ${
                                                            achievementPercentage >= 90 ? 'bg-green-100' :
                                                            achievementPercentage >= 75 ? 'bg-blue-100' :
                                                            achievementPercentage >= 50 ? 'bg-yellow-100' :
                                                            achievementPercentage > 0 ? 'bg-red-100' : 'bg-gray-100'
                                                        }`}>
                                                            {achievementPercentage >= 90 ? (
                                                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            ) : achievementPercentage >= 50 ? (
                                                                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                            ) : achievementPercentage > 0 ? (
                                                                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        isActive
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {isActive ? 'نشط' : 'غير نشط'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.location.href = `/admin/representatives/${representative.id}/salary-plans`;
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150"
                                                            title="عرض التفاصيل"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingRepresentative(representative);
                                                                setShowCreateForm(true);
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-150"
                                                            title="تعديل"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm('هل أنت متأكد من حذف هذا المندوب؟')) {
                                                                    // Handle delete
                                                                }
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150"
                                                            title="حذف"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                            </svg>
                                                        </button>
                                                        <div className="relative">
                                                            <button
                                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-150"
                                                                title="المزيد"
                                                            >
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>                        {/* Modern Pagination */}
                        <div className="bg-white px-6 py-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-gray-500">
                                    <span>عرض </span>
                                    <span className="font-semibold text-gray-900 mx-1">1</span>
                                    <span>إلى </span>
                                    <span className="font-semibold text-gray-900 mx-1">{Math.min(10, filteredRepresentatives.length)}</span>
                                    <span>من </span>
                                    <span className="font-semibold text-gray-900 mx-1">{filteredRepresentatives.length}</span>
                                    <span>نتيجة</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-150">
                                        <span className="mr-1">السابق</span>
                                    </button>
                                    <div className="flex gap-1">
                                        <button className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-150">
                                            1
                                        </button>
                                        <button className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-150">
                                            2
                                        </button>
                                        <button className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-150">
                                            3
                                        </button>
                                    </div>
                                    <button className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-150">
                                        <span className="ml-1">التالي</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Create/Edit Form Modal */}
                    {showCreateForm && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {editingRepresentative ? 'تعديل المندوب' : 'إضافة مندوب جديد'}
                                        </h3>
                                        <button
                                            onClick={handleCancel}
                                            className="text-gray-400 hover:text-gray-600 p-1"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                placeholder="أدخل الاسم الكامل"
                                                required
                                            />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                                            <input
                                                type="text"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                placeholder="05xxxxxxxx"
                                                required
                                            />
                                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                كلمة المرور {editingRepresentative ? '(اتركها فارغة لعدم التغيير)' : ''}
                                            </label>
                                            <input
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                placeholder={editingRepresentative ? 'اتركها فارغة لعدم التغيير' : 'أدخل كلمة المرور'}
                                                required={!editingRepresentative}
                                            />
                                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                                            <textarea
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                                rows="3"
                                                placeholder="أدخل العنوان التفصيلي"
                                            />
                                            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">حالة المندوب</label>
                                            <select
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            >
                                                <option value="active">نشط</option>
                                                <option value="inactive">غير نشط</option>
                                            </select>
                                            {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                                        </div>

                                        <div className="flex justify-end space-x-3 space-x-reverse pt-6">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                                            >
                                                إلغاء
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                            >
                                                {editingRepresentative ? 'تحديث المندوب' : 'إضافة المندوب'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
