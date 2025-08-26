<?php

use Illuminate\Foundation\Application;
use App\Models\Product;
use App\Models\Sale;

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== تحقق من النظام المحسن ===\n";
echo "عدد المنتجات: " . Product::count() . "\n";
echo "عدد المبيعات: " . Sale::count() . "\n";

$product = Product::with('supplier')->first();
if ($product) {
    echo "منتج نموذجي: " . $product->name_ar . "\n";
    echo "المورد: " . ($product->supplier ? $product->supplier->name : 'غير محدد') . "\n";
    echo "سعر التكلفة: " . $product->cost_price . "\n";
    echo "سعر البيع: " . $product->selling_price . "\n";
}

$sale = Sale::with(['primarySupplier', 'primaryCategory'])->latest()->first();
if ($sale) {
    echo "\nآخر فاتورة: " . $sale->sale_number . "\n";
    echo "الحالة: " . $sale->status . "\n";
    echo "المورد الرئيسي: " . ($sale->primarySupplier ? $sale->primarySupplier->name : 'غير محدد') . "\n";
    echo "القسم الرئيسي: " . ($sale->primaryCategory ? $sale->primaryCategory->name : 'غير محدد') . "\n";
    echo "إجمالي الربح: " . $sale->total_profit . "\n";
}

echo "\n=== النظام جاهز للاستخدام ===\n";
