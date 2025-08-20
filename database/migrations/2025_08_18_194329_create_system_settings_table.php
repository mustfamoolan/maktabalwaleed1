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
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique(); // مفتاح الإعداد
            $table->text('value'); // قيمة الإعداد
            $table->string('type', 20)->default('string'); // نوع البيانات (string, number, boolean, json)
            $table->string('category', 50)->default('general'); // فئة الإعداد
            $table->string('name_ar', 200); // اسم الإعداد بالعربية
            $table->string('name_en', 200)->nullable(); // اسم الإعداد بالإنجليزية
            $table->text('description_ar')->nullable(); // وصف الإعداد بالعربية
            $table->text('description_en')->nullable(); // وصف الإعداد بالإنجليزية
            $table->text('validation_rules')->nullable(); // قواعد التحقق
            $table->text('options')->nullable(); // الخيارات المتاحة (للقوائم)
            $table->boolean('is_public')->default(false); // متاح للعرض العام
            $table->boolean('is_editable')->default(true); // قابل للتعديل
            $table->integer('sort_order')->default(0); // ترتيب العرض
            $table->foreignId('updated_by')->nullable()->constrained('admin_users')->onDelete('set null');
            $table->timestamps();

            // فهارس
            $table->index('category');
            $table->index(['category', 'sort_order']);
            $table->index('is_public');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
