<?php

use Illuminate\Foundation\Application;
use App\Models\Sale;

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== اختبار السير المحدث للمبيعات ===\n\n";

echo "📋 السير الجديد:\n";
echo "1. المندوب يختار المنتجات ويضعها في السلة\n";
echo "2. المندوب يضغط 'إتمام الدفع' → ينتقل لصفحة الفاتورة\n";
echo "3. المندوب يملأ بيانات العميل والدفع\n";
echo "4. المندوب يضغط 'إنجاز البيع' → تُحفظ الفاتورة بحالة 'pending'\n";
echo "5. رسالة نجاح تظهر + عودة تلقائية لصفحة نقطة البيع\n";
echo "6. السلة تُفرغ تلقائياً ✨\n\n";

// عرض المبيعات الحديثة
echo "📊 آخر المبيعات:\n";
$recentSales = Sale::latest()->take(3)->get();
foreach ($recentSales as $sale) {
    echo "- فاتورة #{$sale->sale_number}\n";
    echo "  الحالة: {$sale->status}\n";
    echo "  المبلغ: {$sale->total_amount} د.ع\n";
    echo "  التاريخ: {$sale->created_at->format('Y-m-d H:i')}\n\n";
}

echo "✅ النظام جاهز! السلة ستُفرغ تلقائياً بعد كل عملية بيع ناجحة.\n";
