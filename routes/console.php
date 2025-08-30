<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Console\Commands\RecalculateProfits;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// تسجيل أمر إعادة حساب الأرباح
Artisan::command('profits:recalculate', function () {
    $this->comment('بدء إعادة حساب الأرباح...');

    $sales = \App\Models\Sale::with('items.product')->get();
    $updated = 0;

    foreach ($sales as $sale) {
        $totalProfit = 0;
        foreach ($sale->items as $item) {
            $profit = ($item->unit_sale_price - ($item->product->purchase_price ?? 0)) * $item->quantity;
            $totalProfit += $profit;

            // تحديث ربح الصنف
            $item->update(['profit_amount' => $profit]);
        }

        // تحديث ربح الفاتورة
        $sale->update(['total_profit' => $totalProfit]);
        $updated++;
    }

    $this->info("تم تحديث {$updated} فاتورة بنجاح");
})->purpose('إعادة حساب الأرباح لجميع الفواتير');
