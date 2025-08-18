<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SupplierType;

class SupplierTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'name' => 'المنظفات',
                'description' => 'مواد التنظيف والمنظفات المنزلية والتجارية',
                'is_active' => true,
            ],
            [
                'name' => 'المواد الغذائية',
                'description' => 'المواد الغذائية والمشروبات والبقالة',
                'is_active' => true,
            ],
            [
                'name' => 'الحفاظات',
                'description' => 'حفاظات الأطفال ومنتجات العناية بالطفل',
                'is_active' => true,
            ],
        ];

        foreach ($types as $type) {
            SupplierType::create($type);
        }
    }
}
