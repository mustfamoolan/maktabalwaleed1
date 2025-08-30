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
        Schema::table('sales', function (Blueprint $table) {
            // إضافة الوزن الكلي للفاتورة
            $table->decimal('total_weight_grams', 15, 2)->nullable()->comment('الوزن الكلي للفاتورة بالغرام');
            $table->decimal('total_weight_kg', 10, 3)->nullable()->comment('الوزن الكلي للفاتورة بالكيلو غرام');

            // إضافة index للبحث
            $table->index('total_weight_grams');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropIndex(['total_weight_grams']);
            $table->dropColumn(['total_weight_grams', 'total_weight_kg']);
        });
    }
};
