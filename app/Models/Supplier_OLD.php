<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'code',
        'name_ar',
        'name_en',
        'contact_person',
        'phone',
        'mobile',
        'email',
        'address',
        'city',
        'country',
        'tax_number',
        'commercial_record',
        'credit_limit',
        'payment_days',
        'commission_rate',
        'is_active',
        'evaluation_score',
        'total_purchases',
        'total_returns',
        'notes'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'credit_limit' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'evaluation_score' => 'integer',
        'total_purchases' => 'decimal:2',
        'total_returns' => 'decimal:2',
        'payment_days' => 'integer'
    ];

    // العلاقات
    public function category()
    {
        return $this->belongsTo(SupplierCategory::class, 'category_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function evaluations()
    {
        return $this->hasMany(SupplierEvaluation::class);
    }

    // الوصول للخصائص (Accessors)
    public function getDisplayNameAttribute()
    {
        return $this->name_ar ?? $this->name_en;
    }

    public function getCommissionRateAttribute($value)
    {
        return $value ?? $this->category->commission_rate ?? 0;
    }

    // الفلاتر (Scopes)
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    // Events
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($supplier) {
            if (!$supplier->code) {
                $supplier->code = 'SUP' . str_pad(
                    static::max('id') + 1,
                    6,
                    '0',
                    STR_PAD_LEFT
                );
            }
        });
    }
}
