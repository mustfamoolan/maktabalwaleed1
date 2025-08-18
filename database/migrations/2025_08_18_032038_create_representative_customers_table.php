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
        Schema::create('representative_customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('representative_id')->constrained('representatives')->onDelete('cascade');
            $table->string('customer_name');
            $table->string('phone')->nullable();
            $table->text('address');
            $table->string('governorate'); // المحافظة
            $table->string('city'); // المدينة
            $table->string('nearest_landmark')->nullable(); // أقرب نقطة دالة
            $table->decimal('total_debt', 12, 2)->default(0); // إجمالي الدين
            $table->decimal('total_paid', 12, 2)->default(0); // إجمالي المدفوع
            $table->date('debt_due_date')->nullable(); // تاريخ استحقاق الدين
            $table->integer('completed_invoices')->default(0); // الفواتير المكتملة
            $table->integer('cancelled_invoices')->default(0); // الفواتير الملغية
            $table->integer('returned_invoices')->default(0); // الفواتير المسترجعة
            $table->integer('total_purchases')->default(0); // عدد المشتريات
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            // فهارس
            $table->index(['representative_id', 'status'], 'rep_cust_status_idx');
            $table->index('governorate', 'rep_cust_gov_idx');
            $table->index('debt_due_date', 'rep_cust_due_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('representative_customers');
    }
};
