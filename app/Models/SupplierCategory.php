<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplierCategory extends Model
{
    protected $fillable = [
        'name_ar',
        'name_en',
        'description',
        'is_active',
        'commission_rate',
        'color_code',
        'sort_order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'commission_rate' => 'decimal:2'
    ];

    /**
     * العلاقة مع الموردين (many-to-many)
     */
    public function suppliers()
    {
        return $this->belongsToMany(Supplier::class, 'supplier_category_mappings');
    }

    /**
     * العلاقة مع المنتجات
     */
    public function products()
    {
        return $this->hasMany(Product::class, 'category_id');
    }

    /**
     * الحصول على الاسم للعرض
     */
    public function getNameAttribute()
    {
        return $this->name_ar ?: $this->name_en;
    }

    /**
     * فلترة الفئات النشطة
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
