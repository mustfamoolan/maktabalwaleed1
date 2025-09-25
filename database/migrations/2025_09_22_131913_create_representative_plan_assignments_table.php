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
        Schema::create('representative_plan_assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('representative_id');
            $table->unsignedBigInteger('plan_id');
            $table->enum('plan_type', ['sales_plan', 'commission_plan']);
            $table->date('assigned_date');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('representative_id')->references('id')->on('representatives')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('representative_plan_assignments');
    }
};
