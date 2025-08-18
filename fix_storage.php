<?php
// ملف لإصلاح مشكلة الرابط الرمزي
echo "<h2>إصلاح مشكلة الصور</h2>";

$publicStorageDir = __DIR__ . '/public/storage';
$storagePublicDir = __DIR__ . '/storage/app/public';

echo "<h3>الخطوة 1: فحص الوضع الحالي</h3>";

// فحص الرابط الموجود
if (is_link($publicStorageDir)) {
    $target = readlink($publicStorageDir);
    echo "الرابط الرمزي يشير إلى: $target<br>";

    if ($target === $storagePublicDir) {
        echo "✅ الرابط صحيح<br>";
    } else {
        echo "❌ الرابط يشير إلى مكان خاطئ<br>";
        echo "يجب أن يشير إلى: $storagePublicDir<br>";

        // إصلاح الرابط
        echo "<h3>الخطوة 2: إصلاح الرابط</h3>";
        if (unlink($publicStorageDir)) {
            echo "تم حذف الرابط القديم<br>";
        }

        if (symlink($storagePublicDir, $publicStorageDir)) {
            echo "✅ تم إنشاء رابط جديد صحيح<br>";
        } else {
            echo "❌ فشل في إنشاء الرابط الجديد<br>";
        }
    }
} elseif (is_dir($publicStorageDir)) {
    echo "❌ يوجد مجلد عادي بدلاً من الرابط الرمزي<br>";

    // النسخ الاحتياطي
    $backupDir = __DIR__ . '/public/storage_backup_' . date('Y-m-d_H-i-s');
    if (rename($publicStorageDir, $backupDir)) {
        echo "تم إنشاء نسخة احتياطية: $backupDir<br>";
    }

    // إنشاء الرابط الصحيح
    if (symlink($storagePublicDir, $publicStorageDir)) {
        echo "✅ تم إنشاء الرابط الرمزي<br>";
    } else {
        echo "❌ فشل في إنشاء الرابط الرمزي<br>";
    }
} else {
    echo "❌ مجلد storage غير موجود في public<br>";

    // إنشاء الرابط
    if (symlink($storagePublicDir, $publicStorageDir)) {
        echo "✅ تم إنشاء الرابط الرمزي<br>";
    } else {
        echo "❌ فشل في إنشاء الرابط الرمزي<br>";
    }
}

echo "<h3>الخطوة 3: اختبار النتيجة</h3>";

// اختبار إنشاء ملف
$testFile = $storagePublicDir . '/products/test_image.txt';
$testContent = 'اختبار الصور - ' . date('Y-m-d H:i:s');

if (!is_dir($storagePublicDir . '/products')) {
    if (mkdir($storagePublicDir . '/products', 0755, true)) {
        echo "تم إنشاء مجلد المنتجات<br>";
    }
}

if (file_put_contents($testFile, $testContent)) {
    echo "✅ تم إنشاء ملف اختبار<br>";

    // فحص إمكانية الوصول عبر المتصفح
    $testUrl = 'public/storage/products/test_image.txt';
    if (file_exists(__DIR__ . '/' . $testUrl)) {
        $fullUrl = (isset($_SERVER['HTTPS']) ? 'https' : 'http') .
                   '://' . $_SERVER['HTTP_HOST'] .
                   dirname($_SERVER['SCRIPT_NAME']) . '/' . $testUrl;
        echo "✅ الملف متاح عبر: <a href='$fullUrl' target='_blank'>$fullUrl</a><br>";
    } else {
        echo "❌ الملف غير متاح عبر المتصفح<br>";
    }

    // حذف ملف الاختبار
    unlink($testFile);
} else {
    echo "❌ فشل في إنشاء ملف الاختبار<br>";
}

echo "<h3>الخطوة 4: فحص الملفات الموجودة</h3>";
$productsDir = $storagePublicDir . '/products';
if (is_dir($productsDir)) {
    $files = array_diff(scandir($productsDir), ['.', '..']);
    echo "عدد الملفات في مجلد المنتجات: " . count($files) . "<br>";

    foreach ($files as $file) {
        $filePath = $productsDir . '/' . $file;
        if (is_file($filePath)) {
            $size = filesize($filePath);
            $publicPath = 'public/storage/products/' . $file;
            $accessible = file_exists(__DIR__ . '/' . $publicPath) ? "✅" : "❌";
            echo "$accessible $file (الحجم: $size بايت)<br>";
        }
    }
}

echo "<h3>التوصيات:</h3>";
echo "1. تأكد من أن صلاحيات مجلد storage/app/public/products هي 755 أو 777<br>";
echo "2. تأكد من أن الخادم يدعم الروابط الرمزية<br>";
echo "3. في حالة عدم دعم الروابط الرمزية، انسخ الملفات يدوياً من storage/app/public إلى public/storage<br>";
echo "4. تأكد من أن ملف .htaccess في public يسمح بالوصول للملفات<br>";
?>
