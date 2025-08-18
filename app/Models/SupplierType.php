<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplierType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // علاقة مع الموردين (many-to-many)
    public function suppliers()
    {
        return $this->belongsToMany(Supplier::class);
    }

    // نطاق للأنواع النشطة
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
