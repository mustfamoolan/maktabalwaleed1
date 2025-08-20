<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Supplier;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = Supplier::all();

        if ($suppliers->isEmpty()) {
            $this->command->warn('لا توجد موردين! يرجى تشغيل SupplierSeeder أولاً');
            return;
        }

        // الحصول على فئات الموردين
        $categories = \App\Models\SupplierCategory::all();
        $foodCategory = $categories->where('name_ar', 'مواد غذائية')->first();
        $beverageCategory = $categories->where('name_ar', 'مشروبات')->first();
        $cleaningCategory = $categories->where('name_ar', 'منظفات')->first();

        $products = [
            [
                'supplier_id' => $suppliers->first()->id,
                'code' => 'PRD001',
                'name_ar' => 'أرز أبو كاس 10 كيلو',
                'name_en' => 'Abu Kas Rice 10kg',
                'description' => 'أرز بسمتي عالي الجودة مستورد من الهند',
                'barcode' => 'PRD20250820001',
                'barcode_type' => 'auto',
                'cost_price' => 45.00,
                'purchase_price' => 45.00,
                'selling_price' => 55.00,
                'wholesale_price' => 50.00,
                'profit_margin' => 10.00,
                'stock_quantity' => 50,
                'current_stock' => 50,
                'min_stock_level' => 10,
                'max_stock_level' => 100,
                'unit' => 'كرتونة',
                'category_id' => $foodCategory?->id,
                'brand' => 'أبو كاس',
                'weight' => 10.0,
                'is_active' => true,
                'track_stock' => true,
                'tax_rate' => 15.0,
                'expiry_date' => now()->addMonths(12),
                'barcode_generated_at' => now(),
                'notes' => 'منتج عالي الجودة'
            ],
            [
                'supplier_id' => $suppliers->count() > 1 ? $suppliers->skip(1)->first()->id : $suppliers->first()->id,
                'code' => 'PRD002',
                'name_ar' => 'زيت الطبخ الذهبي 1.8 لتر',
                'name_en' => 'Golden Cooking Oil 1.8L',
                'description' => 'زيت طبخ نباتي عالي الجودة',
                'barcode' => 'PRD20250820002',
                'barcode_type' => 'manual',
                'cost_price' => 12.00,
                'purchase_price' => 12.00,
                'selling_price' => 15.50,
                'wholesale_price' => 14.00,
                'profit_margin' => 3.50,
                'stock_quantity' => 30,
                'current_stock' => 30,
                'min_stock_level' => 5,
                'max_stock_level' => 60,
                'unit' => 'قطعة',
                'category_id' => $foodCategory?->id,
                'brand' => 'الذهبي',
                'weight' => 1.8,
                'is_active' => true,
                'track_stock' => true,
                'tax_rate' => 15.0,
                'expiry_date' => now()->addMonths(18),
                'barcode_generated_at' => now(),
                'notes' => 'مناسب للقلي والطبخ'
            ],
            [
                'supplier_id' => $suppliers->first()->id,
                'code' => 'PRD003',
                'name_ar' => 'سكر ابيض ناعم 50 كيلو',
                'name_en' => 'Fine White Sugar 50kg',
                'description' => 'سكر أبيض ناعم عالي النقاوة',
                'barcode' => 'PRD20250820003',
                'barcode_type' => 'auto',
                'cost_price' => 85.00,
                'purchase_price' => 85.00,
                'selling_price' => 95.00,
                'wholesale_price' => 90.00,
                'profit_margin' => 10.00,
                'stock_quantity' => 20,
                'current_stock' => 20,
                'min_stock_level' => 5,
                'max_stock_level' => 40,
                'unit' => 'شيكارة',
                'category_id' => $foodCategory?->id,
                'brand' => 'السعودي',
                'weight' => 50.0,
                'is_active' => true,
                'track_stock' => true,
                'tax_rate' => 15.0,
                'expiry_date' => null,
                'barcode_generated_at' => now()
            ],
            [
                'supplier_id' => $suppliers->first()->id,
                'code' => 'PRD004',
                'name_ar' => 'شاي ليبتون اصفر 100 ظرف',
                'name_en' => 'Lipton Yellow Tea 100 Bags',
                'description' => 'شاي ليبتون الأصفر بالأظرف',
                'barcode' => 'LIP100BAGS001',
                'barcode_type' => 'manual',
                'cost_price' => 18.00,
                'purchase_price' => 18.00,
                'selling_price' => 22.00,
                'wholesale_price' => 20.00,
                'profit_margin' => 4.00,
                'stock_quantity' => 8,
                'current_stock' => 8,
                'min_stock_level' => 10,
                'max_stock_level' => 50,
                'unit' => 'علبة',
                'category_id' => $beverageCategory?->id,
                'brand' => 'ليبتون',
                'weight' => 0.5,
                'is_active' => true,
                'track_stock' => true,
                'tax_rate' => 15.0,
                'expiry_date' => now()->addMonths(24),
                'barcode_generated_at' => now(),
                'notes' => 'مخزون منخفض - يحتاج إعادة طلب'
            ],
            [
                'supplier_id' => $suppliers->first()->id,
                'code' => 'PRD005',
                'name_ar' => 'مكرونة باستا نودلز 500 جرام',
                'name_en' => 'Pasta Noodles 500g',
                'description' => 'مكرونة إيطالية عالية الجودة',
                'barcode' => 'PASTA500G001',
                'barcode_type' => 'manual',
                'cost_price' => 3.50,
                'purchase_price' => 3.50,
                'selling_price' => 5.00,
                'wholesale_price' => 4.50,
                'profit_margin' => 1.50,
                'stock_quantity' => 0,
                'current_stock' => 0,
                'min_stock_level' => 20,
                'max_stock_level' => 100,
                'unit' => 'علبة',
                'category_id' => $foodCategory?->id,
                'brand' => 'إيطاليانو',
                'weight' => 0.5,
                'is_active' => true,
                'track_stock' => true,
                'tax_rate' => 15.0,
                'expiry_date' => now()->addMonths(36),
                'barcode_generated_at' => now(),
                'notes' => 'نفذ المخزون! يحتاج طلب فوري'
            ]
        ];

        foreach ($products as $productData) {
            Product::create($productData);
        }

        $this->command->info('تم إنشاء ' . count($products) . ' منتج تجريبي بنجاح!');
    }
}
