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
        Schema::table('sale_items', function (Blueprint $table) {
            // إضافة معلومات الوزن للمنتج المباع
            $table->integer('pieces_per_carton')->nullable()->comment('عدد القطع في الكارتون');
            $table->decimal('piece_weight_grams', 8, 2)->nullable()->comment('وزن القطعة الواحدة بالغرام');
            $table->decimal('item_total_weight_grams', 15, 2)->nullable()->comment('الوزن الكلي للمنتج المباع بالغرام');
            $table->decimal('item_total_weight_kg', 10, 3)->nullable()->comment('الوزن الكلي للمنتج المباع بالكيلو غرام');

            // إضافة index للبحث
            $table->index('item_total_weight_grams');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropIndex(['item_total_weight_grams']);
            $table->dropColumn([
                'pieces_per_carton',
                'piece_weight_grams',
                'item_total_weight_grams',
                'item_total_weight_kg'
            ]);
        });
    }
};
