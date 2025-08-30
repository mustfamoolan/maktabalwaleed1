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
            // حقول التجهيز
            $table->unsignedBigInteger('prepared_by')->nullable()->after('buyer_representative_id');
            $table->text('preparation_notes')->nullable()->after('notes');
            $table->timestamp('preparation_completed_at')->nullable()->after('updated_at');

            // فهرس للمجهز
            $table->index('prepared_by');

            // ربط المجهز بجدول المجهزين
            $table->foreign('prepared_by')->references('id')->on('preparers')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['prepared_by']);
            $table->dropIndex(['prepared_by']);
            $table->dropColumn([
                'prepared_by',
                'preparation_notes',
                'preparation_completed_at'
            ]);
        });
    }
};
