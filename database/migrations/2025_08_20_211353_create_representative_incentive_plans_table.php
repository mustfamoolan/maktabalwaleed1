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
        Schema::create('representative_incentive_plans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sales_representative_id');
            $table->unsignedBigInteger('incentive_plan_id');
            $table->timestamps();

            // Foreign keys
            $table->foreign('sales_representative_id')->references('id')->on('sales_representatives')->onDelete('cascade');
            $table->foreign('incentive_plan_id')->references('id')->on('incentive_plans')->onDelete('cascade');

            // Unique constraint to prevent duplicate entries
            $table->unique(['sales_representative_id', 'incentive_plan_id'], 'rep_incentive_unique');

            // Indexes for performance
            $table->index('sales_representative_id');
            $table->index('incentive_plan_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('representative_incentive_plans');
    }
};
