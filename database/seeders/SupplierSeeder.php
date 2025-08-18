<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Supplier;
use App\Models\SupplierType;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cleaningType = SupplierType::where('name', 'المنظفات')->first();
        $foodType = SupplierType::where('name', 'المواد الغذائية')->first();
        $diapersType = SupplierType::where('name', 'الحفاظات')->first();

        // شركة تعمل في المنظفات والمواد الغذائية
        $supplier1 = Supplier::create([
            'company_name' => 'شركة الأمل للتوريدات',
            'is_active' => true,
        ]);
        $supplier1->supplierTypes()->attach([$cleaningType->id, $foodType->id]);

        // شركة تعمل في الحفاظات فقط
        $supplier2 = Supplier::create([
            'company_name' => 'مؤسسة النور التجارية',
            'is_active' => true,
        ]);
        $supplier2->supplierTypes()->attach([$diapersType->id]);

        // شركة تعمل في المواد الغذائية فقط
        $supplier3 = Supplier::create([
            'company_name' => 'شركة الخليج للمواد الغذائية',
            'is_active' => true,
        ]);
        $supplier3->supplierTypes()->attach([$foodType->id]);

        // شركة غير نشطة تعمل في المنظفات
        $supplier4 = Supplier::create([
            'company_name' => 'مجموعة السلام للمنظفات',
            'is_active' => false,
        ]);
        $supplier4->supplierTypes()->attach([$cleaningType->id]);

        // شركة تعمل في جميع الأنواع
        $supplier5 = Supplier::create([
            'company_name' => 'الشركة الشاملة للتوريدات',
            'is_active' => true,
        ]);
        $supplier5->supplierTypes()->attach([$cleaningType->id, $foodType->id, $diapersType->id]);
    }
}
