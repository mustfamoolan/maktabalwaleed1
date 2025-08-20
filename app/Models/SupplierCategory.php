<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SupplierCategory extends Model
{
    use HasFactory;

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
        'commission_rate' => 'decimal:2',
        'sort_order' => 'integer'
    ];

    // العلاقات
    public function suppliers()
    {
        return $this->hasMany(Supplier::class, 'category_id');
    }

    public function additionalSuppliers()
    {
        return $this->belongsToMany(Supplier::class, 'supplier_category_mappings');
    }

    public function allSuppliers()
    {
        // جميع الموردين المرتبطين بهذه الفئة (أساسية أو إضافية)
        $mainSuppliers = $this->suppliers()->get();
        $additionalSuppliers = $this->additionalSuppliers()->get();

        return $mainSuppliers->merge($additionalSuppliers)->unique('id');
    }

    // الوصول للخصائص (Accessors)
    public function getDisplayNameAttribute()
    {
        return $this->name_ar ?? $this->name_en;
    }

    // الفلاتر (Scopes)
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name_ar');
    }
}
