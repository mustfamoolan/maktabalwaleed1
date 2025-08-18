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
        Schema::create('representative_sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('representative_id')->constrained('representatives')->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null');
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->onDelete('set null');

            // معلومات البيع
            $table->string('invoice_number')->nullable(); // رقم الفاتورة
            $table->date('sale_date'); // تاريخ البيع
            $table->string('customer_name'); // اسم العميل
            $table->text('customer_address')->nullable(); // عنوان العميل
            $table->string('customer_phone')->nullable(); // هاتف العميل

            // تفاصيل المنتج المباع
            $table->string('product_name'); // اسم المنتج
            $table->enum('product_category', ['food', 'cleaning', 'mixed', 'other'])->default('mixed');
            $table->integer('quantity_sold'); // الكمية المباعة
            $table->string('unit_type')->default('boxes'); // نوع الوحدة

            // الأسعار والمبالغ
            $table->decimal('unit_cost_price', 10, 2); // سعر التكلفة للوحدة
            $table->decimal('unit_selling_price', 10, 2); // سعر البيع للوحدة
            $table->decimal('total_cost', 12, 2); // إجمالي التكلفة
            $table->decimal('total_selling_amount', 12, 2); // إجمالي مبلغ البيع
            $table->decimal('profit_amount', 12, 2); // مبلغ الربح
            $table->decimal('commission_amount', 10, 2)->default(0); // عمولة المندوب

            // حالة البيع
            $table->enum('sale_status', ['pending', 'confirmed', 'delivered', 'returned', 'cancelled'])->default('pending');
            $table->enum('payment_status', ['pending', 'partial', 'paid', 'overdue'])->default('pending');
            $table->decimal('paid_amount', 12, 2)->default(0); // المبلغ المدفوع
            $table->decimal('remaining_amount', 12, 2)->default(0); // المبلغ المتبقي

            // معلومات الإرجاع
            $table->integer('returned_quantity')->default(0); // الكمية المرتجعة
            $table->decimal('returned_amount', 12, 2)->default(0); // مبلغ المرتجعات
            $table->date('return_date')->nullable(); // تاريخ الإرجاع
            $table->text('return_reason')->nullable(); // سبب الإرجاع

            $table->text('notes')->nullable();
            $table->timestamps();

            // فهارس للأداء
            $table->index(['representative_id', 'sale_date'], 'rep_sales_date_idx');
            $table->index(['product_category', 'supplier_id'], 'rep_sales_category_supplier_idx');
            $table->index(['sale_status', 'payment_status'], 'rep_sales_status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('representative_sales');
    }
};
