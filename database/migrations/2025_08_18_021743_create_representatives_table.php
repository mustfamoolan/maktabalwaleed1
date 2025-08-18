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
            $table->string('phone', 15)->unique(); // رقم هاتف المندوب (العراق 11 رقم)
            $table->string('password'); // كلمة مرور المندوب
            $table->boolean('is_active')->default(true); // حالة المندوب (نشط/غير نشط)
            $table->text('notes')->nullable(); // ملاحظات إضافية
            $table->timestamps();
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
