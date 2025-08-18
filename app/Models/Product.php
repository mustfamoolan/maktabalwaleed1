<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'supplier_type_id',
        'supplier_id',
        'purchase_price',
        'selling_price',
        'cartons_count',
        'units_per_carton',
        'weight',
        'barcode',
        'purchase_date',
        'image',
        'is_active',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'weight' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // علاقة مع المورد
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    // علاقة مع نوع المنتج
    public function supplierType()
    {
        return $this->belongsTo(SupplierType::class);
    }

    // حساب إجمالي العلب
    public function getTotalUnitsAttribute()
    {
        return $this->cartons_count * $this->units_per_carton;
    }

    // حساب ربح الوحدة
    public function getProfitPerUnitAttribute()
    {
        return $this->selling_price - $this->purchase_price;
    }

    // حساب إجمالي قيمة المخزون بسعر الشراء
    public function getTotalPurchaseValueAttribute()
    {
        return $this->cartons_count * $this->purchase_price;
    }

    // حساب إجمالي قيمة المخزون بسعر البيع
    public function getTotalSellingValueAttribute()
    {
        return $this->cartons_count * $this->selling_price;
    }

    // نطاق للمنتجات النشطة
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // نطاق للمنتجات المنخفضة المخزون
    public function scopeLowStock($query, $threshold = 5)
    {
        return $query->where('cartons_count', '<=', $threshold);
    }
}
