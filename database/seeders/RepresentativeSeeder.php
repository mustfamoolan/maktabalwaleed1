<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Representative;

class RepresentativeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $representatives = [
            [
                'name' => 'أحمد محمد العلي',
                'phone' => '07701234567',
                'password' => '123456', // سيتم تشفيرها تلقائياً
                'is_active' => true,
                'notes' => 'مندوب منطقة بغداد - الكرخ',
            ],
            [
                'name' => 'محمد علي حسن',
                'phone' => '07801234567',
                'password' => '123456',
                'is_active' => true,
                'notes' => 'مندوب منطقة بغداد - الرصافة',
            ],
            [
                'name' => 'علي حسين جواد',
                'phone' => '07901234567',
                'password' => '123456',
                'is_active' => true,
                'notes' => 'مندوب منطقة البصرة',
            ],
            [
                'name' => 'حسين محمد الطائي',
                'phone' => '07751234567',
                'password' => '123456',
                'is_active' => false,
                'notes' => 'مندوب منطقة أربيل - معطل مؤقتاً',
            ],
            [
                'name' => 'محمود أحمد السعدي',
                'phone' => '07851234567',
                'password' => '123456',
                'is_active' => true,
                'notes' => 'مندوب منطقة الموصل',
            ],
        ];

        foreach ($representatives as $representative) {
            Representative::create($representative);
        }
    }
}
