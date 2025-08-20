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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('supplier_categories')->onDelete('restrict');
            $table->string('code', 20)->unique(); // كود المورد
            $table->string('name_ar', 150); // اسم المورد بالعربية
            $table->string('name_en', 150)->nullable(); // اسم المورد بالإنجليزية
            $table->string('contact_person', 100)->nullable(); // الشخص المسؤول
            $table->string('phone', 20)->nullable(); // رقم الهاتف
            $table->string('mobile', 20)->nullable(); // رقم الجوال
            $table->string('email', 100)->nullable(); // البريد الإلكتروني
            $table->text('address')->nullable(); // العنوان
            $table->string('city', 50)->nullable(); // المدينة
            $table->string('country', 50)->default('Saudi Arabia'); // البلد
            $table->string('tax_number', 30)->nullable(); // الرقم الضريبي
            $table->string('commercial_record', 30)->nullable(); // السجل التجاري
            $table->decimal('credit_limit', 15, 2)->default(0); // الحد الائتماني
            $table->integer('payment_days')->default(30); // أيام السداد
            $table->decimal('commission_rate', 5, 2)->nullable(); // نسبة العمولة الخاصة
            $table->boolean('is_active')->default(true); // نشط/غير نشط
            $table->integer('evaluation_score')->default(0); // نقاط التقييم
            $table->decimal('total_purchases', 15, 2)->default(0); // إجمالي المشتريات
            $table->decimal('total_returns', 15, 2)->default(0); // إجمالي المرتجعات
            $table->text('notes')->nullable(); // ملاحظات
            $table->timestamps();

            // فهارس للبحث والأداء
            $table->index(['is_active', 'category_id']);
            $table->index('code');
            $table->index('name_ar');
            $table->index('email');
            $table->index('evaluation_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
