<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RepresentativeController;
use App\Http\Controllers\RepresentativeAuthController;
use App\Http\Controllers\RepresentativeManagementController;
use App\Http\Controllers\RepresentativeCustomerController;
use App\Http\Controllers\InvoiceController;

// الصفحة الرئيسية - صفحة اختيار الأقسام
Route::get('/', function () {
    return Inertia::render('Landing');
});

// مسار اختبار سريع
Route::get('/test-pos', function () {
    return "نظام نقاط البيع يعمل!";
});

// مسار اختبار نقاط البيع خارج الـ middleware
Route::get('/pos-demo', function () {
    // الحصول على أول مندوب
    $representative = \App\Models\Representative::first();
    if (!$representative) {
        return "لا توجد مندوبين في النظام";
    }

    $customers = \App\Models\RepresentativeCustomer::where('representative_id', $representative->id)->get();
    $products = \App\Models\Product::with('supplierType')->where('is_active', true)->where('cartons_count', '>', 0)->get();

    return Inertia::render('RepresentativesPanel/POS/CreateInvoice', [
        'representative' => $representative,
        'customers' => $customers,
        'products' => $products
    ]);
});

// مسارات تسجيل الدخول للأقسام المختلفة
Route::get('/admin/login', [AdminAuthController::class, 'showLogin']);
Route::post('/admin/login', [AdminAuthController::class, 'login']);

// تسجيل دخول المندوبين
Route::get('/representatives/login', [RepresentativeAuthController::class, 'showLogin'])->name('representatives.login.form');
Route::post('/representatives/login', [RepresentativeAuthController::class, 'login'])->name('representatives.login');
Route::post('/representatives/logout', [RepresentativeAuthController::class, 'logout'])->name('representatives.logout');

Route::get('/suppliers/login', function () {
    return Inertia::render('Auth/SupplierLogin');
});

Route::get('/drivers/login', function () {
    return Inertia::render('Auth/DriverLogin');
});

// صفحة تأكيد الطلبات للعملاء - بدون تسجيل دخول
Route::get('/customers', function () {
    return Inertia::render('Customers/OrderConfirmation');
});

// معالجة تسجيل الدخول (مؤقت بدون تحقق للاختبار)

Route::post('/suppliers/login', function () {
    // تسجيل دخول مؤقت للموردين
    session(['user_type' => 'supplier', 'user_name' => 'شركة الأمل للتوريدات']);
    return redirect('/suppliers/dashboard');
});

Route::post('/drivers/login', function () {
    // تسجيل دخول مؤقت للسائقين
    session(['user_type' => 'driver', 'user_name' => 'محمد السائق']);
    return redirect('/drivers/dashboard');
});

// مسار تسجيل الخروج
Route::post('/logout', [AdminAuthController::class, 'logout']);

