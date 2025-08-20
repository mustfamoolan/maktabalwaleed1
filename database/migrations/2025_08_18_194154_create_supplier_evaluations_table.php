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
        Schema::create('supplier_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');
            $table->string('evaluation_period', 20); // فترة التقييم (monthly, quarterly, annual)
            $table->integer('period_year'); // السنة
            $table->integer('period_month')->nullable(); // الشهر
            $table->integer('period_quarter')->nullable(); // الربع

            // مؤشرات الأداء
            $table->decimal('total_orders', 15, 2)->default(0); // إجمالي الطلبات
            $table->decimal('total_value', 15, 2)->default(0); // إجمالي القيمة
            $table->integer('on_time_deliveries')->default(0); // التسليم في الوقت
            $table->integer('late_deliveries')->default(0); // التسليم المتأخر
            $table->integer('quality_issues')->default(0); // مشاكل الجودة
            $table->integer('returns_count')->default(0); // عدد المرتجعات
            $table->decimal('returns_value', 15, 2)->default(0); // قيمة المرتجعات
            $table->decimal('payment_compliance_rate', 5, 2)->default(100); // معدل الالتزام بالدفع

            // النقاط المحسوبة
            $table->integer('delivery_score')->default(0); // نقاط التسليم (0-100)
            $table->integer('quality_score')->default(0); // نقاط الجودة (0-100)
            $table->integer('reliability_score')->default(0); // نقاط الموثوقية (0-100)
            $table->integer('communication_score')->default(0); // نقاط التواصل (0-100)
            $table->integer('pricing_score')->default(0); // نقاط التسعير (0-100)
            $table->integer('total_score')->default(0); // إجمالي النقاط (0-500)
            $table->decimal('average_score', 5, 2)->default(0); // متوسط النقاط (0-100)

            // التصنيف
            $table->enum('grade', ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'])->nullable(); // الدرجة
            $table->enum('recommendation', ['highly_recommended', 'recommended', 'conditional', 'not_recommended'])->nullable(); // التوصية

            $table->date('evaluation_date'); // تاريخ التقييم
            $table->foreignId('evaluated_by')->constrained('admin_users')->onDelete('restrict'); // المُقيِّم
            $table->text('strengths')->nullable(); // نقاط القوة
            $table->text('weaknesses')->nullable(); // نقاط الضعف
            $table->text('improvement_areas')->nullable(); // مجالات التحسين
            $table->text('notes')->nullable(); // ملاحظات عامة
            $table->timestamps();

            // فهارس للبحث والأداء
            $table->index(['supplier_id', 'period_year', 'period_month'], 'idx_eval_supplier_period');
            $table->index(['evaluation_period', 'period_year'], 'idx_eval_period');
            $table->index('total_score');
            $table->index('average_score');
            $table->index('grade');
            $table->index('recommendation');

            // فهرس مركب لمنع التكرار
            $table->unique(['supplier_id', 'evaluation_period', 'period_year', 'period_month'], 'unique_supplier_eval');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_evaluations');
    }
};
