<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\Admin\SupplierCategoryController;
use App\Http\Controllers\Admin\SupplierController as AdminSupplierController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\SalesRepresentativeController;

// الصفحة الرئيسية - صفحة اختيار الأقسام
Route::get('/', function () {
    return Inertia::render('Landing');
});

// مسارات تسجيل الدخول للإدارة
Route::get('/admin/login', [AdminAuthController::class, 'showLogin'])->name('admin.login');
Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::post('/admin/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');

// مسارات لوحة تحكم الإدارة (محمية)
Route::prefix('admin')->middleware('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    // مسارات إدارة فئات الموردين
    Route::resource('supplier-categories', SupplierCategoryController::class)->names([
        'index' => 'admin.supplier-categories.index',
        'create' => 'admin.supplier-categories.create',
        'store' => 'admin.supplier-categories.store',
        'show' => 'admin.supplier-categories.show',
        'edit' => 'admin.supplier-categories.edit',
        'update' => 'admin.supplier-categories.update',
        'destroy' => 'admin.supplier-categories.destroy'
    ]);

    // مسارات إدارة الموردين
    Route::resource('suppliers', AdminSupplierController::class, ['except' => ['create', 'edit']])->names([
        'index' => 'admin.suppliers.index',
        'store' => 'admin.suppliers.store',
        'show' => 'admin.suppliers.show',
        'update' => 'admin.suppliers.update',
        'destroy' => 'admin.suppliers.destroy'
    ]);

    // مسار تغيير حالة المورد
    Route::patch('suppliers/{supplier}/toggle-status', [AdminSupplierController::class, 'toggleStatus'])
        ->name('admin.suppliers.toggle-status');

    // مسارات إدارة المنتجات
    Route::resource('products', AdminProductController::class, ['except' => ['create', 'edit']])->names([
        'index' => 'admin.products.index',
        'store' => 'admin.products.store',
        'show' => 'admin.products.show',
        'update' => 'admin.products.update',
        'destroy' => 'admin.products.destroy'
    ]);

    // مسار عرض الجدول
    Route::get('products/table', [AdminProductController::class, 'table'])
        ->name('admin.products.table');

    // مسارات إضافية للمنتجات
    Route::patch('products/{product}/toggle-status', [AdminProductController::class, 'toggleStatus'])
        ->name('admin.products.toggle-status');

    Route::get('products/search-barcode', [AdminProductController::class, 'searchByBarcode'])
        ->name('admin.products.search-barcode');

    Route::post('products/generate-barcode', [AdminProductController::class, 'generateBarcodeImage'])
        ->name('admin.products.generate-barcode');

    // مسارات المندوبين
    Route::resource('sales-representatives', SalesRepresentativeController::class, ['except' => ['create', 'edit']])->names([
        'index' => 'admin.sales-representatives.index',
        'store' => 'admin.sales-representatives.store',
        'show' => 'admin.sales-representatives.show',
        'update' => 'admin.sales-representatives.update',
        'destroy' => 'admin.sales-representatives.destroy'
    ]);

    // مسارات إضافية للمندوبين
    Route::patch('sales-representatives/{salesRepresentative}/toggle-status', [SalesRepresentativeController::class, 'toggleStatus'])
        ->name('admin.sales-representatives.toggle-status');

    Route::get('sales-representatives/performance-report', [SalesRepresentativeController::class, 'performanceReport'])
        ->name('admin.sales-representatives.performance-report');
});
