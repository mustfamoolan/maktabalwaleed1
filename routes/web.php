<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\Admin\SupplierCategoryController;
use App\Http\Controllers\Admin\SupplierController as AdminSupplierController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\RepresentativeController;
use App\Http\Controllers\Admin\SalaryPlanController;
use App\Http\Controllers\Admin\RepresentativeSalaryController;
use App\Http\Controllers\Admin\PreparerController;
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\InvoiceController as AdminInvoiceController;
use App\Http\Controllers\RepresentativeAuthController;
use App\Http\Controllers\RepresentativeDashboardController;
use App\Http\Controllers\RepresentativeCustomerController;
use App\Http\Controllers\RepresentativePOSController;

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
    Route::resource('products', AdminProductController::class, ['except' => ['create', 'edit', 'show']])->names([
        'index' => 'admin.products.index',
        'store' => 'admin.products.store',
        'update' => 'admin.products.update',
        'destroy' => 'admin.products.destroy'
    ]);

    // مسارات إضافية للمنتجات
    Route::patch('products/{product}/toggle-status', [AdminProductController::class, 'toggleStatus'])
        ->name('admin.products.toggle-status');

    Route::get('products/search-barcode', [AdminProductController::class, 'searchByBarcode'])
        ->name('admin.products.search-barcode');

    Route::get('products/search', [AdminProductController::class, 'searchProducts'])
        ->name('admin.products.search');

    Route::post('products/generate-barcode', [AdminProductController::class, 'generateBarcodeImage'])
        ->name('admin.products.generate-barcode');

    // مسارات إدارة المندوبين
    Route::resource('representatives', RepresentativeController::class)->names([
        'index' => 'admin.representatives.index',
        'store' => 'admin.representatives.store',
        'update' => 'admin.representatives.update',
        'destroy' => 'admin.representatives.destroy'
    ]);

    Route::put('representatives/{representative}/toggle-status', [RepresentativeController::class, 'toggleStatus'])
        ->name('admin.representatives.toggle-status');

    // مسار عرض صفحة المندوب الشخصية
    Route::get('representatives/{representative}/profile', [RepresentativeController::class, 'profile'])
        ->name('admin.representatives.profile');

    // مسارات إدارة رواتب وخطط المندوب من صفحته الشخصية
    Route::post('representatives/{representative}/salary', [RepresentativeController::class, 'storeSalary'])
        ->name('admin.representatives.store-salary');
    Route::put('representatives/{representative}/salary/{salary}', [RepresentativeController::class, 'updateSalary'])
        ->name('admin.representatives.update-salary');
    Route::delete('representatives/{representative}/salary/{salary}', [RepresentativeController::class, 'destroySalary'])
        ->name('admin.representatives.destroy-salary');

    Route::post('representatives/{representative}/plan', [RepresentativeController::class, 'storePlan'])
        ->name('admin.representatives.store-plan');
    Route::put('representatives/{representative}/plan/{plan}', [RepresentativeController::class, 'updatePlan'])
        ->name('admin.representatives.update-plan');
    Route::delete('representatives/{representative}/plan/{plan}', [RepresentativeController::class, 'destroyPlan'])
        ->name('admin.representatives.destroy-plan');

    // مسار حفظ الأهداف الجديدة
    Route::post('representatives/{representative}/targets', [RepresentativeController::class, 'storeTargets'])
        ->name('admin.representatives.store-targets');

    // مسارات الخطط متعددة المنتجات
    Route::post('representatives/{representative}/multi-product-plans', [RepresentativeController::class, 'storeMultiProductPlan'])
        ->name('admin.representatives.store-multi-product-plan');
    Route::get('representatives/{representative}/multi-product-plans', [RepresentativeController::class, 'getMultiProductPlans'])
        ->name('admin.representatives.get-multi-product-plans');
    Route::put('multi-product-plans/{plan}/products/{product}/quantity', [RepresentativeController::class, 'updateMultiPlanProductQuantity'])
        ->name('admin.multi-product-plans.update-quantity');

    // مسارات إدارة المجهزين
    Route::resource('preparers', PreparerController::class)->names([
        'index' => 'admin.preparers.index',
        'create' => 'admin.preparers.create',
        'store' => 'admin.preparers.store',
        'show' => 'admin.preparers.show',
        'edit' => 'admin.preparers.edit',
        'update' => 'admin.preparers.update',
        'destroy' => 'admin.preparers.destroy'
    ]);

    // مسارات الخطط حسب الأقسام
    Route::post('representatives/{representative}/category-plans', [RepresentativeController::class, 'storeCategoryPlan'])
        ->name('admin.representatives.store-category-plan');
    Route::get('representatives/{representative}/category-plans', [RepresentativeController::class, 'getCategoryPlans'])
        ->name('admin.representatives.get-category-plans');
    Route::get('api/supplier-categories', [RepresentativeController::class, 'getSupplierCategories'])
        ->name('admin.representatives.get-supplier-categories');

    // مسارات الخطط حسب الموردين
    Route::post('representatives/{representative}/supplier-plans', [RepresentativeController::class, 'storeSupplierPlan'])
        ->name('admin.representatives.store-supplier-plan');
    Route::get('representatives/{representative}/supplier-plans', [RepresentativeController::class, 'getSupplierPlans'])
        ->name('admin.representatives.get-supplier-plans');
    Route::get('suppliers-list', [RepresentativeController::class, 'getSuppliers'])
        ->name('admin.representatives.get-suppliers');

    // مسار اختبار بسيط
    Route::post('representatives/{representative}/test', function($representative) {
        return response()->json(['success' => true, 'message' => 'Test successful', 'representative_id' => $representative]);
    })->name('admin.representatives.test');

    // مسارات إدارة العملاء
    Route::prefix('customers')->group(function () {
        Route::get('/', [AdminCustomerController::class, 'index'])->name('admin.customers.index');
        Route::get('/{customer}', [AdminCustomerController::class, 'show'])->name('admin.customers.show');
        Route::post('/{customer}/toggle-status', [AdminCustomerController::class, 'toggleStatus'])->name('admin.customers.toggle-status');
        Route::delete('/{customer}', [AdminCustomerController::class, 'destroy'])->name('admin.customers.destroy');
    });

    // مسارات إدارة الفواتير
    Route::prefix('invoices')->group(function () {
        Route::get('/', [AdminInvoiceController::class, 'index'])->name('admin.invoices.index');
        Route::get('/{invoice}', [AdminInvoiceController::class, 'show'])->name('admin.invoices.show');
        Route::patch('/{invoice}/status', [AdminInvoiceController::class, 'updateStatus'])->name('admin.invoices.update-status');
        Route::get('/{invoice}/print', [AdminInvoiceController::class, 'printInvoice'])->name('admin.invoices.print');
        Route::get('/export/excel', [AdminInvoiceController::class, 'exportExcel'])->name('admin.invoices.export');
    });
});

