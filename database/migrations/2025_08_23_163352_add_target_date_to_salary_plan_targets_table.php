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
        Schema::table('salary_plan_targets', function (Blueprint $table) {
            $table->date('target_date')->nullable()->after('required_percentage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('salary_plan_targets', function (Blueprint $table) {
            $table->dropColumn('target_date');
        });
    }
};
