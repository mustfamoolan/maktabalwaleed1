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
        Schema::create('sales_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('اسم الخطة');
            $table->enum('plan_type', ['product', 'category', 'supplier'])->comment('نوع الخطة');
            $table->unsignedBigInteger('target_id')->comment('معرف الهدف (منتج/صنف/مورد)');
            $table->integer('target_quantity')->comment('الكمية المطلوبة');
            $table->decimal('required_achievement_rate', 5, 2)->comment('النسبة المطلوبة (70%)');
            $table->decimal('bonus_per_extra_unit', 10, 2)->default(0)->comment('مكافأة الوحدة الإضافية');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_plans');
    }
};