// مسارات لوحة تحكم الإدارة
Route::prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    // مسارات AJAX للتحديث المباشر
    Route::get('/live-stats', [AdminDashboardController::class, 'liveStats']);
    Route::get('/recent-activity', [AdminDashboardController::class, 'recentActivity']);

    Route::get('/pos', function () {
        return Inertia::render('Admin/POS', [
            'admin_user' => session('admin_user')
        ]);
    });

    Route::get('/suppliers', function () {
        return Inertia::render('Admin/Suppliers', [
            'admin_user' => session('admin_user')
        ]);
    });

    // مسارات إدارة الموردين
    Route::get('/suppliers-management', [SupplierController::class, 'index'])->name('admin.suppliers.index');
    Route::post('/suppliers', [SupplierController::class, 'store'])->name('admin.suppliers.store');
    Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('admin.suppliers.update');
    Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('admin.suppliers.destroy');

    Route::get('/warehouse', [ProductController::class, 'index'])->name('admin.warehouse.index');

    // مسارات إدارة المخزن
    Route::post('/warehouse', [ProductController::class, 'store'])->name('admin.warehouse.store');
    Route::put('/warehouse/{product}', [ProductController::class, 'update'])->name('admin.warehouse.update');
    Route::delete('/warehouse/{product}', [ProductController::class, 'destroy'])->name('admin.warehouse.destroy');

    Route::get('/representatives', [RepresentativeController::class, 'index'])->name('admin.representatives.index');

    // مسارات إدارة المندوبين
    Route::post('/representatives', [RepresentativeController::class, 'store'])->name('admin.representatives.store');
    Route::put('/representatives/{representative}', [RepresentativeController::class, 'update'])->name('admin.representatives.update');
    Route::delete('/representatives/{representative}', [RepresentativeController::class, 'destroy'])->name('admin.representatives.destroy');

    // مسارات إدارة رواتب وأهداف المندوبين
    Route::get('/representatives/{representative}/manage', [RepresentativeManagementController::class, 'show'])->name('admin.representatives.manage');
    Route::post('/representatives/{representative}/salary-plan', [RepresentativeManagementController::class, 'storeSalaryPlan'])->name('admin.representatives.salary-plan');
    Route::post('/representatives/{representative}/targets', [RepresentativeManagementController::class, 'storeTarget'])->name('admin.representatives.targets.store');
    Route::put('/representatives/{representative}/targets/{target}', [RepresentativeManagementController::class, 'updateTarget'])->name('admin.representatives.targets.update');
    Route::delete('/representatives/{representative}/targets/{target}', [RepresentativeManagementController::class, 'deleteTarget'])->name('admin.representatives.targets.delete');
    Route::post('/representatives/{representative}/sales', [RepresentativeManagementController::class, 'storeSale'])->name('admin.representatives.sales.store');
    Route::post('/representatives/{representative}/refresh-targets', [RepresentativeManagementController::class, 'refreshTargets'])->name('admin.representatives.refresh-targets');
    Route::get('/representatives/{representative}/performance', [RepresentativeManagementController::class, 'performanceReport'])->name('admin.representatives.performance');

    // مسارات عملاء المندوبين
    Route::get('/representatives/{representative}/customers', [RepresentativeCustomerController::class, 'adminIndex'])->name('admin.representatives.customers.index');
    Route::post('/representatives/{representative}/customers', [RepresentativeCustomerController::class, 'adminStore'])->name('admin.representatives.customers.store');
    Route::put('/representatives/{representative}/customers/{customer}', [RepresentativeCustomerController::class, 'update'])->name('admin.representatives.customers.update');
    Route::delete('/representatives/{representative}/customers/{customer}', [RepresentativeCustomerController::class, 'destroy'])->name('admin.representatives.customers.destroy');
    Route::get('/representatives/{representative}/customers/{customer}', [RepresentativeCustomerController::class, 'show'])->name('admin.representatives.customers.show');

    // مسارات إدارة الفواتير في الإدارة
    Route::get('/invoices', [InvoiceController::class, 'adminIndex'])->name('admin.invoices.index');
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show'])->name('admin.invoices.show');
    Route::put('/invoices/{invoice}/status', [InvoiceController::class, 'updateStatus'])->name('admin.invoices.status');
    Route::put('/invoices/{invoice}/payment', [InvoiceController::class, 'updatePayment'])->name('admin.invoices.payment');

    Route::get('/drivers', function () {
        return Inertia::render('Admin/Drivers', [
            'admin_user' => session('admin_user')
        ]);
    });

    Route::get('/providers', function () {
        return Inertia::render('Admin/Providers', [
            'admin_user' => session('admin_user')
        ]);
    });

    Route::get('/reports', function () {
        return Inertia::render('Admin/Reports', [
            'admin_user' => session('admin_user')
        ]);
    });

    Route::get('/settings', function () {
        return Inertia::render('Admin/Settings', [
            'admin_user' => session('admin_user')
        ]);
    });
});

