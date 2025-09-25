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
        Schema::create('purchase_return_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_return_invoice_id')->constrained('purchase_return_invoices')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('product_name');
            $table->string('supplier_name');
            $table->string('category_name');
            $table->decimal('purchase_price', 10, 2);
            $table->decimal('purchase_price_after_cost', 10, 2);
            $table->decimal('sale_price', 10, 2);
            $table->decimal('wholesale_price', 10, 2);
            $table->decimal('quantity', 10, 2);
            $table->decimal('total_price', 15, 2);
            $table->decimal('allocated_cost', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_return_invoice_items');
    }
};
