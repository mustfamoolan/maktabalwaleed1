// دوال مساعدة لتنسيق البيانات

// تنسيق العملة العراقية
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '0 د.ع';
    }

    const number = parseFloat(amount);
    return new Intl.NumberFormat('ar-IQ', {
        style: 'currency',
        currency: 'IQD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(number).replace('IQD', 'د.ع');
};

// تنسيق التاريخ
export const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};

// تنسيق التاريخ والوقت
export const formatDateTime = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

// تنسيق الأرقام
export const formatNumber = (number) => {
    if (number === null || number === undefined || isNaN(number)) {
        return '0';
    }

    return new Intl.NumberFormat('ar-IQ').format(number);
};

// تحويل الرقم إلى نص عربي
export const numberToArabicText = (number) => {
    const arabicNumbers = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];

    if (number >= 0 && number <= 10) {
        return arabicNumbers[number];
    }

    return number.toString();
};

// تحقق من صحة رقم الهاتف العراقي
export const isValidIraqiPhone = (phone) => {
    if (!phone) return false;

    // إزالة المسافات والرموز
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    // أرقام الهواتف العراقية تبدأ بـ 07 وتحتوي على 11 رقم
    const iraqiPhoneRegex = /^(07[0-9]{9})$/;

    return iraqiPhoneRegex.test(cleanPhone);
};

// تنسيق رقم الهاتف العراقي
export const formatIraqiPhone = (phone) => {
    if (!phone) return '';

    // إزالة المسافات والرموز
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    if (isValidIraqiPhone(cleanPhone)) {
        // تنسيق: 0XXX XXX XXXX
        return cleanPhone.replace(/^(07)(\d{2})(\d{3})(\d{4})$/, '$1$2 $3 $4');
    }

    return phone;
};

// قائمة المحافظات العراقية
export const iraqiGovernorates = [
    'بغداد',
    'البصرة',
    'نينوى',
    'أربيل',
    'النجف',
    'كربلاء',
    'بابل',
    'الديوانية',
    'ذي قار',
    'الأنبار',
    'بغداد',
    'كركوك',
    'صلاح الدين',
    'السليمانية',
    'المثنى',
    'القادسية',
    'ميسان',
    'واسط',
    'دهوك'
];

// حساب العمر من تاريخ الميلاد
export const calculateAge = (birthDate) => {
    if (!birthDate) return null;

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();

    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
};

// تحويل الحالة إلى نص عربي مع لون
export const getStatusInfo = (status, type = 'invoice') => {
    const statusConfig = {
        invoice: {
            'pending': { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800' },
            'preparing': { label: 'قيد التجهيز', color: 'bg-blue-100 text-blue-800' },
            'shipping': { label: 'قيد التوصيل', color: 'bg-indigo-100 text-indigo-800' },
            'delivered': { label: 'تم التسليم', color: 'bg-green-100 text-green-800' },
            'returned': { label: 'مسترجع', color: 'bg-orange-100 text-orange-800' },
            'cancelled': { label: 'ملغية', color: 'bg-red-100 text-red-800' }
        },
        payment: {
            'paid': { label: 'مدفوع', color: 'bg-green-100 text-green-800' },
            'partial': { label: 'مدفوع جزئياً', color: 'bg-yellow-100 text-yellow-800' },
            'unpaid': { label: 'غير مدفوع', color: 'bg-red-100 text-red-800' }
        }
    };

    return statusConfig[type]?.[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
};

// تقصير النص مع إضافة نقاط
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';

    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength) + '...';
};

// تحويل النص إلى slug صالح للـ URL
export const createSlug = (text) => {
    if (!text) return '';

    return text
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]/g, '-') // استبدال الأحرف غير العربية والإنجليزية بـ -
        .replace(/-+/g, '-') // استبدال عدة - متتالية بـ - واحد
        .replace(/^-|-$/g, ''); // إزالة - من البداية والنهاية
};

// تحويل الوقت النسبي (منذ كم من الوقت)
export const timeAgo = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'منذ لحظات';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    if (diffInSeconds < 604800) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;

    return formatDate(dateString);
};

// تحديد لون التقدم حسب النسبة المئوية
export const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
};

// تحويل البايتات إلى وحدة قابلة للقراءة
export const formatFileSize = (bytes) => {
    if (!bytes) return '0 بايت';

    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};
