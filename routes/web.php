<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminDashboardController;

// الصفحة الرئيسية - صفحة اختيار الأقسام
Route::get('/', function () {
    return view('landing');
});

// PWA API Routes
Route::get('/api/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
});

Route::post('/api/sync-offline-data', function (Illuminate\Http\Request $request) {
    // معالجة بيانات الأوف لاين
    $data = $request->json()->all();

    try {
        // هنا يمكن معالجة البيانات المحفوظة محلياً
        // مثل حفظ المعاملات أو التحديثات المؤجلة

        return response()->json([
            'success' => true,
            'message' => 'تم رفع البيانات بنجاح',
            'synced_count' => count($data)
        ]);
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'فشل في رفع البيانات',
            'error' => $e->getMessage()
        ], 500);
    }
})->middleware('admin');

// مسارات تسجيل الدخول للإدارة
Route::get('/admin/login', [AdminAuthController::class, 'showLogin'])->name('admin.login');
Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::post('/admin/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');

// مسارات لوحة تحكم الإدارة (محمية)
Route::prefix('admin')->middleware('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    // مسارات خاصة للموردين
    Route::get('/suppliers-data/{supplier}', [App\Http\Controllers\SupplierController::class, 'editData'])->name('admin.suppliers.data');

    // مسارات خاصة للمنتجات
    Route::get('/products-data/{product}', [App\Http\Controllers\ProductController::class, 'productData'])->name('admin.products.data');

    // مسارات الموردين
    Route::resource('suppliers', App\Http\Controllers\SupplierController::class, [
        'as' => 'admin'
    ]);

    // مسارات المنتجات
    Route::resource('products', App\Http\Controllers\ProductController::class, [
        'as' => 'admin'
    ]);

    // route لجلب بيانات المنتج للتفاصيل السريعة
    Route::get('products-data/{product}', [App\Http\Controllers\ProductController::class, 'productData'])
        ->name('admin.products.data');

    // route لبحث المنتجات
    Route::get('products-search', [App\Http\Controllers\ProductController::class, 'search'])
        ->name('admin.products.search');

    // route لحفظ منتج عبر AJAX
    Route::post('products-store-ajax', [App\Http\Controllers\ProductController::class, 'storeAjax'])
        ->name('admin.products.store-ajax');

    // route لجلب قائمة الأصناف
    Route::get('categories-list', [App\Http\Controllers\CategoryController::class, 'list'])
        ->name('admin.categories.list');

    // مسارات فواتير الشراء
    Route::resource('purchase-invoices', App\Http\Controllers\PurchaseInvoiceController::class, [
        'as' => 'admin'
    ]);

    // route لبحث المنتجات في فاتورة الشراء
    Route::get('purchase-invoices-search-products', [App\Http\Controllers\PurchaseInvoiceController::class, 'searchProducts'])
        ->name('admin.purchase-invoices.search-products');

    // مسارات فواتير مرتجع الشراء
    Route::resource('purchase-return-invoices', App\Http\Controllers\Admin\PurchaseReturnInvoiceController::class, [
        'as' => 'admin'
    ]);

    // routes إضافية لفواتير مرتجع الشراء
    Route::get('purchase-return-invoices/{purchaseReturnInvoice}/confirm',
        [App\Http\Controllers\Admin\PurchaseReturnInvoiceController::class, 'confirm'])
        ->name('admin.purchase-return-invoices.confirm');

    Route::get('purchase-return-invoices/{purchaseReturnInvoice}/cancel',
        [App\Http\Controllers\Admin\PurchaseReturnInvoiceController::class, 'cancel'])
        ->name('admin.purchase-return-invoices.cancel');

    // البحث عن فواتير الشراء للمرتجع
    Route::get('purchase-invoices-all',
        [App\Http\Controllers\Admin\PurchaseReturnInvoiceController::class, 'getAllPurchaseInvoices'])
        ->name('admin.purchase-invoices.all');

    Route::get('suppliers-with-invoices',
        [App\Http\Controllers\Admin\PurchaseReturnInvoiceController::class, 'getSuppliersWithInvoices'])
        ->name('admin.suppliers.with-invoices');

    Route::get('purchase-invoices-search',
        [App\Http\Controllers\Admin\PurchaseReturnInvoiceController::class, 'searchPurchaseInvoices'])
        ->name('admin.purchase-invoices.search');

    Route::get('purchase-invoices/{id}/details',
        [App\Http\Controllers\Admin\PurchaseReturnInvoiceController::class, 'getPurchaseInvoiceDetails'])
        ->name('admin.purchase-invoices.details');

    // مسارات المندوبين
    Route::resource('representatives', App\Http\Controllers\RepresentativeController::class, [
        'as' => 'admin'
    ]);

    // مسارات إدارة الرواتب
    Route::resource('salaries', App\Http\Controllers\Admin\SalaryController::class, [
        'as' => 'admin'
    ]);

    // مسارات إدارة خطط البيع
    Route::resource('sales-plans', App\Http\Controllers\Admin\SalesPlanController::class, [
        'as' => 'admin'
    ]);
    Route::post('sales-plans/{plan}/toggle', [App\Http\Controllers\Admin\SalesPlanController::class, 'toggleStatus']);

    // API Routes for AJAX calls from representatives page
    Route::get('representatives/{representative}/salaries', [App\Http\Controllers\RepresentativeController::class, 'getSalaries']);
    Route::get('representatives/{representative}/plans', [App\Http\Controllers\RepresentativeController::class, 'getPlans']);
});

// إعادة توجيه جميع المسارات الأخرى إلى الصفحة الرئيسية
Route::fallback(function () {
    return redirect('/');
});
