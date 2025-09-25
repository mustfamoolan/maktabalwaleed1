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
        Schema::create('representative_salaries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('representative_id');
            $table->decimal('basic_salary', 15, 2)->comment('الراتب الأساسي بالدينار العراقي');
            $table->date('effective_from')->comment('تاريخ البداية');
            $table->date('effective_to')->nullable()->comment('تاريخ الانتهاء');
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
        Schema::dropIfExists('representative_salaries');
    }
};
