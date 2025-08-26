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
        Schema::create('multi_product_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('representative_id')->constrained('representatives')->onDelete('cascade');
            $table->string('plan_name');
            $table->integer('total_target_quantity'); // الكمية الإجمالية المطلوبة
            $table->decimal('required_percentage', 5, 2)->default(100); // النسبة المطلوبة
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('achieved_quantity')->default(0); // الكمية المحققة الإجمالية
            $table->decimal('achievement_percentage', 5, 2)->default(0); // النسبة المحققة
            $table->boolean('is_completed')->default(false);
            $table->enum('status', ['active', 'completed', 'paused', 'cancelled'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('multi_product_plans');
    }
};
