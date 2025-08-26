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
            $table->foreignId('representative_id')->constrained('representatives')->onDelete('cascade');
            $table->decimal('base_salary', 10, 2); // الراتب الأساسي
            $table->decimal('allowances', 10, 2)->default(0); // البدلات
            $table->decimal('deductions', 10, 2)->default(0); // الخصومات
            $table->boolean('is_active')->default(true); // نشط أم لا
            $table->date('effective_date'); // تاريخ السريان
            $table->text('notes')->nullable(); // ملاحظات
            $table->timestamps();

            // فهارس
            $table->index(['representative_id', 'is_active']);
            $table->unique(['representative_id', 'effective_date']);
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
