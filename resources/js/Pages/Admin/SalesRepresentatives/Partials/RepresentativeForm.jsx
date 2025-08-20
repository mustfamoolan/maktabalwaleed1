import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import {
    X,
    Save,
    User,
    Mail,
    Phone,
    Lock,
    MapPin,
    Calendar,
    DollarSign,
    Target,
    CreditCard,
    Star,
    AlertCircle,
    Eye,
    EyeOff,
} from 'lucide-react';

export default function RepresentativeForm({ representative, incentivePlans, isOpen, onClose }) {
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name_ar: representative?.name_ar || '',
        name_en: representative?.name_en || '',
        email: representative?.email || '',
        phone: representative?.phone || '',
        password: '',
        national_id: representative?.national_id || '',
        address: representative?.address || '',
        city: representative?.city || '',
        hire_date: representative?.hire_date || '',
        birth_date: representative?.birth_date || '',
        base_salary: representative?.base_salary || '',
        incentive_plan: representative?.incentive_plan || 'fixed_commission',
        incentive_settings: representative?.incentive_settings || '',
        monthly_target: representative?.monthly_target || '',
        quarterly_target: representative?.quarterly_target || '',
        annual_target: representative?.annual_target || '',
        bank_account: representative?.bank_account || '',
        bank_name: representative?.bank_name || '',
        iban: representative?.iban || '',
        is_active: representative?.is_active ?? true,
        notes: representative?.notes || '',
        incentive_plans: representative?.incentive_plans?.map(plan => plan.id) || [],
    });

    const tabs = [
        { id: 'basic', name: 'المعلومات الأساسية', icon: User },
        { id: 'targets', name: 'الأهداف والحوافز', icon: Target },
        { id: 'financial', name: 'المعلومات المالية', icon: CreditCard },
        { id: 'additional', name: 'معلومات إضافية', icon: Star },
    ];

    useEffect(() => {
        if (representative && isOpen) {
            // إعادة تحميل البيانات عند تغيير المندوب
            setData({
                name_ar: representative.name_ar || '',
                name_en: representative.name_en || '',
                email: representative.email || '',
                phone: representative.phone || '',
                password: '',
                national_id: representative.national_id || '',
                address: representative.address || '',
                city: representative.city || '',
                hire_date: representative.hire_date || '',
                birth_date: representative.birth_date || '',
                base_salary: representative.base_salary || '',
                incentive_plan: representative.incentive_plan || 'fixed_commission',
                incentive_settings: representative.incentive_settings || '',
                monthly_target: representative.monthly_target || '',
                quarterly_target: representative.quarterly_target || '',
                annual_target: representative.annual_target || '',
                bank_account: representative.bank_account || '',
                bank_name: representative.bank_name || '',
                iban: representative.iban || '',
                is_active: representative.is_active ?? true,
                notes: representative.notes || '',
                incentive_plans: representative.incentive_plans?.map(plan => plan.id) || [],
            });
        } else if (!representative && isOpen) {
            // مسح البيانات عند إضافة مندوب جديد
            reset();
            setData({
                ...data,
                incentive_plan: 'fixed_commission',
                is_active: true,
            });
        }
    }, [representative, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const url = representative
            ? route('admin.sales-representatives.update', representative.id)
            : route('admin.sales-representatives.store');

        const method = representative ? 'put' : 'post';

        const submitData = { ...data };

        // إزالة كلمة المرور إذا كانت فارغة في التحديث
        if (representative && !submitData.password) {
            delete submitData.password;
        }

        router[method](url, submitData, {
            onSuccess: () => {
                toast.success(representative ? 'تم تحديث المندوب بنجاح' : 'تم إضافة المندوب بنجاح');
                onClose();
                reset();
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError || 'حدث خطأ أثناء الحفظ');
            },
        });
    };

    const generateDefaultSettings = (planType) => {
        switch (planType) {
            case 'fixed_commission':
                return JSON.stringify({ commission_rate: 5.0 }, null, 2);
            case 'tiered_commission':
                return JSON.stringify({
                    tiers: [
                        { min_amount: 0, max_amount: 100000, commission_rate: 3.0 },
                        { min_amount: 100001, max_amount: 500000, commission_rate: 5.0 },
                        { min_amount: 500001, max_amount: null, commission_rate: 7.0 },
                    ]
                }, null, 2);
            case 'target_bonus':
                return JSON.stringify({
                    base_commission_rate: 3.0,
                    bonus_commission_rate: 2.0,
                    achievement_threshold: 100
                }, null, 2);
            default:
                return '';
        }
    };

    const handleIncentivePlanChange = (value) => {
        setData('incentive_plan', value);
        if (!data.incentive_settings || data.incentive_settings.trim() === '') {
            setData('incentive_settings', generateDefaultSettings(value));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {representative ? 'تعديل المندوب' : 'إضافة مندوب جديد'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 space-x-reverse px-6">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* المعلومات الأساسية */}
                        {activeTab === 'basic' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            الاسم بالعربية *
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
                                                placeholder="أدخل الاسم بالعربية"
                                                required
                                            />
                                        </div>
                                        {errors.name_ar && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name_ar}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            الاسم بالإنجليزية
                                        </label>
                                        <div className="relative">
                                            <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                value={data.name_en}
                                                onChange={(e) => setData('name_en', e.target.value)}
                                                className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    errors.name_en ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="أدخل الاسم بالإنجليزية"
                                            />
                                        </div>
                                        {errors.name_en && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name_en}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            البريد الإلكتروني
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    errors.email ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="example@example.com"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>

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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {representative ? 'كلمة المرور الجديدة' : 'كلمة المرور *'}
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
                                                required={!representative}
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
                                        {representative && (
                                            <p className="mt-1 text-sm text-gray-500">اتركه فارغاً إذا كنت لا تريد تغيير كلمة المرور</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            رقم الهوية *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.national_id}
                                            onChange={(e) => setData('national_id', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.national_id ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="1234567890"
                                            required
                                        />
                                        {errors.national_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.national_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            تاريخ التوظيف *
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="date"
                                                value={data.hire_date}
                                                onChange={(e) => setData('hire_date', e.target.value)}
                                                className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    errors.hire_date ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                required
                                            />
                                        </div>
                                        {errors.hire_date && (
                                            <p className="mt-1 text-sm text-red-600">{errors.hire_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            تاريخ الميلاد
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="date"
                                                value={data.birth_date}
                                                onChange={(e) => setData('birth_date', e.target.value)}
                                                className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    errors.birth_date ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            />
                                        </div>
                                        {errors.birth_date && (
                                            <p className="mt-1 text-sm text-red-600">{errors.birth_date}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                placeholder="أدخل العنوان التفصيلي"
                                            />
                                        </div>
                                        {errors.address && (
                                            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            المدينة
                                        </label>
                                        <input
                                            type="text"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.city ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="الرياض، جدة، الدمام..."
                                        />
                                        {errors.city && (
                                            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                                        )}
                                    </div>
                                </div>

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
                            </div>
                        )}

                        {/* الأهداف والحوافز */}
                        {activeTab === 'targets' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            الهدف الشهري *
                                        </label>
                                        <div className="relative">
                                            <Target className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="number"
                                                value={data.monthly_target}
                                                onChange={(e) => setData('monthly_target', e.target.value)}
                                                className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    errors.monthly_target ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="50000"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        {errors.monthly_target && (
                                            <p className="mt-1 text-sm text-red-600">{errors.monthly_target}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            الهدف الربع سنوي *
                                        </label>
                                        <div className="relative">
                                            <Target className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="number"
                                                value={data.quarterly_target}
                                                onChange={(e) => setData('quarterly_target', e.target.value)}
                                                className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    errors.quarterly_target ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="150000"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        {errors.quarterly_target && (
                                            <p className="mt-1 text-sm text-red-600">{errors.quarterly_target}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            الهدف السنوي *
                                        </label>
                                        <div className="relative">
                                            <Target className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="number"
                                                value={data.annual_target}
                                                onChange={(e) => setData('annual_target', e.target.value)}
                                                className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    errors.annual_target ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="600000"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        {errors.annual_target && (
                                            <p className="mt-1 text-sm text-red-600">{errors.annual_target}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        نوع خطة الحوافز *
                                    </label>
                                    <select
                                        value={data.incentive_plan}
                                        onChange={(e) => handleIncentivePlanChange(e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.incentive_plan ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        required
                                    >
                                        <option value="fixed_commission">عمولة ثابتة</option>
                                        <option value="tiered_commission">عمولة متدرجة</option>
                                        <option value="target_bonus">مكافآت الأهداف</option>
                                    </select>
                                    {errors.incentive_plan && (
                                        <p className="mt-1 text-sm text-red-600">{errors.incentive_plan}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        إعدادات الحوافز (JSON)
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            value={data.incentive_settings}
                                            onChange={(e) => setData('incentive_settings', e.target.value)}
                                            rows={8}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                                                errors.incentive_settings ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="إعدادات الحوافز بصيغة JSON"
                                        />
                                    </div>
                                    {errors.incentive_settings && (
                                        <p className="mt-1 text-sm text-red-600">{errors.incentive_settings}</p>
                                    )}
                                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-start">
                                            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 ml-2" />
                                            <div className="text-sm text-blue-700">
                                                <p className="font-medium mb-1">مثال على إعدادات الحوافز:</p>
                                                <ul className="space-y-1">
                                                    <li><strong>عمولة ثابتة:</strong> {"{ \"commission_rate\": 5.0 }"}</li>
                                                    <li><strong>عمولة متدرجة:</strong> تحتوي على مستويات مختلفة للعمولة</li>
                                                    <li><strong>مكافآت الأهداف:</strong> عمولة أساسية + مكافأة عند تحقيق الهدف</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        خطط الحوافز الإضافية
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {incentivePlans.map((plan) => (
                                            <div key={plan.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`plan_${plan.id}`}
                                                    checked={data.incentive_plans.includes(plan.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setData('incentive_plans', [...data.incentive_plans, plan.id]);
                                                        } else {
                                                            setData('incentive_plans', data.incentive_plans.filter(id => id !== plan.id));
                                                        }
                                                    }}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor={`plan_${plan.id}`} className="mr-3 text-sm text-gray-900">
                                                    {plan.name_ar}
                                                    <span className="text-gray-500 text-xs block">{plan.type}</span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* المعلومات المالية */}
                        {activeTab === 'financial' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الراتب الأساسي *
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="number"
                                            value={data.base_salary}
                                            onChange={(e) => setData('base_salary', e.target.value)}
                                            className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.base_salary ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="5000.00"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    {errors.base_salary && (
                                        <p className="mt-1 text-sm text-red-600">{errors.base_salary}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            رقم الحساب البنكي
                                        </label>
                                        <div className="relative">
                                            <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                value={data.bank_account}
                                                onChange={(e) => setData('bank_account', e.target.value)}
                                                className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    errors.bank_account ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="1234567890"
                                            />
                                        </div>
                                        {errors.bank_account && (
                                            <p className="mt-1 text-sm text-red-600">{errors.bank_account}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            اسم البنك
                                        </label>
                                        <input
                                            type="text"
                                            value={data.bank_name}
                                            onChange={(e) => setData('bank_name', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.bank_name ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="البنك الأهلي، الراجحي، سامبا..."
                                        />
                                        {errors.bank_name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.bank_name}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        رقم الآيبان (IBAN)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.iban}
                                        onChange={(e) => setData('iban', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.iban ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="SA0380000000608010167519"
                                    />
                                    {errors.iban && (
                                        <p className="mt-1 text-sm text-red-600">{errors.iban}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* معلومات إضافية */}
                        {activeTab === 'additional' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ملاحظات
                                    </label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={5}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.notes ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="أي ملاحظات إضافية حول المندوب..."
                                    />
                                    {errors.notes && (
                                        <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end space-x-3 space-x-reverse p-6 border-t border-gray-200">
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
                            {processing ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
