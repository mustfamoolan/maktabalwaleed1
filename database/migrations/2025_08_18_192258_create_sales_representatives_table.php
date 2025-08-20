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
        Schema::create('sales_representatives', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique(); // كود المندوب
            $table->string('name_ar', 100); // الاسم بالعربية
            $table->string('name_en', 100)->nullable(); // الاسم بالإنجليزية
            $table->string('phone', 20)->unique(); // رقم الهاتف (للدخول)
            $table->string('email', 100)->unique()->nullable(); // البريد الإلكتروني
            $table->string('password'); // كلمة المرور
            $table->string('national_id', 20)->unique(); // رقم الهوية
            $table->text('address')->nullable(); // العنوان
            $table->string('city', 50)->nullable(); // المدينة
            $table->date('hire_date'); // تاريخ التوظيف
            $table->date('birth_date')->nullable(); // تاريخ الميلاد
            $table->decimal('base_salary', 10, 2)->default(0); // الراتب الأساسي
            $table->enum('incentive_plan', ['fixed_commission', 'tiered_commission', 'target_bonus'])->default('fixed_commission'); // نوع خطة الحوافز
            $table->json('incentive_settings')->nullable(); // إعدادات خطة الحوافز
            $table->decimal('monthly_target', 12, 2)->default(0); // الهدف الشهري
            $table->decimal('quarterly_target', 12, 2)->default(0); // الهدف الربعي
            $table->decimal('annual_target', 12, 2)->default(0); // الهدف السنوي
            $table->string('bank_account', 30)->nullable(); // رقم الحساب البنكي
            $table->string('bank_name', 100)->nullable(); // اسم البنك
            $table->string('iban', 30)->nullable(); // الآيبان
            $table->boolean('is_active')->default(true); // نشط/غير نشط
            $table->decimal('total_sales', 15, 2)->default(0); // إجمالي المبيعات
            $table->decimal('total_commission', 15, 2)->default(0); // إجمالي العمولات
            $table->integer('total_customers')->default(0); // عدد العملاء
            $table->decimal('avg_monthly_sales', 12, 2)->default(0); // متوسط المبيعات الشهرية
            $table->text('notes')->nullable(); // ملاحظات
            $table->timestamps();

            // فهارس للبحث والأداء
            $table->index(['is_active', 'incentive_plan']);
            $table->index('code');
            $table->index('phone');
            $table->index('email');
            $table->index('national_id');
            $table->index('total_sales');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_representatives');
    }
};
