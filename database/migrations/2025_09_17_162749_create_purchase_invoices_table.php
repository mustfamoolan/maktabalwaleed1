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
        Schema::create('purchase_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique(); // رقم الفاتورة
            $table->date('invoice_date'); // تاريخ الفاتورة
            $table->decimal('total_amount', 15, 2)->default(0); // المبلغ الإجمالي
            $table->decimal('driver_cost', 10, 2)->default(0); // كروة السائق
            $table->decimal('workers_cost', 10, 2)->default(0); // كروة العمال
            $table->decimal('total_cost', 10, 2)->default(0); // إجمالي التكلفة الإضافية
            $table->decimal('final_total', 15, 2)->default(0); // المجموع النهائي
            $table->text('notes')->nullable(); // ملاحظات
            $table->enum('status', ['draft', 'confirmed', 'cancelled'])->default('draft'); // حالة الفاتورة
            $table->foreignId('created_by')->nullable()->constrained('admin_users'); // من أنشأ الفاتورة
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_invoices');
    }
};