// مسارات تسجيل الدخول للمندوبين
Route::get('/representatives/login', [RepresentativeAuthController::class, 'showLogin'])->name('representatives.login');
Route::post('/representatives/login', [RepresentativeAuthController::class, 'login']);
Route::post('/representatives/logout', [RepresentativeAuthController::class, 'logout'])->name('representatives.logout');

// مسارات لوحة تحكم المندوبين (محمية)
Route::prefix('representatives')->middleware('representative')->group(function () {
    Route::get('/dashboard', [RepresentativeDashboardController::class, 'index'])->name('representatives.dashboard');

    // سيتم إضافة المزيد من المسارات لاحقاً
    Route::get('/profile', function() {
        $representative = session('representative_user');
        return Inertia::render('RepresentativesPanel/Profile', [
            'representative_user' => $representative
        ]);
    })->name('representatives.profile');

    Route::get('/customers', [RepresentativeCustomerController::class, 'index'])->name('representatives.customers.index');
    Route::get('/customers/create', [RepresentativeCustomerController::class, 'create'])->name('representatives.customers.create');
    Route::post('/customers', [RepresentativeCustomerController::class, 'store'])->name('representatives.customers.store');
    Route::get('/customers/{id}', [RepresentativeCustomerController::class, 'show'])->name('representatives.customers.show');
    Route::get('/customers/{id}/edit', [RepresentativeCustomerController::class, 'edit'])->name('representatives.customers.edit');
    Route::put('/customers/{id}', [RepresentativeCustomerController::class, 'update'])->name('representatives.customers.update');
    Route::delete('/customers/{id}', [RepresentativeCustomerController::class, 'destroy'])->name('representatives.customers.destroy');
    Route::post('/customers/{id}/toggle-status', [RepresentativeCustomerController::class, 'toggleStatus'])->name('representatives.customers.toggle-status');

    Route::get('/orders', function() {
        $representative = session('representative_user');
        return Inertia::render('RepresentativesPanel/Orders', [
            'representative_user' => $representative
        ]);
    })->name('representatives.orders');

    Route::get('/sales', function() {
        $representative = session('representative_user');
        return Inertia::render('RepresentativesPanel/Sales', [
            'representative_user' => $representative
        ]);
    })->name('representatives.sales');

    Route::get('/reports', function() {
        $representative = session('representative_user');
        return Inertia::render('RepresentativesPanel/Reports', [
            'representative_user' => $representative
        ]);
    })->name('representatives.reports');

    Route::get('/targets', [RepresentativeDashboardController::class, 'targets'])->name('representatives.targets');

    Route::get('/salary', [RepresentativeDashboardController::class, 'salary'])->name('representatives.salary');

    // مسارات نقطة البيع
    Route::prefix('pos')->group(function () {
        Route::get('/', [RepresentativePOSController::class, 'index'])->name('representatives.pos.index');
        Route::get('/invoice', [RepresentativePOSController::class, 'invoice'])->name('representatives.pos.invoice');
        Route::post('/invoice', [RepresentativePOSController::class, 'invoice'])->name('representatives.pos.invoice.post');
        Route::post('/', [RepresentativePOSController::class, 'store'])->name('representatives.pos.store');
        Route::get('/receipt/{sale}', [RepresentativePOSController::class, 'receipt'])->name('representatives.pos.receipt');
        Route::get('/sale/{sale}/details', [RepresentativePOSController::class, 'showSaleDetails'])->name('representatives.pos.sale-details');
        Route::get('/sale/{sale}/api', [RepresentativePOSController::class, 'getSaleDetails'])->name('representatives.pos.sale-details-api');
        Route::post('/sales/{sale}/status', [RepresentativePOSController::class, 'updateStatus'])->name('representatives.pos.update-status');
        Route::post('/sales/{sale}/send', [RepresentativePOSController::class, 'sendInvoice'])->name('representatives.pos.send-invoice');
        Route::get('/search-product', [RepresentativePOSController::class, 'searchProduct'])->name('representatives.pos.search-product');
        Route::get('/product/{barcode}', [RepresentativePOSController::class, 'getProductByBarcode'])->name('representatives.pos.product-by-barcode');
    });
});

