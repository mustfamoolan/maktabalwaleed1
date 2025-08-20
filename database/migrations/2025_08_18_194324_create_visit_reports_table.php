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
        Schema::create('visit_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_representative_id')->constrained('sales_representatives')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('customers')->onDelete('restrict');
            $table->string('visit_number', 20)->unique(); // رقم الزيارة
            $table->datetime('visit_date'); // تاريخ ووقت الزيارة
            $table->enum('visit_type', ['scheduled', 'follow_up', 'collection', 'complaint', 'prospecting']); // نوع الزيارة
            $table->enum('visit_status', ['planned', 'in_progress', 'completed', 'cancelled', 'postponed']); // حالة الزيارة
            $table->datetime('actual_start_time')->nullable(); // وقت البداية الفعلي
            $table->datetime('actual_end_time')->nullable(); // وقت النهاية الفعلي
            $table->integer('duration_minutes')->nullable(); // مدة الزيارة بالدقائق

            // الموقع الجغرافي
            $table->decimal('check_in_latitude', 10, 8)->nullable(); // خط العرض للدخول
            $table->decimal('check_in_longitude', 11, 8)->nullable(); // خط الطول للدخول
            $table->decimal('check_out_latitude', 10, 8)->nullable(); // خط العرض للخروج
            $table->decimal('check_out_longitude', 11, 8)->nullable(); // خط الطول للخروج
            $table->decimal('distance_from_customer', 8, 2)->nullable(); // المسافة من العميل (متر)

            // تفاصيل الزيارة
            $table->text('visit_purpose'); // غرض الزيارة
            $table->text('discussion_points')->nullable(); // نقاط النقاش
            $table->text('customer_feedback')->nullable(); // ملاحظات العميل
            $table->text('action_items')->nullable(); // المطلوب تنفيذه
            $table->date('next_visit_date')->nullable(); // تاريخ الزيارة القادمة

            // النتائج
            $table->boolean('resulted_in_sale')->default(false); // نتج عنها بيع
            $table->decimal('sale_amount', 15, 2)->nullable(); // مبلغ البيع
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->onDelete('set null'); // الفاتورة المرتبطة
            $table->boolean('resulted_in_collection')->default(false); // نتج عنها تحصيل
            $table->decimal('collection_amount', 15, 2)->nullable(); // مبلغ التحصيل

            // التقييم
            $table->integer('customer_satisfaction_rating')->nullable(); // تقييم رضا العميل (1-5)
            $table->integer('visit_quality_rating')->nullable(); // تقييم جودة الزيارة (1-5)
            $table->enum('overall_result', ['excellent', 'good', 'average', 'poor'])->nullable(); // النتيجة الإجمالية

            $table->json('photos')->nullable(); // صور الزيارة
            $table->text('notes')->nullable(); // ملاحظات
            $table->timestamps();

            // فهارس
            $table->index(['sales_representative_id', 'visit_date']);
            $table->index(['customer_id', 'visit_date']);
            $table->index('visit_number');
            $table->index('visit_type');
            $table->index('visit_status');
            $table->index('resulted_in_sale');
            $table->index('next_visit_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visit_reports');
    }
};
