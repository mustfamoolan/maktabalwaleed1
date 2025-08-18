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
        Schema::create('representative_targets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('representative_id')->constrained('representatives')->onDelete('cascade');
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->onDelete('cascade'); // المورد

            // تصنيف المنتج
            $table->enum('product_category', ['food', 'cleaning', 'mixed', 'other'])->default('mixed');
            $table->string('category_name')->nullable(); // اسم التصنيف المخصص

            // تفاصيل الهدف
            $table->integer('target_quantity'); // الكمية المستهدفة
            $table->string('unit_type')->default('boxes'); // نوع الوحدة (كراتين، قطع، الخ)

            // الفترة الزمنية
            $table->date('period_start'); // بداية الفترة
            $table->date('period_end'); // نهاية الفترة
            $table->enum('period_type', ['monthly', 'quarterly', 'custom'])->default('monthly');

            // معلومات الحافز
            $table->decimal('incentive_amount', 10, 2)->nullable(); // مبلغ الحافز عند تحقيق الهدف
            $table->decimal('bonus_percentage', 5, 2)->nullable(); // نسبة إضافية عند تجاوز الهدف

            // حالة الهدف
            $table->boolean('is_active')->default(true);
            $table->integer('achieved_quantity')->default(0); // الكمية المحققة
            $table->decimal('achievement_percentage', 5, 2)->default(0); // نسبة التحقيق

            $table->text('notes')->nullable();
            $table->timestamps();

            // فهارس للأداء
            $table->index(['representative_id', 'period_start', 'period_end'], 'rep_targets_period_idx');
            $table->index(['supplier_id', 'product_category'], 'rep_targets_supplier_category_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('representative_targets');
    }
};
