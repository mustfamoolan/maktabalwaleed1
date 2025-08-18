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
        Schema::create('admin_users', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // اسم الموظف أو المدير
            $table->string('phone', 11)->unique(); // رقم الهاتف العراقي 11 رقم
            $table->string('password'); // كلمة المرور
            $table->enum('role', ['موظف', 'مدير'])->default('موظف'); // الدور
            $table->boolean('is_active')->default(true); // حالة النشاط
            $table->timestamp('last_login')->nullable(); // آخر تسجيل دخول
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_users');
    }
};
