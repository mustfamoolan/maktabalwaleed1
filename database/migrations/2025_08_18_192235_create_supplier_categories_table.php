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
        Schema::create('supplier_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name_ar', 100); // الاسم بالعربية
            $table->string('name_en', 100)->nullable(); // الاسم بالإنجليزية
            $table->text('description')->nullable(); // الوصف
            $table->boolean('is_active')->default(true); // نشط/غير نشط
            $table->decimal('commission_rate', 5, 2)->default(0); // نسبة العمولة الافتراضية
            $table->string('color_code', 7)->default('#007bff'); // لون الفئة للواجهة
            $table->integer('sort_order')->default(0); // ترتيب العرض
            $table->timestamps();

            // فهارس للبحث السريع
            $table->index(['is_active', 'sort_order']);
            $table->index('name_ar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_categories');
    }
};
