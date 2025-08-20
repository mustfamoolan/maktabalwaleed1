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
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict');
            $table->string('product_code', 30); // كود المنتج (نسخة ثابتة)
            $table->string('product_name', 200); // اسم المنتج (نسخة ثابتة)
            $table->string('product_barcode', 50)->nullable(); // باركود المنتج
            $table->integer('quantity'); // الكمية
            $table->decimal('unit_price', 10, 2); // سعر الوحدة
            $table->decimal('discount_percentage', 5, 2)->default(0); // نسبة الخصم
            $table->decimal('discount_amount', 10, 2)->default(0); // مبلغ الخصم
            $table->decimal('tax_rate', 5, 2)->default(15); // نسبة الضريبة
            $table->decimal('tax_amount', 10, 2)->default(0); // مبلغ الضريبة
            $table->decimal('total_amount', 12, 2); // المبلغ الإجمالي للسطر
            $table->decimal('cost_price', 10, 2)->nullable(); // سعر التكلفة (للربحية)
            $table->decimal('profit_amount', 10, 2)->nullable(); // مبلغ الربح
            $table->decimal('commission_rate', 5, 2)->default(0); // نسبة العمولة
            $table->decimal('commission_amount', 10, 2)->default(0); // مبلغ العمولة
            $table->text('notes')->nullable(); // ملاحظات
            $table->timestamps();

            // فهارس للبحث والأداء
            $table->index(['invoice_id', 'product_id']);
            $table->index('product_code');
            $table->index('product_barcode');
            $table->index('total_amount');
            $table->index('commission_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
