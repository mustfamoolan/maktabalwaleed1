<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Preparer;
use Illuminate\Support\Facades\Hash;

class PreparerSeeder extends Seeder
{
    public function run()
    {
        $preparers = [
            [
                'name' => 'أحمد محمد السعد',
                'phone' => '07701234567',
                'password' => Hash::make('123456'),
                'salary' => 800000,
                'is_active' => true,
                'notes' => 'مجهز خبير في إعداد الطلبات الكبيرة'
            ],
            [
                'name' => 'فاطمة علي الخفاجي',
                'phone' => '07802345678',
                'password' => Hash::make('123456'),
                'salary' => 750000,
                'is_active' => true,
                'notes' => 'متخصصة في تجهيز الطلبات السريعة'
            ],
            [
                'name' => 'محمد حسن الكاظمي',
                'phone' => '07903456789',
                'password' => Hash::make('123456'),
                'salary' => 700000,
                'is_active' => false,
                'notes' => 'في إجازة مؤقتة'
            ]
        ];

        foreach ($preparers as $preparerData) {
            Preparer::create($preparerData);
        }
    }
}
