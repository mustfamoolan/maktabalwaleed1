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
        Schema::create('representative_salary_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('representative_id')->constrained('representatives')->onDelete('cascade');

            // معلومات الراتب الأساسي
            $table->decimal('base_salary', 12, 2)->default(0); // الراتب الأساسي
            $table->decimal('minimum_achievement_percentage', 5, 2)->default(80); // النسبة المطلوبة للحصول على الراتب كاملاً

            // نوع خطة الحوافز
            $table->enum('incentive_plan_type', ['specific_targets', 'total_target', 'commission', 'mixed'])->default('specific_targets');

            // خطة الهدف الكلي
            $table->integer('total_target_boxes')->nullable(); // عدد الكراتين المستهدف
            $table->decimal('amount_per_box', 8, 2)->nullable(); // المبلغ لكل كرتون

            // خطة العمولة
            $table->boolean('commission_enabled')->default(false);
            $table->decimal('default_commission_percentage', 5, 2)->nullable(); // نسبة العمولة الافتراضية

            // إعدادات إضافية
            $table->json('settings')->nullable(); // إعدادات مرنة إضافية

            $table->boolean('is_active')->default(true);
            $table->date('effective_from'); // تاريخ بداية الخطة
            $table->date('effective_to')->nullable(); // تاريخ نهاية الخطة

            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('representative_salary_plans');
    }
};
