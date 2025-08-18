# دليل ربط قاعدة البيانات بواجهة React في Laravel

## المتطلبات الأساسية
- Laravel 11
- React 18
- Vite
- MySQL/MariaDB

---

## الخطوة 1: إعداد قاعدة البيانات

### 1.1 تكوين ملف `.env`
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=root
DB_PASSWORD=your_password

APP_LOCALE=ar
APP_FALLBACK_LOCALE=en
```

### 1.2 تحديث `config/database.php`
```php
'default' => env('DB_CONNECTION', 'mysql'),
```

---

## الخطوة 2: إنشاء المهاجرات والنماذج

### 2.1 إنشاء المهاجرات
```bash
php artisan make:migration create_customers_table
php artisan make:migration create_products_table
php artisan make:migration create_sales_table
php artisan make:migration create_sale_items_table
```

### 2.2 مثال على migration (Customers)
```php
// database/migrations/xxxx_create_customers_table.php
public function up(): void
{
    Schema::create('customers', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->unique();
        $table->string('phone')->nullable();
        $table->text('address')->nullable();
        $table->string('city')->nullable();
        $table->date('date_of_birth')->nullable();
        $table->enum('gender', ['male', 'female'])->nullable();
        $table->decimal('total_purchases', 10, 2)->default(0);
        $table->timestamps();
    });
}
```

### 2.3 إنشاء النماذج
```bash
php artisan make:model Customer
php artisan make:model Product
php artisan make:model Sale
php artisan make:model SaleItem
```

### 2.4 مثال على Model (Customer)
```php
// app/Models/Customer.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'name', 'email', 'phone', 'address', 'city',
        'date_of_birth', 'gender', 'total_purchases'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'total_purchases' => 'decimal:2'
    ];

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
}
```

---

## الخطوة 3: إعداد React

### 3.1 تثبيت React
```bash
npm install react react-dom @vitejs/plugin-react
```

### 3.2 تحديث `vite.config.js`
```javascript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],
});
```

### 3.3 إعداد ملف React الرئيسي
```javascript
// resources/js/app.jsx
import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
```

---

## الخطوة 4: إنشاء API Routes

### 4.1 تسجيل API في `bootstrap/app.php`
```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',  // هذا السطر مهم!
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
```

### 4.2 إنشاء API Routes في `routes/api.php`
```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;

// API للعملاء
Route::prefix('customers')->group(function () {
    Route::get('/', function () {
        $customers = Customer::withCount('sales')
            ->withSum('sales', 'total_amount')
            ->orderBy('name')
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                    'address' => $customer->address,
                    'city' => $customer->city,
                    'total_purchases' => $customer->sales_sum_total_amount ?? 0,
                    'sales_count' => $customer->sales_count,
                ];
            });

        return response()->json(['data' => $customers]);
    });
    
    Route::get('/{id}', function ($id) {
        $customer = Customer::with('sales')->findOrFail($id);
        return response()->json(['data' => $customer]);
    });
});

// API للمنتجات
Route::prefix('products')->group(function () {
    Route::get('/', function () {
        $products = Product::orderBy('name')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'stock_quantity' => $product->stock_quantity,
                    'category' => $product->category,
                    'brand' => $product->brand,
                ];
            });

        return response()->json(['data' => $products]);
    });
});
```

---

## الخطوة 5: إنشاء مكونات React

### 5.1 المكون الرئيسي
```jsx
// resources/js/components/App.jsx
import React, { useState } from 'react';
import CustomersComponent from './CustomersComponent';
import ProductsComponent from './ProductsComponent';

