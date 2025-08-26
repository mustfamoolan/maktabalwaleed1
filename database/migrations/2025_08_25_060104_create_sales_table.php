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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();

            // بيانات البيع الأساسية
            $table->string('sale_number')->unique(); // رقم البيع الفريد
            $table->enum('sale_type', ['customer', 'representative', 'cash']); // نوع البيع

            // الأطراف المعنية
            $table->foreignId('seller_representative_id')->constrained('representatives'); // المندوب البائع
            $table->foreignId('customer_id')->nullable()->constrained('representative_customers')->nullOnDelete(); // العميل (إختياري)
            $table->foreignId('buyer_representative_id')->nullable()->constrained('representatives')->nullOnDelete(); // المندوب المشتري (إختياري)

            // معلومات البيع والأسعار
            $table->decimal('total_amount', 15, 2); // إجمالي المبلغ
            $table->decimal('paid_amount', 15, 2)->default(0); // المبلغ المدفوع
            $table->decimal('remaining_amount', 15, 2)->default(0); // المبلغ المتبقي (دين)
            $table->decimal('discount_amount', 15, 2)->default(0); // مبلغ الخصم

            // حالة الدفع والبيع
            $table->enum('payment_status', ['paid', 'partial', 'debt', 'cancelled'])->default('paid'); // حالة الدفع
            $table->enum('sale_status', ['completed', 'pending', 'cancelled'])->default('completed'); // حالة البيع

            // معلومات إضافية
            $table->text('notes')->nullable(); // ملاحظات
            $table->string('customer_name')->nullable(); // اسم العميل للبيع الحاضر
            $table->string('customer_phone')->nullable(); // هاتف العميل للبيع الحاضر

            // تواريخ مهمة
            $table->timestamp('sale_date')->useCurrent(); // تاريخ البيع
            $table->date('due_date')->nullable(); // تاريخ الاستحقاق للدين

            $table->timestamps();

            // فهارس للبحث السريع
            $table->index(['seller_representative_id', 'sale_date']);
            $table->index(['customer_id', 'sale_date']);
            $table->index(['payment_status', 'sale_date']);
            $table->index('sale_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
