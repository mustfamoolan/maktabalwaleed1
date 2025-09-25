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
        Schema::create('purchase_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_invoice_id')->constrained()->onDelete('cascade'); // ربط بالفاتورة
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null'); // ربط بالمنتج
            $table->string('product_name'); // اسم المنتج
            $table->string('supplier_name')->nullable(); // اسم المورد
            $table->string('category_name')->nullable(); // اسم الصنف
            $table->decimal('purchase_price', 10, 2); // سعر الشراء
            $table->decimal('purchase_price_after_cost', 10, 2)->default(0); // سعر الشراء بعد التكلفة
            $table->decimal('sale_price', 10, 2); // سعر البيع
            $table->decimal('wholesale_price', 10, 2); // سعر البيع جملة
            $table->integer('quantity'); // العدد
            $table->decimal('total_price', 12, 2); // المجموع (العدد × سعر الشراء)
            $table->decimal('allocated_cost', 10, 2)->default(0); // التكلفة المخصصة لهذا المنتج
            $table->text('notes')->nullable(); // ملاحظات على المنتج
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_invoice_items');
    }
};
