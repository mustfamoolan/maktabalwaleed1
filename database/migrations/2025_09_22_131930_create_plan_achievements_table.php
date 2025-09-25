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
        Schema::create('plan_achievements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('representative_id');
            $table->unsignedBigInteger('plan_id');
            $table->enum('plan_type', ['sales_plan', 'commission_plan']);
            $table->string('calculation_month')->comment('شهر الحساب (2024-01)');
            $table->integer('target_quantity')->comment('الكمية المطلوبة');
            $table->integer('achieved_quantity')->comment('الكمية المحققة');
            $table->decimal('achievement_rate', 5, 2)->comment('نسبة الإنجاز');
            $table->decimal('required_rate', 5, 2)->comment('النسبة المطلوبة');
            $table->integer('extra_quantity')->default(0)->comment('الكمية الإضافية');
            $table->decimal('bonus_earned', 10, 2)->default(0)->comment('المكافأة المكتسبة');
            $table->timestamps();

            $table->foreign('representative_id')->references('id')->on('representatives')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_achievements');
    }
};