// مسارات لوحة تحكم المندوبين
Route::prefix('representatives')->middleware('representative.auth')->group(function () {
    Route::get('/dashboard', [RepresentativeAuthController::class, 'dashboard'])->name('representatives.dashboard');

    // مسارات العملاء للمندوبين
    Route::get('/customers', [RepresentativeCustomerController::class, 'index'])->name('representatives.customers.index');
    Route::get('/customers/create', [RepresentativeCustomerController::class, 'create'])->name('representatives.customers.create');
    Route::post('/customers', [RepresentativeCustomerController::class, 'store'])->name('representatives.customers.store');
    Route::get('/customers/{customer}', [RepresentativeCustomerController::class, 'show'])->name('representatives.customers.show');
    Route::get('/customers/{customer}/edit', [RepresentativeCustomerController::class, 'edit'])->name('representatives.customers.edit');
    Route::put('/customers/{customer}', [RepresentativeCustomerController::class, 'update'])->name('representatives.customers.update');
    Route::delete('/customers/{customer}', [RepresentativeCustomerController::class, 'destroy'])->name('representatives.customers.destroy');

    // مسارات نقاط البيع للمندوبين
    Route::get('/pos/create', [InvoiceController::class, 'create'])->name('representatives.pos.create');

    // مسارات الفواتير للمندوبين
    Route::get('/invoices', function () {
        $representative = session('representative_user');
        if (!$representative) {
            return redirect()->route('representatives.login.form');
        }

        $invoices = \App\Models\Invoice::with(['customer'])
            ->where('representative_id', $representative['id'])
            ->latest()
            ->paginate(20);

        return Inertia::render('RepresentativesPanel/Invoices/Index', [
            'representative_user' => $representative,
            'invoices' => $invoices,
            'filters' => request()->only(['status'])
        ]);
    })->name('representatives.invoices');

    Route::get('/invoices/{invoice}', [InvoiceController::class, 'representativeShow'])->name('representatives.invoices.show');

    // مسارات إضافية للمندوبين
    Route::get('/orders', function () {
        return Inertia::render('RepresentativesPanel/Orders', [
            'representative_user' => session('representative_user')
        ]);
    })->name('representatives.orders');

    Route::get('/payments', function () {
        return Inertia::render('RepresentativesPanel/Payments', [
            'representative_user' => session('representative_user')
        ]);
    })->name('representatives.payments');

    Route::get('/reports', function () {
        return Inertia::render('RepresentativesPanel/Reports', [
            'representative_user' => session('representative_user')
        ]);
    })->name('representatives.reports');

    Route::get('/products', function () {
        return Inertia::render('RepresentativesPanel/Products', [
            'representative_user' => session('representative_user')
        ]);
    })->name('representatives.products');

    Route::get('/settings', function () {
        return Inertia::render('RepresentativesPanel/Settings', [
            'representative_user' => session('representative_user')
        ]);
    })->name('representatives.settings');
});

// مسارات الفواتير ونقاط البيع
Route::middleware(['web'])->group(function () {
    // مسارات إدارة الفواتير (للإدارة)
    Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');
    Route::patch('/invoices/{invoice}/status', [InvoiceController::class, 'updateStatus'])->name('invoices.updateStatus');
    Route::patch('/invoices/{invoice}/payment', [InvoiceController::class, 'updatePayment'])->name('invoices.updatePayment');
    Route::get('/invoices/{invoice}/print', [InvoiceController::class, 'print'])->name('invoices.print');

    // مسارات نقاط البيع العامة
    Route::post('/invoices', [InvoiceController::class, 'store'])->name('invoices.store');

    // احصائيات المندوب
    Route::get('/representatives/{representative}/stats', [InvoiceController::class, 'representativeStats'])
        ->name('representatives.stats');
});

// مسارات لوحة تحكم المجهزين
Route::prefix('suppliers')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('SuppliersPanel/Dashboard');
    });
});

// مسارات لوحة تحكم السائقين
Route::prefix('drivers')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('DriversPanel/Dashboard');
    });

    Route::get('/deliveries', function () {
        return Inertia::render('DriversPanel/Deliveries');
    });
});
