<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();

            // ربط البيع والمنتج
            $table->foreignId('sale_id')->constrained('sales')->cascadeOnDelete(); // البيع
            $table->foreignId('product_id')->constrained('products'); // المنتج

            // تفاصيل البيع للمنتج
            $table->integer('quantity'); // الكمية المباعة
            $table->decimal('unit_cost_price', 15, 2); // سعر التكلفة للوحدة (من جدول المنتجات)
            $table->decimal('unit_sale_price', 15, 2); // سعر البيع الفعلي للوحدة
            $table->decimal('unit_discount', 15, 2)->default(0); // خصم على الوحدة

            // حسابات المبالغ
            $table->decimal('total_cost', 15, 2); // إجمالي التكلفة (quantity * unit_cost_price)
            $table->decimal('total_sale', 15, 2); // إجمالي البيع قبل الخصم (quantity * unit_sale_price)
            $table->decimal('total_discount', 15, 2)->default(0); // إجمالي الخصم (quantity * unit_discount)
            $table->decimal('final_total', 15, 2); // المبلغ النهائي (total_sale - total_discount)
            $table->decimal('profit_amount', 15, 2); // الربح (final_total - total_cost)

            // معلومات إضافية
            $table->text('notes')->nullable(); // ملاحظات على المنتج

            $table->timestamps();

            // فهارس للبحث
            $table->index(['sale_id', 'product_id']);
            $table->index(['product_id', 'created_at']); // لتتبع مبيعات المنتج
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_items');
    }
};
