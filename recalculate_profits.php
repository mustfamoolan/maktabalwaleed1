<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;

try {
    echo "=== إعادة حساب الأرباح للفواتير الموجودة ===\n\n";

    // احضار جميع الفواتير
    $sales = Sale::all();
    $updated = 0;

    foreach ($sales as $sale) {
        $totalProfit = 0;

        // احضار أصناف الفاتورة
        $items = SaleItem::where('sale_id', $sale->id)->get();

        foreach ($items as $item) {
            // احضار المنتج
            $product = Product::find($item->product_id);

            if ($product) {
                // حساب الربح الصحيح: (سعر البيع - سعر الشراء) × الكمية
                $itemProfit = ($item->unit_sale_price - $product->purchase_price) * $item->quantity;
                $totalProfit += $itemProfit;

                // تحديث ربح الصنف
                $item->update([
                    'profit_amount' => $itemProfit,
                    'unit_cost_price' => $product->purchase_price
                ]);
            }
        }

        // تحديث إجمالي ربح الفاتورة
        $sale->update(['total_profit' => $totalProfit]);

        echo "فاتورة {$sale->sale_number}: الربح الجديد = {$totalProfit}\n";
        $updated++;
    }

    echo "\nتم تحديث {$updated} فاتورة بنجاح!\n";

} catch (Exception $e) {
    echo "خطأ: " . $e->getMessage() . "\n";
    echo "التفاصيل: " . $e->getTraceAsString() . "\n";
}
