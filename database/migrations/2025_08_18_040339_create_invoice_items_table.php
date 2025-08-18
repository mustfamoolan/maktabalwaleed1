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
            $table->foreignId('invoice_id')->constrained('invoices')->onDelete('cascade'); // الفاتورة
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade'); // المنتج
            $table->integer('cartons_quantity'); // عدد الكراتين
            $table->integer('units_per_carton'); // عدد الوحدات في الكارتون (نسخة من المنتج)
            $table->integer('total_units'); // إجمالي الوحدات (cartons_quantity * units_per_carton)
            $table->decimal('unit_price', 10, 2); // سعر الوحدة (نسخة من سعر البيع)
            $table->decimal('carton_price', 10, 2); // سعر الكارتون
            $table->decimal('total_price', 12, 2); // السعر الإجمالي للمنتج
            $table->timestamps();

            // فهارس
            $table->index('invoice_id', 'invoice_items_invoice_idx');
            $table->index('product_id', 'invoice_items_product_idx');
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
