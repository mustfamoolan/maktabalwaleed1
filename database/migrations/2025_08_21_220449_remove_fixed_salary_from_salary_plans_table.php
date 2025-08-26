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
        Schema::table('salary_plans', function (Blueprint $table) {
            $table->dropColumn('fixed_salary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('salary_plans', function (Blueprint $table) {
            $table->decimal('fixed_salary', 10, 2)->after('plan_name');
        });
    }
};
