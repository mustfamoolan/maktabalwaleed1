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
        Schema::create('representative_targets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_representative_id')->constrained('sales_representatives')->onDelete('cascade');
            $table->enum('target_period', ['monthly', 'quarterly', 'annual']); // فترة الهدف
            $table->integer('target_year'); // السنة
            $table->integer('target_month')->nullable(); // الشهر
            $table->integer('target_quarter')->nullable(); // الربع
            $table->decimal('sales_target', 15, 2); // هدف المبيعات
            $table->integer('customers_target')->default(0); // هدف عدد العملاء
            $table->integer('visits_target')->default(0); // هدف عدد الزيارات
            $table->decimal('collection_target', 15, 2)->default(0); // هدف التحصيل

            // الإنجاز الفعلي
            $table->decimal('actual_sales', 15, 2)->default(0); // المبيعات الفعلية
            $table->integer('actual_customers')->default(0); // العملاء الفعليين
            $table->integer('actual_visits')->default(0); // الزيارات الفعلية
            $table->decimal('actual_collection', 15, 2)->default(0); // التحصيل الفعلي

            // نسب الإنجاز
            $table->decimal('sales_achievement_rate', 5, 2)->default(0); // نسبة إنجاز المبيعات
            $table->decimal('customers_achievement_rate', 5, 2)->default(0); // نسبة إنجاز العملاء
            $table->decimal('visits_achievement_rate', 5, 2)->default(0); // نسبة إنجاز الزيارات
            $table->decimal('collection_achievement_rate', 5, 2)->default(0); // نسبة إنجاز التحصيل
            $table->decimal('overall_achievement_rate', 5, 2)->default(0); // النسبة الإجمالية

            $table->enum('status', ['active', 'completed', 'cancelled'])->default('active'); // الحالة
            $table->date('start_date'); // تاريخ البداية
            $table->date('end_date'); // تاريخ النهاية
            $table->foreignId('created_by')->constrained('admin_users')->onDelete('restrict');
            $table->text('notes')->nullable(); // ملاحظات
            $table->timestamps();

            // فهارس
            $table->index(['sales_representative_id', 'target_year', 'target_month'], 'idx_target_rep_period');
            $table->index(['target_period', 'target_year'], 'idx_target_period');
            $table->index('status');
            $table->index('overall_achievement_rate');

            // فهرس مركب لمنع التكرار
            $table->unique(['sales_representative_id', 'target_period', 'target_year', 'target_month'], 'unique_rep_target');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('representative_targets');
    }
};
