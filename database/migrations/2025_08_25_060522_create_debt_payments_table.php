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
        Schema::create('debt_payments', function (Blueprint $table) {
            $table->id();

            // ربط الدفعة بالدين
            $table->foreignId('debt_id')->constrained('debts')->cascadeOnDelete(); // الدين المرتبط
            $table->string('payment_number')->unique(); // رقم الدفعة الفريد

            // تفاصيل الدفعة
            $table->decimal('amount', 15, 2); // مبلغ الدفعة
            $table->enum('payment_method', ['cash', 'transfer', 'check', 'card'])->default('cash'); // طريقة الدفع

            // معلومات إضافية للدفع
            $table->string('reference_number')->nullable(); // رقم المرجع (للحوالات أو الشيكات)
            $table->text('notes')->nullable(); // ملاحظات على الدفعة

            // تسجيل من قام بالعملية
            $table->foreignId('received_by_representative_id')->constrained('representatives'); // المندوب الذي استلم الدفعة

            // تواريخ مهمة
            $table->timestamp('payment_date')->useCurrent(); // تاريخ الدفعة
            $table->date('value_date')->nullable(); // تاريخ القيمة (للشيكات المؤجلة)

            $table->timestamps();

            // فهارس للبحث
            $table->index(['debt_id', 'payment_date']);
            $table->index(['received_by_representative_id', 'payment_date']);
            $table->index('payment_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debt_payments');
    }
};
