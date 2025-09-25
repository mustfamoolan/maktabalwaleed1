<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlanAchievement extends Model
{
    protected $fillable = [
        'representative_id',
        'plan_id',
        'plan_type',
        'calculation_month',
        'target_quantity',
        'achieved_quantity',
        'achievement_rate',
        'required_rate',
        'extra_quantity',
        'bonus_earned'
    ];

    protected $casts = [
        'target_quantity' => 'integer',
        'achieved_quantity' => 'integer',
        'achievement_rate' => 'decimal:2',
        'required_rate' => 'decimal:2',
        'extra_quantity' => 'integer',
        'bonus_earned' => 'decimal:2'
    ];

    // العلاقة مع المندوب
    public function representative(): BelongsTo
    {
        return $this->belongsTo(Representative::class);
    }

    // حساب نسبة الإنجاز وتحديث البيانات
    public function calculateAchievement()
    {
        if ($this->target_quantity > 0) {
            $this->achievement_rate = ($this->achieved_quantity / $this->target_quantity) * 100;

            // حساب الكمية الإضافية والمكافأة
            $requiredQuantity = ($this->target_quantity * $this->required_rate) / 100;

            if ($this->achieved_quantity > $requiredQuantity) {
                $this->extra_quantity = $this->achieved_quantity - $requiredQuantity;

                // حساب المكافأة حسب نوع الخطة
                if ($this->plan_type === 'sales_plan') {
                    $plan = SalesPlan::find($this->plan_id);
                    if ($plan) {
                        $this->bonus_earned = $this->extra_quantity * $plan->bonus_per_extra_unit;
                    }
                }
            }

            $this->save();
        }
    }

    // حساب الراتب المستحق للمندوب في شهر معين
    public static function calculateMonthlySalary($representativeId, $month)
    {
        // الحصول على الراتب الأساسي
        $salary = RepresentativeSalary::getActiveSalary($representativeId);
        if (!$salary) {
            return 0;
        }

        // الحصول على جميع إنجازات الشهر
        $achievements = self::where('representative_id', $representativeId)
            ->where('calculation_month', $month)
            ->get();

        if ($achievements->isEmpty()) {
            return 0;
        }

        // حساب متوسط نسبة الإنجاز
        $totalAchievementRate = $achievements->sum('achievement_rate');
        $averageAchievementRate = $totalAchievementRate / $achievements->count();

        // الراتب المستحق = الراتب الأساسي × متوسط نسبة الإنجاز
        $earnedSalary = ($salary->basic_salary * $averageAchievementRate) / 100;

        // إضافة المكافآت
        $totalBonus = $achievements->sum('bonus_earned');

        return $earnedSalary + $totalBonus;
    }
}
