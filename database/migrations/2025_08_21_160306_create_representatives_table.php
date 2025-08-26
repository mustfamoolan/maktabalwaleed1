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
        Schema::create('representatives', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // اسم المندوب
            $table->string('phone')->unique(); // رقم الهاتف (فريد)
            $table->text('address')->nullable(); // العنوان (اختياري)
            $table->boolean('is_active')->default(true); // نشط/غير نشط
            $table->timestamps();

            // فهارس للبحث والأداء
            $table->index('phone');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('representatives');
    }
};
