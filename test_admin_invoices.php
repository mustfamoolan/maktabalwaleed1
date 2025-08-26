<?php

use Illuminate\Foundation\Application;
use App\Models\Sale;
use App\Models\Representative;
use App\Models\RepresentativeCustomer;

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== اختبار لوحة إدارة الفواتير ===\n\n";

// إحصائيات عامة
$totalSales = Sale::count();
$totalAmount = Sale::sum('total_amount');
$totalProfit = Sale::sum('total_profit');
$pendingInvoices = Sale::where('status', 'pending')->count();
$todaySales = Sale::whereDate('created_at', today())->count();
$todayAmount = Sale::whereDate('created_at', today())->sum('total_amount');

echo "📊 الإحصائيات العامة:\n";
echo "- إجمالي الفواتير: {$totalSales}\n";
echo "- إجمالي المبالغ: " . number_format($totalAmount) . " د.ع\n";
echo "- إجمالي الأرباح: " . number_format($totalProfit) . " د.ع\n";
echo "- الفواتير في الانتظار: {$pendingInvoices}\n";
echo "- مبيعات اليوم: {$todaySales}\n";
echo "- مبلغ مبيعات اليوم: " . number_format($todayAmount) . " د.ع\n\n";

// عرض آخر 5 فواتير
echo "📄 آخر 5 فواتير:\n";
$recentSales = Sale::with(['sellerRepresentative', 'customer', 'primarySupplier'])
    ->latest()
    ->take(5)
    ->get();

foreach ($recentSales as $sale) {
    echo "- فاتورة #{$sale->sale_number}\n";
    echo "  المندوب: " . ($sale->sellerRepresentative->name ?? 'غير محدد') . "\n";
    echo "  العميل: " . ($sale->customer->name ?? $sale->customer_name ?? 'عميل حاضر') . "\n";
    echo "  المورد الرئيسي: " . ($sale->primarySupplier->name ?? 'غير محدد') . "\n";
    echo "  المبلغ: " . number_format($sale->total_amount) . " د.ع\n";
    echo "  الربح: " . number_format($sale->total_profit) . " د.ع\n";
    echo "  الحالة: {$sale->status}\n";
    echo "  حالة الدفع: {$sale->payment_status}\n";
    echo "  التاريخ: " . $sale->created_at->format('Y-m-d H:i') . "\n\n";
}

// حالات الفواتير
echo "📈 توزيع الفواتير حسب الحالة:\n";
$statusCounts = Sale::select('status', \DB::raw('count(*) as count'))
    ->groupBy('status')
    ->get();

foreach ($statusCounts as $status) {
    echo "- {$status->status}: {$status->count} فاتورة\n";
}

echo "\n🎯 النظام جاهز للوصول عبر:\n";
echo "- عرض جميع الفواتير: /admin/invoices\n";
echo "- تفاصيل فاتورة معينة: /admin/invoices/{id}\n";
echo "- طباعة فاتورة: /admin/invoices/{id}/print\n";
echo "- تصدير Excel: /admin/invoices/export/excel\n\n";

echo "✅ لوحة إدارة الفواتير جاهزة للاستخدام!\n";
