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
        Schema::create('multi_product_plan_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('multi_product_plan_id')->constrained('multi_product_plans')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->integer('achieved_quantity')->default(0); // الكمية المحققة لهذا المنتج
            $table->timestamps();

            // منع تكرار نفس المنتج في نفس الخطة - باسم مختصر
            $table->unique(['multi_product_plan_id', 'product_id'], 'plan_product_unique');
        });
    }    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('multi_product_plan_products');
    }
};
