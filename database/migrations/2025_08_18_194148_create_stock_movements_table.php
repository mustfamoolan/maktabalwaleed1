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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict');
            $table->enum('movement_type', ['in', 'out', 'adjustment', 'transfer']); // نوع الحركة
            $table->enum('source_type', ['purchase', 'sale', 'return', 'adjustment', 'initial', 'transfer']); // مصدر الحركة
            $table->string('reference_type', 50)->nullable(); // نوع المرجع
            $table->unsignedBigInteger('reference_id')->nullable(); // معرف المرجع
            $table->string('reference_number', 50)->nullable(); // رقم المرجع
            $table->integer('quantity'); // الكمية (موجبة للداخل، سالبة للخارج)
            $table->integer('quantity_before'); // الكمية قبل الحركة
            $table->integer('quantity_after'); // الكمية بعد الحركة
            $table->decimal('unit_cost', 10, 2)->nullable(); // تكلفة الوحدة
            $table->decimal('total_cost', 12, 2)->nullable(); // التكلفة الإجمالية
            $table->date('movement_date'); // تاريخ الحركة
            $table->string('batch_number', 50)->nullable(); // رقم الدفعة
            $table->date('expiry_date')->nullable(); // تاريخ انتهاء الصلاحية
            $table->string('location', 100)->default('main_warehouse'); // الموقع
            $table->text('reason')->nullable(); // السبب (للتسويات)
            $table->foreignId('created_by')->constrained('admin_users')->onDelete('restrict'); // المُدخِل
            $table->text('notes')->nullable(); // ملاحظات
            $table->timestamps();

            // فهارس للبحث والأداء
            $table->index(['product_id', 'movement_date']);
            $table->index(['movement_type', 'movement_date']);
            $table->index(['source_type', 'movement_date']);
            $table->index(['reference_type', 'reference_id']);
            $table->index('reference_number');
            $table->index('batch_number');
            $table->index('location');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
