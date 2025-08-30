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
        Schema::table('products', function (Blueprint $table) {
            // عدد القطع في الكارتون
            $table->integer('pieces_per_carton')->nullable()->comment('عدد القطع في الكارتون');

            // وزن القطعة بالغرام
            $table->integer('piece_weight_grams')->nullable()->comment('وزن القطعة بالغرام');

            // إضافة index للبحث والفلترة
            $table->index('pieces_per_carton');
            $table->index('piece_weight_grams');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['pieces_per_carton']);
            $table->dropIndex(['piece_weight_grams']);
            $table->dropColumn(['pieces_per_carton', 'piece_weight_grams']);
        });
    }
};
