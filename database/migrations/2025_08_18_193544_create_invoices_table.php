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
            $table->foreignId('customer_id')->constrained('customers')->onDelete('restrict');
            $table->foreignId('sales_representative_id')->constrained('sales_representatives')->onDelete('restrict');
            $table->string('invoice_number', 30)->unique(); // رقم الفاتورة
            $table->enum('type', ['sale', 'return', 'credit_note'])->default('sale'); // نوع الفاتورة
            $table->date('invoice_date'); // تاريخ الفاتورة
            $table->date('due_date')->nullable(); // تاريخ الاستحقاق
            $table->enum('status', ['draft', 'confirmed', 'paid', 'partially_paid', 'overdue', 'cancelled'])->default('draft'); // حالة الفاتورة
            $table->decimal('subtotal', 15, 2)->default(0); // المجموع الفرعي
            $table->decimal('discount_percentage', 5, 2)->default(0); // نسبة الخصم
            $table->decimal('discount_amount', 10, 2)->default(0); // مبلغ الخصم
            $table->decimal('tax_amount', 10, 2)->default(0); // مبلغ الضريبة
            $table->decimal('total_amount', 15, 2)->default(0); // المبلغ الإجمالي
            $table->decimal('paid_amount', 15, 2)->default(0); // المبلغ المدفوع
            $table->decimal('remaining_amount', 15, 2)->default(0); // المبلغ المتبقي
            $table->enum('payment_method', ['cash', 'card', 'transfer', 'check', 'credit'])->nullable(); // طريقة الدفع
            $table->string('reference_number', 50)->nullable(); // رقم المرجع
            $table->text('notes')->nullable(); // ملاحظات
            $table->json('location_data')->nullable(); // بيانات الموقع (GPS)
            $table->boolean('is_synced')->default(false); // متزامن مع النظام المركزي
            $table->timestamp('synced_at')->nullable(); // وقت المزامنة
            $table->timestamps();

            // فهارس للبحث والأداء
            $table->index(['status', 'invoice_date']);
            $table->index(['customer_id', 'invoice_date']);
            $table->index(['sales_representative_id', 'invoice_date']);
            $table->index('invoice_number');
            $table->index('type');
            $table->index('due_date');
            $table->index('total_amount');
            $table->index('is_synced');
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
