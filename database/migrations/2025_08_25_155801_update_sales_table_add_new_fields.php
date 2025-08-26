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
            // إضافة حالة الفاتورة
            $table->enum('status', [
                'created', 'sent', 'pending', 'preparing',
                'ready_for_delivery', 'out_for_delivery',
                'delivered', 'awaiting_approval', 'completed',
                'partial_return', 'full_return', 'cancelled', 'partial_cancelled'
            ])->default('created')->after('sale_status');

            // ربط بالمورد الرئيسي (أكثر مورد في الفاتورة)
            $table->unsignedBigInteger('primary_supplier_id')->nullable()->after('buyer_representative_id');

            // ربط بالقسم الرئيسي (أكثر قسم في الفاتورة)
            $table->unsignedBigInteger('primary_category_id')->nullable()->after('primary_supplier_id');

            // إجمالي الربح
            $table->decimal('total_profit', 10, 2)->default(0)->after('discount_amount');

            // تواريخ المراحل
            $table->timestamp('sent_at')->nullable()->after('sale_date');
            $table->timestamp('prepared_at')->nullable()->after('sent_at');
            $table->timestamp('delivered_at')->nullable()->after('prepared_at');
            $table->timestamp('approved_at')->nullable()->after('delivered_at');

            // معرف السائق (للمستقبل)
            $table->unsignedBigInteger('driver_id')->nullable()->after('buyer_representative_id');

            // ملاحظات الحالة
            $table->text('status_notes')->nullable()->after('notes');

            // الفهارس
            $table->index('status');
            $table->index('primary_supplier_id');
            $table->index('primary_category_id');
            $table->index('driver_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn([
                'status', 'primary_supplier_id', 'primary_category_id',
                'total_profit', 'sent_at', 'prepared_at', 'delivered_at',
                'approved_at', 'driver_id', 'status_notes'
            ]);
        });
    }
};
