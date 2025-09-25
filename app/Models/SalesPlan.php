<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesPlan extends Model
{
    protected $fillable = [
        'representative_id',
        'name',
        'plan_type',
        'target_id',
        'target_quantity',
        'required_achievement_rate',
        'bonus_per_extra_unit',
        'start_date',
        'end_date',
        'is_active'
    ];

    protected $casts = [
        'target_quantity' => 'integer',
        'required_achievement_rate' => 'decimal:2',
        'bonus_per_extra_unit' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean'
    ];

    /**
     * العلاقة مع المندوب
     */
    public function representative()
    {
        return $this->belongsTo(Representative::class);
    }

    /**
     * العلاقة مع الهدف (category)
     */
    public function category()
    {
        return $this->belongsTo(Category::class, 'target_id');
    }

    /**
     * العلاقة مع المنتج
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'target_id')->where('plan_type', 'product');
    }

    /**
     * العلاقة مع المورد
     */
    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'target_id')->where('plan_type', 'supplier');
    }

    /**
     * الحصول على اسم الهدف
     */
    public function getTargetNameAttribute()
    {
        switch($this->plan_type) {
            case 'category':
                return $this->category?->name ?? 'غير محدد';
            case 'product':
                return $this->product?->name ?? 'غير محدد';
            case 'supplier':
                return $this->supplier?->name ?? 'غير محدد';
            default:
                return 'غير محدد';
        }
    }

    // العلاقة مع إنجازات الخطة
    public function achievements(): HasMany
    {
        return $this->hasMany(PlanAchievement::class, 'plan_id')
            ->where('plan_type', 'sales_plan');
    }
}
