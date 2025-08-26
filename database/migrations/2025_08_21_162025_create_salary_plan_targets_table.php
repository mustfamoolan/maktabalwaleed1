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
        Schema::create('salary_plan_targets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salary_plan_id')->constrained('salary_plans')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->integer('target_quantity'); // الهدف المطلوب (عدد القطع)
            $table->decimal('required_percentage', 5, 2); // النسبة المطلوبة للنجاح (مثل 80.00%)
            $table->date('target_date'); // التاريخ المستهدف لإنجاز الهدف
            $table->integer('achieved_quantity')->default(0); // الكمية المحققة
            $table->decimal('achievement_percentage', 5, 2)->default(0); // نسبة الإنجاز
            $table->boolean('is_achieved')->default(false); // هل تم تحقيق الهدف
            $table->timestamps();

            // فهارس
            $table->index(['salary_plan_id', 'product_id']);
            $table->index('is_achieved');
            $table->index('achievement_percentage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salary_plan_targets');
    }
};
