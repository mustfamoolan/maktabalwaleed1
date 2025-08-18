<?php
// ملف للتحقق من حالة الصور والروابط على السيرفر
echo "<h2>فحص حالة الصور والروابط</h2>";

// التحقق من وجود الرابط الرمزي
echo "<h3>1. فحص الرابط الرمزي:</h3>";
$storageLink = __DIR__ . '/public/storage';
if (is_link($storageLink)) {
    echo "✅ الرابط الرمزي موجود: " . readlink($storageLink) . "<br>";
} elseif (is_dir($storageLink)) {
    echo "⚠️ مجلد عادي موجود بدلاً من الرابط الرمزي<br>";
} else {
    echo "❌ الرابط الرمزي غير موجود<br>";
}

// التحقق من مجلد المنتجات
echo "<h3>2. فحص مجلد المنتجات:</h3>";
$productsPath = __DIR__ . '/storage/app/public/products';
if (is_dir($productsPath)) {
    echo "✅ مجلد المنتجات موجود<br>";
    echo "الصلاحيات: " . substr(sprintf('%o', fileperms($productsPath)), -4) . "<br>";

    // عرض محتويات المجلد
    $files = scandir($productsPath);
    echo "محتويات المجلد (" . (count($files) - 2) . " ملف):<br>";
    foreach ($files as $file) {
        if ($file != '.' && $file != '..') {
            $filePath = $productsPath . '/' . $file;
            $size = filesize($filePath);
            $perms = substr(sprintf('%o', fileperms($filePath)), -4);
            echo "- $file (الحجم: $size بايت، الصلاحيات: $perms)<br>";
        }
    }
} else {
    echo "❌ مجلد المنتجات غير موجود<br>";
}

// التحقق من إمكانية الوصول عبر المتصفح
echo "<h3>3. فحص إمكانية الوصول:</h3>";
$publicStoragePath = __DIR__ . '/public/storage/products';
if (is_dir($publicStoragePath)) {
    echo "✅ مجلد المنتجات متاح عبر public/storage<br>";

    // عرض الملفات المتاحة
    $files = scandir($publicStoragePath);
    echo "الملفات المتاحة عبر المتصفح:<br>";
    foreach ($files as $file) {
        if ($file != '.' && $file != '..' && !is_dir($publicStoragePath . '/' . $file)) {
            $url = (isset($_SERVER['HTTPS']) ? 'https' : 'http') .
                   '://' . $_SERVER['HTTP_HOST'] .
                   dirname($_SERVER['SCRIPT_NAME']) . '/public/storage/products/' . $file;
            echo "- <a href='$url' target='_blank'>$file</a><br>";
        }
    }
} else {
    echo "❌ مجلد المنتجات غير متاح عبر public/storage<br>";
}

// التحقق من إعدادات PHP
echo "<h3>4. إعدادات PHP:</h3>";
echo "المسار الحالي: " . __DIR__ . "<br>";
echo "صلاحيات الكتابة على storage: " . (is_writable(__DIR__ . '/storage/app/public') ? "✅ متاح" : "❌ غير متاح") . "<br>";
echo "دعم الروابط الرمزية: " . (function_exists('symlink') ? "✅ متاح" : "❌ غير متاح") . "<br>";
echo "الخادم: " . $_SERVER['SERVER_SOFTWARE'] . "<br>";

// اختبار رفع ملف
echo "<h3>5. اختبار رفع ملف:</h3>";
$testFile = __DIR__ . '/storage/app/public/products/test.txt';
if (file_put_contents($testFile, 'اختبار الكتابة - ' . date('Y-m-d H:i:s'))) {
    echo "✅ يمكن إنشاء ملفات جديدة<br>";
    if (file_exists(__DIR__ . '/public/storage/products/test.txt')) {
        echo "✅ الملف متاح عبر public/storage<br>";
        $url = (isset($_SERVER['HTTPS']) ? 'https' : 'http') .
               '://' . $_SERVER['HTTP_HOST'] .
               dirname($_SERVER['SCRIPT_NAME']) . '/public/storage/products/test.txt';
        echo "رابط الاختبار: <a href='$url' target='_blank'>$url</a><br>";
    } else {
        echo "❌ الملف غير متاح عبر public/storage<br>";
    }
    // حذف ملف الاختبار
    unlink($testFile);
} else {
    echo "❌ لا يمكن إنشاء ملفات جديدة<br>";
}
?>
