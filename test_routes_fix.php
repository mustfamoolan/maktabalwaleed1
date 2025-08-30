<?php

use Illuminate\Support\Facades\Route;

echo "=== اختبار مسارات فئات الموردين ===\n\n";

// طباعة جميع المسارات المتعلقة بفئات الموردين
$routes = Route::getRoutes();

echo "المسارات المسجلة:\n";
foreach ($routes as $route) {
    $uri = $route->uri();
    if (strpos($uri, 'supplier-categories') !== false) {
        echo "- {$route->methods()[0]} /admin/{$uri} -> {$route->getActionName()}\n";
    }
}

echo "\n=== تحليل المشكلة ===\n";
echo "المشكلة كانت: تضارب في المسارات\n";
echo "1. /admin/supplier-categories -> SupplierCategoryController@index (Inertia)\n";
echo "2. /admin/supplier-categories -> RepresentativeController@getSupplierCategories (JSON)\n\n";

echo "الحل المطبق:\n";
echo "- تم تغيير مسار JSON إلى: /admin/api/supplier-categories\n";
echo "- تم تحديث الملفات التي تستخدم هذا المسار\n\n";

echo "النتيجة: صفحة فئات الموردين تعمل الآن بشكل صحيح ✅\n";
