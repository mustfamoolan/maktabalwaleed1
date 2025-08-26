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
        Schema::create('debts', function (Blueprint $table) {
            $table->id();

            // ربط الدين بالبيع
            $table->foreignId('sale_id')->constrained('sales')->cascadeOnDelete(); // البيع المرتبط
            $table->string('debt_number')->unique(); // رقم الدين الفريد

            // المدين
            $table->enum('debtor_type', ['customer', 'representative']); // نوع المدين
            $table->foreignId('customer_id')->nullable()->constrained('representative_customers')->nullOnDelete(); // العميل المدين
            $table->foreignId('representative_id')->nullable()->constrained('representatives')->nullOnDelete(); // المندوب المدين

            // تفاصيل الدين
            $table->decimal('original_amount', 15, 2); // المبلغ الأصلي للدين
            $table->decimal('paid_amount', 15, 2)->default(0); // المبلغ المدفوع من الدين
            $table->decimal('remaining_amount', 15, 2); // المبلغ المتبقي

            // حالة وتواريخ الدين
            $table->enum('status', ['active', 'paid', 'partially_paid', 'cancelled', 'overdue'])->default('active'); // حالة الدين
            $table->date('due_date'); // تاريخ الاستحقاق
            $table->date('last_payment_date')->nullable(); // تاريخ آخر دفعة

            // معلومات إضافية
            $table->text('notes')->nullable(); // ملاحظات
            $table->integer('payment_reminders_sent')->default(0); // عدد التذكيرات المرسلة

            $table->timestamps();

            // فهارس للبحث السريع
            $table->index(['debtor_type', 'customer_id']);
            $table->index(['debtor_type', 'representative_id']);
            $table->index(['status', 'due_date']);
            $table->index('debt_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debts');
    }
};
