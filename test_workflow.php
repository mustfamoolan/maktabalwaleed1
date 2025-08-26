<?php

use Illuminate\Foundation\Application;
use App\Models\Sale;

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== اختبار سير العمل الجديد ===\n\n";

// عرض المبيعات الحالية مع حالاتها
echo "المبيعات الحالية:\n";
$sales = Sale::latest()->take(5)->get();
foreach ($sales as $sale) {
    echo "- فاتورة #{$sale->sale_number}\n";
    echo "  الحالة: {$sale->status}\n";
    echo "  تاريخ الإنشاء: {$sale->created_at->format('Y-m-d H:i')}\n";
    echo "  تاريخ الإرسال: " . ($sale->sent_at ? $sale->sent_at->format('Y-m-d H:i') : 'لم يتم الإرسال بعد') . "\n\n";
}

echo "=== سير العمل المطلوب ===\n";
echo "1. المندوب ينجز البيع → حالة 'created'\n";
echo "2. المندوب يضغط 'إرسال الفاتورة' → حالة 'pending' (الانتظار)\n";
echo "3. فريق التجهيز يبدأ العمل → حالة 'preparing'\n";
echo "4. الفاتورة جاهزة للتسليم → حالة 'ready_for_delivery'\n";
echo "5. مع السائق → حالة 'out_for_delivery'\n";
echo "6. تم التسليم → حالة 'delivered'\n";
echo "7. موافقة العميل → حالة 'completed'\n\n";

echo "النظام جاهز للاختبار! 🚀\n";
