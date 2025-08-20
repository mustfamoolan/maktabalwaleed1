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
        Schema::create('incentive_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name_ar', 100); // اسم الخطة بالعربية
            $table->string('name_en', 100)->nullable(); // اسم الخطة بالإنجليزية
            $table->enum('type', ['fixed_commission', 'tiered_commission', 'target_bonus']); // نوع الخطة
            $table->text('description')->nullable(); // الوصف
            $table->json('configuration'); // إعدادات الخطة (JSON)
            $table->boolean('is_active')->default(true); // نشط/غير نشط
            $table->boolean('is_default')->default(false); // خطة افتراضية
            $table->date('effective_from')->nullable(); // فعال من تاريخ
            $table->date('effective_to')->nullable(); // فعال إلى تاريخ
            $table->text('conditions')->nullable(); // شروط تطبيق الخطة
            $table->decimal('min_sales_amount', 12, 2)->default(0); // الحد الأدنى للمبيعات
            $table->decimal('max_commission', 10, 2)->nullable(); // الحد الأقصى للعمولة
            $table->timestamps();

            // فهارس
            $table->index(['is_active', 'type']);
            $table->index(['effective_from', 'effective_to']);
            $table->index('is_default');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incentive_plans');
    }
};
