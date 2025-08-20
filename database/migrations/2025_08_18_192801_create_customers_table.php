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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_representative_id')->constrained('sales_representatives')->onDelete('restrict');
            $table->string('code', 20)->unique(); // كود العميل
            $table->string('name_ar', 150); // اسم العميل بالعربية
            $table->string('name_en', 150)->nullable(); // اسم العميل بالإنجليزية
            $table->string('contact_person', 100)->nullable(); // الشخص المسؤول
            $table->string('phone', 20)->nullable(); // رقم الهاتف
            $table->string('mobile', 20)->nullable(); // رقم الجوال
            $table->string('email', 100)->nullable(); // البريد الإلكتروني
            $table->text('address')->nullable(); // العنوان
            $table->string('city', 50)->nullable(); // المدينة
            $table->string('district', 100)->nullable(); // الحي
            $table->string('postal_code', 10)->nullable(); // الرمز البريدي
            $table->decimal('latitude', 10, 8)->nullable(); // خط العرض
            $table->decimal('longitude', 11, 8)->nullable(); // خط الطول
            $table->string('tax_number', 30)->nullable(); // الرقم الضريبي
            $table->string('commercial_record', 30)->nullable(); // السجل التجاري
            $table->enum('customer_type', ['individual', 'company'])->default('individual'); // نوع العميل
            $table->enum('pricing_tier', ['retail', 'wholesale', 'special'])->default('retail'); // مستوى التسعير
            $table->decimal('credit_limit', 15, 2)->default(0); // الحد الائتماني
            $table->integer('payment_days')->default(0); // أيام السداد
            $table->boolean('is_active')->default(true); // نشط/غير نشط
            $table->decimal('total_purchases', 15, 2)->default(0); // إجمالي المشتريات
            $table->decimal('total_payments', 15, 2)->default(0); // إجمالي المدفوعات
            $table->decimal('current_balance', 15, 2)->default(0); // الرصيد الحالي
            $table->date('last_purchase_date')->nullable(); // تاريخ آخر شراء
            $table->integer('visit_frequency')->default(0); // تكرار الزيارة (بالأيام)
            $table->date('next_visit_date')->nullable(); // تاريخ الزيارة القادمة
            $table->text('notes')->nullable(); // ملاحظات
            $table->timestamps();

            // فهارس للبحث والأداء
            $table->index(['is_active', 'sales_representative_id']);
            $table->index('code');
            $table->index('name_ar');
            $table->index('phone');
            $table->index('email');
            $table->index('customer_type');
            $table->index('pricing_tier');
            $table->index('current_balance');
            $table->index(['latitude', 'longitude']); // للبحث الجغرافي
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
