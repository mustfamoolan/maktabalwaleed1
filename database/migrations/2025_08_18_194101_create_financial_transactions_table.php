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
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['income', 'expense', 'capital_addition', 'capital_withdrawal', 'profit_distribution']); // نوع المعاملة
            $table->enum('category', ['sales', 'purchase', 'commission', 'salary', 'rent', 'utilities', 'marketing', 'other']); // فئة المعاملة
            $table->string('reference_type', 50)->nullable(); // نوع المرجع (invoice, commission, etc.)
            $table->unsignedBigInteger('reference_id')->nullable(); // معرف المرجع
            $table->string('transaction_number', 30)->unique(); // رقم المعاملة
            $table->date('transaction_date'); // تاريخ المعاملة
            $table->decimal('amount', 15, 2); // المبلغ
            $table->string('currency', 3)->default('SAR'); // العملة
            $table->text('description'); // الوصف
            $table->enum('payment_method', ['cash', 'bank_transfer', 'check', 'card'])->nullable(); // طريقة الدفع
            $table->string('account_number', 30)->nullable(); // رقم الحساب
            $table->string('reference_number', 50)->nullable(); // رقم المرجع الخارجي
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('confirmed'); // الحالة
            $table->foreignId('created_by')->constrained('admin_users')->onDelete('restrict'); // المُدخِل
            $table->foreignId('approved_by')->nullable()->constrained('admin_users')->onDelete('restrict'); // المعتمِد
            $table->timestamp('approved_at')->nullable(); // وقت الاعتماد
            $table->text('notes')->nullable(); // ملاحظات
            $table->json('attachments')->nullable(); // المرفقات
            $table->timestamps();

            // فهارس للبحث والأداء
            $table->index(['type', 'transaction_date']);
            $table->index(['category', 'transaction_date']);
            $table->index('transaction_number');
            $table->index(['reference_type', 'reference_id']);
            $table->index('status');
            $table->index('amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_transactions');
    }
};
