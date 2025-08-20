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
        Schema::create('commission_calculations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_representative_id')->constrained('sales_representatives')->onDelete('cascade');
            $table->foreignId('invoice_id')->constrained('invoices')->onDelete('cascade');
            $table->string('calculation_period', 20); // فترة الحساب (monthly, quarterly, annual)
            $table->integer('period_year'); // السنة
            $table->integer('period_month')->nullable(); // الشهر
            $table->integer('period_quarter')->nullable(); // الربع
            $table->decimal('sales_amount', 15, 2); // مبلغ المبيعات
            $table->decimal('commission_rate', 5, 2); // نسبة العمولة المطبقة
            $table->decimal('base_commission', 10, 2)->default(0); // العمولة الأساسية
            $table->decimal('tier_bonus', 10, 2)->default(0); // مكافأة المستوى
            $table->decimal('target_bonus', 10, 2)->default(0); // مكافأة الهدف
            $table->decimal('total_commission', 10, 2); // إجمالي العمولة
            $table->enum('status', ['calculated', 'approved', 'paid'])->default('calculated'); // الحالة
            $table->date('calculation_date'); // تاريخ الحساب
            $table->date('approval_date')->nullable(); // تاريخ الاعتماد
            $table->date('payment_date')->nullable(); // تاريخ الدفع
            $table->foreignId('approved_by')->nullable()->constrained('admin_users')->onDelete('restrict');
            $table->foreignId('paid_by')->nullable()->constrained('admin_users')->onDelete('restrict');
            $table->json('calculation_details'); // تفاصيل الحساب
            $table->text('notes')->nullable(); // ملاحظات
            $table->timestamps();

            // فهارس للبحث والأداء
            $table->index(['sales_representative_id', 'period_year', 'period_month'], 'idx_comm_rep_period');
            $table->index(['calculation_period', 'period_year'], 'idx_comm_period');
            $table->index('status');
            $table->index('total_commission');
            $table->index('calculation_date');

            // فهرس مركب لمنع التكرار
            $table->unique(['sales_representative_id', 'invoice_id', 'calculation_period', 'period_year', 'period_month'], 'unique_commission_calc');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commission_calculations');
    }
};
