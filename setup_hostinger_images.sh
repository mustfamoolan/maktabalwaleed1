#!/bin/bash

# سكريبت لإنشاء هيكل المجلدات المطلوب على Hostinger

echo "إنشاء هيكل مجلدات الصور..."

# إنشاء مجلد الصور الرئيسي
mkdir -p public_html/images
mkdir -p public_html/images/products
mkdir -p public_html/images/suppliers
mkdir -p public_html/images/users
mkdir -p public_html/storage
mkdir -p public_html/storage/app
mkdir -p public_html/storage/app/public

# إنشاء ملف .htaccess للصور
cat > public_html/images/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
    RewriteEngine On

    # السماح بالوصول لجميع أنواع الصور
    <FilesMatch "\.(jpg|jpeg|png|gif|webp|svg|ico)$">
        Header set Access-Control-Allow-Origin "*"
        Header set Cache-Control "public, max-age=31536000"
    </FilesMatch>

    # منع الوصول للملفات الأخرى
    <FilesMatch "\.php$">
        Deny from all
    </FilesMatch>
</IfModule>
EOF

# إنشاء ملف .htaccess للتخزين
cat > public_html/storage/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
    RewriteEngine On

    # توجيه طلبات التخزين
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /images/$1 [L,R=301]

    # السماح بالصور فقط
    <FilesMatch "\.(jpg|jpeg|png|gif|webp|svg)$">
        Header set Access-Control-Allow-Origin "*"
    </FilesMatch>
</IfModule>
EOF

# إنشاء صفحة اختبار للصور
cat > public_html/test_images.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>اختبار عرض الصور</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>اختبار عرض الصور</h1>

    <h2>اختبار من مجلد images:</h2>
    <img src="/images/test.jpg" alt="اختبار" style="max-width: 200px;">

    <h2>اختبار من مجلد storage:</h2>
    <img src="/storage/test.jpg" alt="اختبار" style="max-width: 200px;">

    <script>
        // اختبار تحميل الصور
        function testImage(src, element) {
            const img = new Image();
            img.onload = function() {
                console.log('تم تحميل الصورة:', src);
                element.style.border = '2px solid green';
            };
            img.onerror = function() {
                console.log('فشل تحميل الصورة:', src);
                element.style.border = '2px solid red';
                element.alt = 'فشل التحميل';
            };
            img.src = src;
        }

        // اختبار جميع الصور
        document.querySelectorAll('img').forEach(img => {
            testImage(img.src, img);
        });
    </script>
</body>
</html>
EOF

echo "تم إنشاء هيكل المجلدات بنجاح!"
echo "رفع صورة اختبار باسم test.jpg إلى مجلد images للاختبار"
