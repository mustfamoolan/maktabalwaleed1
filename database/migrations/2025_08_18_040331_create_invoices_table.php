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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique(); // رقم الفاتورة
            $table->foreignId('representative_id')->constrained('representatives')->onDelete('cascade'); // المندوب
            $table->foreignId('customer_id')->constrained('representative_customers')->onDelete('cascade'); // العميل
            $table->decimal('total_amount', 12, 2); // المبلغ الإجمالي
            $table->decimal('paid_amount', 12, 2)->default(0); // المبلغ المدفوع
            $table->decimal('remaining_amount', 12, 2)->default(0); // المبلغ المتبقي
            $table->enum('status', ['pending', 'preparing', 'shipping', 'delivered', 'returned', 'cancelled'])
                  ->default('pending'); // الحالة
            $table->text('notes')->nullable(); // ملاحظات
            $table->datetime('invoice_date'); // تاريخ الفاتورة
            $table->datetime('delivery_date')->nullable(); // تاريخ التسليم
            $table->boolean('is_printed')->default(false); // هل تم طباعة الفاتورة
            $table->timestamps();

            // فهارس
            $table->index(['representative_id', 'status'], 'rep_status_idx');
            $table->index('invoice_date', 'invoice_date_idx');
            $table->index('status', 'status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
