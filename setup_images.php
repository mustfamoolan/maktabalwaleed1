<?php
// ملف PHP لإنشاء هيكل المجلدات وإعداد الصور على Hostinger

echo "<h1>إعداد مجلدات الصور على Hostinger</h1>";

// المجلدات المطلوبة
$directories = [
    'images',
    'images/products',
    'images/suppliers',
    'images/users',
    'storage',
    'storage/app',
    'storage/app/public'
];

echo "<h2>إنشاء المجلدات:</h2>";
foreach ($directories as $dir) {
    if (!is_dir($dir)) {
        if (mkdir($dir, 0755, true)) {
            echo "<p style='color: green;'>✓ تم إنشاء مجلد: $dir</p>";
        } else {
            echo "<p style='color: red;'>✗ فشل إنشاء مجلد: $dir</p>";
        }
    } else {
        echo "<p style='color: blue;'>- المجلد موجود: $dir</p>";
    }
}

// إنشاء ملف .htaccess للصور
$htaccess_images = '
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
';

if (file_put_contents('images/.htaccess', $htaccess_images)) {
    echo "<p style='color: green;'>✓ تم إنشاء ملف .htaccess للصور</p>";
} else {
    echo "<p style='color: red;'>✗ فشل إنشاء ملف .htaccess للصور</p>";
}

// إنشاء ملف index.php للحماية
$index_content = '<?php header("Location: /"); exit; ?>';
foreach (['images', 'storage'] as $dir) {
    if (file_put_contents("$dir/index.php", $index_content)) {
        echo "<p style='color: green;'>✓ تم إنشاء ملف الحماية في: $dir</p>";
    }
}

echo "<h2>اختبار الأذونات:</h2>";
$test_file = 'images/test_permission.txt';
if (file_put_contents($test_file, 'test')) {
    echo "<p style='color: green;'>✓ أذونات الكتابة تعمل</p>";
    unlink($test_file);
} else {
    echo "<p style='color: red;'>✗ مشكلة في أذونات الكتابة</p>";
}

echo "<h2>معلومات الخادم:</h2>";
echo "<p>مجلد العمل الحالي: " . getcwd() . "</p>";
echo "<p>عنوان الخادم: " . $_SERVER['HTTP_HOST'] . "</p>";
echo "<p>مجلد الجذر: " . $_SERVER['DOCUMENT_ROOT'] . "</p>";

echo "<h2>الخطوات التالية:</h2>";
echo "<ol>";
echo "<li>ارفع صور المنتجات إلى مجلد <code>images/products/</code></li>";
echo "<li>تأكد من أن أسماء الصور في قاعدة البيانات تبدأ بـ <code>images/products/</code></li>";
echo "<li>اختبر عرض الصور من خلال المتصفح</li>";
echo "</ol>";

echo "<h2>مثال على رابط الصورة:</h2>";
echo "<code>https://" . $_SERVER['HTTP_HOST'] . "/images/products/product1.jpg</code>";

// إنشاء ملف اختبار HTML
$test_html = '
<!DOCTYPE html>
<html>
<head>
    <title>اختبار عرض الصور</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-box { border: 1px solid #ccc; padding: 10px; margin: 10px 0; }
        .success { border-color: green; background: #f0fff0; }
        .error { border-color: red; background: #fff0f0; }
    </style>
</head>
<body>
    <h1>اختبار عرض الصور</h1>
    <div class="test-box">
        <p>ارفع صورة باسم <strong>test.jpg</strong> إلى مجلد images وأعد تحميل هذه الصفحة</p>
        <img id="testImg" src="/images/test.jpg" alt="صورة اختبار" style="max-width: 200px; border: 2px solid #ccc;">
    </div>

    <script>
        const img = document.getElementById("testImg");
        img.onload = function() {
            this.parentElement.className = "test-box success";
            this.style.borderColor = "green";
        };
        img.onerror = function() {
            this.parentElement.className = "test-box error";
            this.style.borderColor = "red";
            this.alt = "فشل تحميل الصورة - تأكد من رفع test.jpg إلى مجلد images";
        };
    </script>
</body>
</html>
';

if (file_put_contents('test_images.html', $test_html)) {
    echo "<p style='color: green;'>✓ تم إنشاء صفحة اختبار: <a href='test_images.html' target='_blank'>test_images.html</a></p>";
}

echo "<hr>";
echo "<p><strong>ملاحظة:</strong> بعد الانتهاء من الإعداد، احذف هذا الملف لأسباب أمنية.</p>";
?>
