# حل مشكلة عرض الصور على Hostinger

## الطريقة الأولى: إنشاء Symbolic Link

1. ادخل إلى cPanel أو File Manager
2. انتقل إلى مجلد public_html
3. أنشئ مجلد جديد اسمه "storage" إذا لم يكن موجود
4. ارفع الصور إلى: public_html/storage/
5. أو استخدم الأمر عبر SSH:

```bash
cd public_html
ln -s ../storage/app/public storage
```

## الطريقة الثانية: تعديل مسار التخزين

1. ادخل إلى cPanel File Manager
2. انتقل إلى public_html/storage
3. أنشئ المجلدات التالية:
   - public_html/storage/products/
   - public_html/storage/uploads/
   - public_html/storage/images/

## الطريقة الثالثة: استخدام .htaccess

إنشاء ملف .htaccess في public_html/storage:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /storage/$1 [L]
</IfModule>

# السماح بالوصول للصور
<FilesMatch "\.(jpg|jpeg|png|gif|webp|svg)$">
    Header set Access-Control-Allow-Origin "*"
</FilesMatch>
```

## الطريقة الرابعة: رفع الصور مباشرة

1. ارفع جميع صور المنتجات إلى:
   `public_html/images/products/`

2. تأكد من أن المسارات في قاعدة البيانات تشير إلى:
   `/images/products/filename.jpg`

## الطريقة الخامسة: تعديل config على السيرفر

في ملف public_html/.env:

```env
APP_URL=https://yourdomain.com
ASSET_URL=https://yourdomain.com
FILESYSTEM_DISK=public
```

## ملاحظات مهمة:

1. **رفع الصور:** استخدم File Manager في cPanel لرفع الصور
2. **الأذونات:** تأكد من أن أذونات المجلدات 755 والملفات 644
3. **المسارات:** تأكد من أن مسارات الصور في قاعدة البيانات صحيحة
4. **النطاق:** استبدل yourdomain.com بنطاقك الفعلي

## اختبار سريع:

1. ارفع صورة تجريبية إلى public_html/images/test.jpg
2. جرب الوصول إليها عبر: https://yourdomain.com/images/test.jpg
3. إذا ظهرت، فالمشكلة في مسارات قاعدة البيانات
