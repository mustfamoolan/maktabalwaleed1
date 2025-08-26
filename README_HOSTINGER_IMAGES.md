# حل مشاكل عرض الصور على Hostinger

## 🎯 المشكلة
عند رفع المشروع على Hostinger داخل مجلد `public_html`، لا تظهر الصور بسبب مشاكل في المسارات.

## 🔧 الحلول العملية

### الحل الأول: رفع ملف PHP للإعداد التلقائي

1. ارفع ملف `setup_images.php` إلى مجلد `public_html`
2. تصفح إلى: `https://yourdomain.com/setup_images.php`
3. سيقوم الملف بإنشاء المجلدات تلقائياً
4. احذف الملف بعد الانتهاء

### الحل الثاني: الإعداد اليدوي

#### الخطوة 1: إنشاء المجلدات
```
public_html/
├── images/
│   ├── products/
│   ├── suppliers/
│   └── users/
└── storage/
    └── app/
        └── public/
```

#### الخطوة 2: إنشاء ملف .htaccess في مجلد images
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    <FilesMatch "\.(jpg|jpeg|png|gif|webp|svg|ico)$">
        Header set Access-Control-Allow-Origin "*"
        Header set Cache-Control "public, max-age=31536000"
    </FilesMatch>
    
    <FilesMatch "\.php$">
        Deny from all
    </FilesMatch>
</IfModule>
```

#### الخطوة 3: رفع الصور
- ارفع صور المنتجات إلى: `public_html/images/products/`
- تأكد من أن أسماء الملفات باللغة الإنجليزية
- استخدم أسماء بدون مسافات أو رموز خاصة

#### الخطوة 4: تحديث قاعدة البيانات
```sql
-- إذا كانت المسارات خاطئة في قاعدة البيانات
UPDATE products SET image = CONCAT('images/products/', image) WHERE image NOT LIKE 'images/%';
```

### الحل الثالث: استخدام رابط مباشر

إذا كان لديك صور موجودة، يمكنك تحديث مسارات الصور في النظام:

1. في ملف `.env` على السيرفر:
```env
APP_URL=https://yourdomain.com
ASSET_URL=https://yourdomain.com
```

2. تأكد من أن مسارات الصور في قاعدة البيانات تبدأ بـ `images/`

### الحل الرابع: اختبار سريع

1. ارفع صورة تجريبية باسم `test.jpg` إلى `public_html/images/`
2. اذهب إلى: `https://yourdomain.com/images/test.jpg`
3. إذا ظهرت الصورة، فالمشكلة في مسارات قاعدة البيانات
4. إذا لم تظهر، فالمشكلة في أذونات المجلد

## 🚀 خطوات التنفيذ السريع

1. **ارفع ملف الإعداد:**
   - ارفع `setup_images.php` إلى `public_html`
   - تصفح إليه وشغله
   - احذفه بعد الانتهاء

2. **اختبر النظام:**
   - ارفع صورة تجريبية
   - افتح `test_images.html` للاختبار

3. **رفع صور المنتجات:**
   - ارفع جميع الصور إلى `images/products/`
   - تأكد من المسارات في قاعدة البيانات

## 🔍 استكشاف الأخطاء

- **الصور لا تظهر:** تحقق من أذونات المجلد (755)
- **خطأ 404:** تحقق من مسار الصورة في قاعدة البيانات
- **خطأ 403:** تحقق من ملف .htaccess
- **صور مكسورة:** تحقق من أسماء الملفات

## ⚠️ ملاحظات مهمة

- لا تضع الصور في مجلد `storage` على Hostinger
- استخدم مجلد `images` مباشرة في `public_html`
- تأكد من أن أسماء الصور باللغة الإنجليزية
- احذف ملفات الإعداد بعد الانتهاء
