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
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('restrict');
            $table->string('code', 30)->unique(); // كود المنتج
            $table->string('barcode', 50)->unique()->nullable(); // الباركود
            $table->string('name_ar', 200); // اسم المنتج بالعربية
            $table->string('name_en', 200)->nullable(); // اسم المنتج بالإنجليزية
            $table->text('description')->nullable(); // الوصف
            $table->string('category', 100)->nullable(); // فئة المنتج
            $table->string('brand', 100)->nullable(); // العلامة التجارية
            $table->string('unit', 20)->default('piece'); // وحدة القياس
            $table->decimal('purchase_price', 10, 2); // سعر الشراء
            $table->decimal('selling_price', 10, 2); // سعر البيع
            $table->decimal('wholesale_price', 10, 2)->nullable(); // سعر الجملة
            $table->decimal('min_selling_price', 10, 2)->nullable(); // أقل سعر بيع
            $table->integer('current_stock')->default(0); // الكمية الحالية
            $table->integer('min_stock_level')->default(0); // الحد الأدنى للمخزون
            $table->integer('max_stock_level')->default(0); // الحد الأقصى للمخزون
            $table->decimal('weight', 8, 2)->nullable(); // الوزن
            $table->string('dimensions', 50)->nullable(); // الأبعاد
            $table->boolean('is_active')->default(true); // نشط/غير نشط
            $table->boolean('track_stock')->default(true); // تتبع المخزون
            $table->string('image_path')->nullable(); // مسار الصورة
            $table->decimal('tax_rate', 5, 2)->default(15); // نسبة الضريبة
            $table->date('expiry_date')->nullable(); // تاريخ الانتهاء
            $table->text('notes')->nullable(); // ملاحظات
            $table->timestamps();

            // فهارس للبحث والأداء
            $table->index(['is_active', 'supplier_id']);
            $table->index('code');
            $table->index('barcode');
            $table->index('name_ar');
            $table->index('category');
            $table->index('current_stock');
            $table->index(['current_stock', 'min_stock_level']); // للتنبيهات
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
