<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AdminUser;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // إنشاء مدير عام
        AdminUser::create([
            'name' => 'مصطفى المدير',
            'phone' => '07742209251',
            'password' => '12345678', // سيتم تشفيرها تلقائياً
            'role' => 'مدير',
            'is_active' => true,
        ]);

        // إنشاء موظف
        AdminUser::create([
            'name' => 'محمد الموظف',
            'phone' => '07711234567',
            'password' => '12345678',
            'role' => 'موظف',
            'is_active' => true,
        ]);

        // إنشاء مدير آخر
        AdminUser::create([
            'name' => 'فاطمة المدير',
            'phone' => '07721234567',
            'password' => '12345678',
            'role' => 'مدير',
            'is_active' => true,
        ]);

        // إنشاء موظف آخر
        AdminUser::create([
            'name' => 'علي الموظف',
            'phone' => '07731234567',
            'password' => '12345678',
            'role' => 'موظف',
            'is_active' => true,
        ]);
    }
}
