<?php

require_once 'vendor/autoload.php';

use App\Models\Product;
use App\Models\Representative;
use App\Models\RepresentativeCustomer;
use App\Models\Sale;
use App\Models\SaleItem;

// تحميل Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

echo "=== اختبار النظام المحسن للمبيعات ===\n\n";

// التحقق من البيانات المتوفرة
echo "1. التحقق من البيانات المتوفرة:\n";
echo "   - المنتجات: " . Product::count() . "\n";
echo "   - المندوبين: " . Representative::count() . "\n";
echo "   - العملاء: " . RepresentativeCustomer::count() . "\n";
echo "   - المبيعات: " . Sale::count() . "\n\n";

// عرض منتج مع تفاصيل المورد
echo "2. نماذج المنتجات مع الموردين:\n";
$products = Product::with(['supplier', 'category'])->take(3)->get();
foreach ($products as $product) {
    echo "   - " . $product->name_ar . "\n";
    echo "     المورد: " . ($product->supplier ? $product->supplier->name : 'غير محدد') . "\n";
    echo "     القسم: " . ($product->category ? $product->category->name : 'غير محدد') . "\n";
    echo "     سعر التكلفة: " . $product->cost_price . " د.ع\n";
    echo "     سعر البيع: " . $product->selling_price . " د.ع\n";
    echo "     الربح المتوقع: " . ($product->selling_price - $product->cost_price) . " د.ع\n\n";
}

// اختبار إنشاء فاتورة تجريبية
echo "3. اختبار حساب الموردين والأقسام:\n";
$testItems = [
    ['product_id' => 1, 'quantity' => 2, 'unit_sale_price' => 50000],
    ['product_id' => 2, 'quantity' => 1, 'unit_sale_price' => 30000],
    ['product_id' => 3, 'quantity' => 3, 'unit_sale_price' => 20000],
];

$supplierTotals = [];
$categoryTotals = [];
$totalProfit = 0;

foreach ($testItems as $item) {
    $product = Product::with(['supplier', 'category'])->find($item['product_id']);
    if ($product) {
        $itemTotal = $item['quantity'] * $item['unit_sale_price'];
        $itemProfit = ($item['unit_sale_price'] - $product->cost_price) * $item['quantity'];
        $totalProfit += $itemProfit;

        echo "   المنتج: " . $product->name_ar . "\n";
        echo "   الكمية: " . $item['quantity'] . "\n";
        echo "   إجمالي المنتج: " . $itemTotal . " د.ع\n";
        echo "   ربح المنتج: " . $itemProfit . " د.ع\n";

        if ($product->supplier_id) {
            $supplierName = $product->supplier->name;
            $supplierTotals[$supplierName] = ($supplierTotals[$supplierName] ?? 0) + $itemTotal;
            echo "   المورد: " . $supplierName . "\n";
        }

        if ($product->category_id) {
            $categoryName = $product->category->name;
            $categoryTotals[$categoryName] = ($categoryTotals[$categoryName] ?? 0) + $itemTotal;
            echo "   القسم: " . $categoryName . "\n";
        }
        echo "\n";
    }
}

echo "4. ملخص الفاتورة التجريبية:\n";
echo "   إجمالي الربح: " . $totalProfit . " د.ع\n\n";

echo "   توزيع المبالغ حسب المورد:\n";
foreach ($supplierTotals as $supplier => $total) {
    echo "   - " . $supplier . ": " . $total . " د.ع\n";
}

$primarySupplier = !empty($supplierTotals) ? array_keys($supplierTotals, max($supplierTotals))[0] : null;
echo "   المورد الرئيسي: " . ($primarySupplier ?: 'غير محدد') . "\n\n";

echo "   توزيع المبالغ حسب القسم:\n";
foreach ($categoryTotals as $category => $total) {
    echo "   - " . $category . ": " . $total . " د.ع\n";
}

$primaryCategory = !empty($categoryTotals) ? array_keys($categoryTotals, max($categoryTotals))[0] : null;
echo "   القسم الرئيسي: " . ($primaryCategory ?: 'غير محدد') . "\n\n";

// عرض آخر المبيعات مع التتبع المحسن
echo "5. آخر المبيعات مع التتبع المحسن:\n";
$recentSales = Sale::with(['primarySupplier', 'primaryCategory', 'sellerRepresentative', 'customer'])
    ->latest()
    ->take(2)
    ->get();

foreach ($recentSales as $sale) {
    echo "   فاتورة #" . $sale->sale_number . "\n";
    echo "   المندوب: " . ($sale->sellerRepresentative->name ?? 'غير محدد') . "\n";
    echo "   العميل: " . ($sale->customer_name ?? 'غير محدد') . "\n";
    echo "   الحالة: " . $sale->status . "\n";
    echo "   المورد الرئيسي: " . ($sale->primarySupplier->name ?? 'غير محدد') . "\n";
    echo "   القسم الرئيسي: " . ($sale->primaryCategory->name ?? 'غير محدد') . "\n";
    echo "   إجمالي الربح: " . $sale->total_profit . " د.ع\n";
    echo "   التاريخ: " . $sale->created_at->format('Y-m-d H:i') . "\n\n";
}

echo "=== اكتمل الاختبار بنجاح ===\n";
