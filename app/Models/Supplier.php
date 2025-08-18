<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // علاقة مع أنواع الموردين (many-to-many)
    public function supplierTypes()
    {
        return $this->belongsToMany(SupplierType::class);
    }

    // نطاق للموردين النشطين
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // الحصول على أنواع المورد كنص
    public function getTypesTextAttribute()
    {
        return $this->supplierTypes->pluck('name')->join(', ');
    }
}
