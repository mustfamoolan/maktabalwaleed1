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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // اسم المنتج
            $table->string('code')->unique(); // كود المنتج
            $table->string('image')->nullable(); // صورة المنتج
            $table->integer('stock_quantity')->default(0); // عدد المتوفر
            $table->integer('pieces_per_carton'); // عدد القطع داخل الكارتون
            $table->decimal('piece_weight', 8, 2); // وزن القطعة الواحدة (جرام)
            $table->decimal('carton_weight', 8, 3); // وزن الكارتون (كيلوجرام)
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade'); // المورد
            $table->foreignId('category_id')->constrained()->onDelete('cascade'); // الفئة
            $table->decimal('purchase_price', 10, 2); // سعر الشراء
            $table->decimal('sale_price', 10, 2); // سعر البيع
            $table->date('last_purchase_date')->nullable(); // تاريخ آخر شراء
            $table->date('last_sale_date')->nullable(); // تاريخ آخر بيع
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
