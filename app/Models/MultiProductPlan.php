<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MultiProductPlan extends Model
{
    protected $fillable = [
        'representative_id',
        'plan_name',
        'total_target_quantity',
        'required_percentage',
        'start_date',
        'end_date',
        'achieved_quantity',
        'achievement_percentage',
        'is_completed',
        'status',
        'notes'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'required_percentage' => 'decimal:2',
        'achievement_percentage' => 'decimal:2',
        'is_completed' => 'boolean'
    ];

    // علاقة مع المندوب
    public function representative(): BelongsTo
    {
        return $this->belongsTo(Representative::class);
    }

    // علاقة مع منتجات الخطة
    public function planProducts(): HasMany
    {
        return $this->hasMany(MultiProductPlanProduct::class);
    }

    // علاقة مباشرة مع المنتجات
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'multi_product_plan_products')
                    ->withPivot('achieved_quantity')
                    ->withTimestamps();
    }

    // حساب نسبة الإنجاز
    public function calculateAchievementPercentage()
    {
        if ($this->total_target_quantity <= 0) {
            return 0;
        }

        return ($this->achieved_quantity / $this->total_target_quantity) * 100;
    }

    // تحديث حالة الإكمال
    public function updateCompletionStatus()
    {
        $achievementPercentage = $this->calculateAchievementPercentage();

        $this->update([
            'achievement_percentage' => $achievementPercentage,
            'is_completed' => $achievementPercentage >= $this->required_percentage
        ]);
    }
}
