<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;

class RecalculateProfits extends Command
{
    protected $signature = 'profits:recalculate';
    protected $description = 'إعادة حساب الأرباح لجميع الفواتير';

    public function handle()
    {
        $this->info('بدء إعادة حساب الأرباح...');

        $sales = Sale::all();
        $updated = 0;

        $bar = $this->output->createProgressBar($sales->count());

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

            $updated++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("تم تحديث {$updated} فاتورة بنجاح!");

        return 0;
    }
}
