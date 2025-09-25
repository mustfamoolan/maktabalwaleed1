<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = [
        'name'
    ];

    /**
     * العلاقة مع الفئات
     */
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'supplier_categories');
    }

    /**
     * العلاقة مع المنتجات
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }



    /**
     * فلترة الموردين النشطين
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