// مسارات تسجيل الدخول للمجهزين
use App\Http\Controllers\PreparerAuthController;
use App\Http\Controllers\Preparer\DashboardController as PreparerDashboardController;

Route::prefix('preparer')->name('preparer.')->group(function () {
    // مسارات تسجيل الدخول (للضيوف)
    Route::middleware('guest:preparer')->group(function () {
        Route::get('/login', [PreparerAuthController::class, 'showLoginForm'])->name('login');
        Route::post('/login', [PreparerAuthController::class, 'login'])->name('login.post');
    });

    // مسارات المجهزين المحمية
    Route::middleware('auth:preparer')->group(function () {
        Route::get('/dashboard', [PreparerDashboardController::class, 'index'])->name('dashboard');

        // مسارات الفواتير
        Route::prefix('invoices')->name('invoices.')->group(function () {
            Route::get('/preparing', [PreparerDashboardController::class, 'preparingInvoices'])->name('preparing');
            Route::get('/completed', [PreparerDashboardController::class, 'completedInvoices'])->name('completed');
            Route::get('/completed/{invoice}', [PreparerDashboardController::class, 'showCompletedInvoice'])->name('show-completed');
            Route::get('/{invoice}', [PreparerDashboardController::class, 'showInvoice'])->name('show');
            Route::patch('/{invoice}/complete', [PreparerDashboardController::class, 'completeInvoice'])->name('complete');
        });

        Route::post('/logout', [PreparerAuthController::class, 'logout'])->name('logout');
    });
});
