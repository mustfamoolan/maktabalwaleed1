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
            // إضافة حقول الباركود الجديدة
            $table->enum('barcode_type', ['auto', 'manual'])->default('auto')->after('barcode');
            $table->timestamp('barcode_generated_at')->nullable()->after('barcode_type');

            // إضافة حقول أخرى مطلوبة
            $table->decimal('cost_price', 10, 2)->nullable()->after('purchase_price');
            $table->decimal('profit_margin', 10, 2)->nullable()->after('selling_price');
            $table->integer('stock_quantity')->default(0)->after('current_stock');
            $table->string('image')->nullable()->after('image_path');

            // إضافة فهارس للبحث
            $table->index('barcode_type');
            $table->index('profit_margin');
            $table->index('stock_quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'barcode_type',
                'barcode_generated_at',
                'cost_price',
                'profit_margin',
                'stock_quantity',
                'image'
            ]);
        });
    }
};
