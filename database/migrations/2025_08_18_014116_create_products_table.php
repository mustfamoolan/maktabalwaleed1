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
            $table->foreignId('supplier_type_id')->constrained('supplier_types'); // نوع المنتج
            $table->foreignId('supplier_id')->constrained('suppliers'); // المورد
            $table->decimal('purchase_price', 10, 2); // سعر الشراء
            $table->decimal('selling_price', 10, 2); // سعر البيع
            $table->integer('cartons_count'); // عدد الكراتين
            $table->integer('units_per_carton'); // عدد العلب في الكارتون
            $table->decimal('weight', 8, 2)->nullable(); // الوزن
            $table->string('barcode')->unique(); // الباركود
            $table->date('purchase_date'); // تاريخ دخول المنتج
            $table->string('image')->nullable(); // صورة المنتج
            $table->boolean('is_active')->default(true); // حالة النشاط
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