function App() {
    const [activeTab, setActiveTab] = useState('customers');

    const renderContent = () => {
        switch (activeTab) {
            case 'customers':
                return <CustomersComponent />;
            case 'products':
                return <ProductsComponent />;
            default:
                return <div>مرحباً بك في التطبيق</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl font-bold text-gray-800">
                            تطبيق إدارة البيانات
                        </h1>
                        <div className="flex space-x-4 space-x-reverse">
                            <button
                                onClick={() => setActiveTab('customers')}
                                className={`px-3 py-2 rounded-md text-sm font-medium ${
                                    activeTab === 'customers'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                العملاء
                            </button>
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`px-3 py-2 rounded-md text-sm font-medium ${
                                    activeTab === 'products'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                المنتجات
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {renderContent()}
            </div>
        </div>
    );
}

export default App;
```

### 5.2 مكون العملاء
```jsx
// resources/js/components/CustomersComponent.jsx
import React, { useState, useEffect } from 'react';

function CustomersComponent() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await fetch('/api/customers');
            const result = await response.json();
            setCustomers(result.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">العملاء</h2>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customers.map((customer) => (
                        <div key={customer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {customer.name}
                            </h3>
                            <p className="text-gray-600 mb-1">
                                <span className="font-medium">البريد:</span> {customer.email}
                            </p>
                            <p className="text-gray-600 mb-1">
                                <span className="font-medium">الهاتف:</span> {customer.phone}
                            </p>
                            <div className="mt-3 pt-3 border-t">
                                <div className="flex justify-between text-sm">
                                    <span>إجمالي المشتريات:</span>
                                    <span className="font-semibold text-green-600">
                                        {parseFloat(customer.total_purchases || 0).toLocaleString()} ج.م
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CustomersComponent;
```

---

## الخطوة 6: إنشاء Blade Template

### 6.1 إنشاء `resources/views/app.blade.php`
```php
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>تطبيق إدارة البيانات</title>
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="antialiased">
    <div id="app">
        <div class="flex items-center justify-center min-h-screen">
            <div class="text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p class="text-gray-600">جاري تحميل التطبيق...</p>
            </div>
        </div>
    </div>
</body>
</html>
```

### 6.2 تحديث `routes/web.php`
```php
<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
});

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
```

---

## الخطوة 7: إنشاء بيانات تجريبية (Seeders)

### 7.1 إنشاء Seeder
```bash
php artisan make:seeder CustomerSeeder
```

### 7.2 محتوى Seeder
```php
// database/seeders/CustomerSeeder.php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Customer;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            [
                'name' => 'أحمد محمد',
                'email' => 'ahmed@example.com',
                'phone' => '07701234567',
                'address' => 'بغداد',
                'city' => 'بغداد',
                'total_purchases' => 15000.00,
            ],
            // المزيد من البيانات...
        ];

        foreach ($customers as $customer) {
            Customer::create($customer);
        }
    }
}
```

### 7.3 تحديث DatabaseSeeder
```php
// database/seeders/DatabaseSeeder.php
public function run(): void
{
    $this->call([
        CustomerSeeder::class,
        ProductSeeder::class,
        // المزيد من السيدرز...
    ]);
}
```

---

## الخطوة 8: التشغيل النهائي

### 8.1 تنفيذ المهاجرات والسيدرز
```bash
php artisan migrate
php artisan db:seed
```

### 8.2 بناء React
```bash
npm run build
```

### 8.3 تشغيل الخادم
```bash
php artisan serve
```

---

## نصائح مهمة

### 1. التأكد من تسجيل API Routes
```php
// في bootstrap/app.php تأكد من وجود هذا السطر:
api: __DIR__.'/../routes/api.php',
```

### 2. معالجة CORS (إذا لزم الأمر)
```bash
composer require fruitcake/laravel-cors
```

### 3. استخدام Resource Classes للـ API
```bash
php artisan make:resource CustomerResource
```

```php
// app/Http/Resources/CustomerResource.php
public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'total_purchases' => $this->total_purchases,
        'sales_count' => $this->sales_count,
    ];
}
```

### 4. استخدام Controllers بدلاً من Closures
```bash
php artisan make:controller Api/CustomerController
```

```php
// app/Http/Controllers/Api/CustomerController.php
class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::withCount('sales')
            ->withSum('sales', 'total_amount')
            ->get();
            
        return CustomerResource::collection($customers);
    }
}
```

---

## الملفات المطلوبة للنسخ إلى مشروع جديد

1. `bootstrap/app.php` - تسجيل API routes
2. `routes/api.php` - API endpoints
3. `resources/js/app.jsx` - React entry point
4. `resources/js/components/` - مكونات React
5. `resources/views/app.blade.php` - Blade template
6. `routes/web.php` - Web routes
7. `vite.config.js` - Vite configuration
8. `database/migrations/` - ملفات المهاجرات
9. `app/Models/` - نماذج Eloquent
10. `database/seeders/` - البيانات التجريبية

هذا الدليل يغطي كل ما تحتاجه لربط Laravel بـ React مع قاعدة البيانات!
