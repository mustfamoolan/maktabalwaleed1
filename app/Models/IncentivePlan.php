<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IncentivePlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_ar',
        'name_en',
        'type',
        'description',
        'configuration',
        'is_active',
        'is_default',
        'effective_from',
        'effective_to',
        'conditions',
        'min_sales_amount',
        'max_commission',
    ];

    protected $casts = [
        'configuration' => 'json',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'min_sales_amount' => 'decimal:2',
        'max_commission' => 'decimal:2',
    ];

    // العلاقات
    public function representatives()
    {
        return $this->belongsToMany(SalesRepresentative::class, 'representative_incentive_plans');
    }

    // الفلاتر (Scopes)
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function scopeEffective($query, $date = null)
    {
        $date = $date ?? now();
        return $query->where(function ($query) use ($date) {
            $query->where('effective_from', '<=', $date)
                  ->where(function ($query) use ($date) {
                      $query->whereNull('effective_to')
                            ->orWhere('effective_to', '>=', $date);
                  });
        });
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // الوصول للخصائص (Accessors)
    public function getDisplayNameAttribute()
    {
        return $this->name_ar ?? $this->name_en;
    }

    public function getIsCurrentlyActiveAttribute()
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();

        if ($this->effective_from && $now->lt($this->effective_from)) {
            return false;
        }

        if ($this->effective_to && $now->gt($this->effective_to)) {
            return false;
        }

        return true;
    }

    // Methods لحساب الحوافز
    public function calculateIncentive($salesAmount, $additionalData = [])
    {
        if (!$this->is_currently_active || $salesAmount < $this->min_sales_amount) {
            return 0;
        }

        $config = $this->configuration;

        switch ($this->type) {
            case 'fixed_commission':
                $rate = $config['commission_rate'] ?? 0;
                $commission = ($salesAmount * $rate) / 100;
                break;

            case 'tiered_commission':
                $commission = $this->calculateTieredCommission($salesAmount, $config);
                break;

            case 'target_bonus':
                $commission = $this->calculateTargetBonus($salesAmount, $additionalData, $config);
                break;

            default:
                $commission = 0;
        }

        // تطبيق الحد الأقصى إذا كان محدداً
        if ($this->max_commission && $commission > $this->max_commission) {
            $commission = $this->max_commission;
        }

        return round($commission, 2);
    }

    private function calculateTieredCommission($salesAmount, $config)
    {
        $tiers = $config['tiers'] ?? [];
        $totalCommission = 0;
        $remainingAmount = $salesAmount;

        foreach ($tiers as $tier) {
            $tierMin = $tier['min_amount'] ?? 0;
            $tierMax = $tier['max_amount'] ?? null;
            $tierRate = $tier['commission_rate'] ?? 0;

            if ($remainingAmount <= 0) {
                break;
            }

            // حساب المبلغ المؤهل لهذا المستوى
            if ($tierMax) {
                $tierAmount = min($remainingAmount, $tierMax - $tierMin);
            } else {
                $tierAmount = $remainingAmount;
            }

            if ($tierAmount > 0) {
                $totalCommission += ($tierAmount * $tierRate) / 100;
                $remainingAmount -= $tierAmount;
            }
        }

        return $totalCommission;
    }

    private function calculateTargetBonus($salesAmount, $additionalData, $config)
    {
        $target = $additionalData['target'] ?? $config['target_amount'] ?? 0;
        $baseRate = $config['base_commission_rate'] ?? 0;
        $bonusRate = $config['bonus_commission_rate'] ?? 0;
        $achievementThreshold = $config['achievement_threshold'] ?? 100; // percentage

        // العمولة الأساسية
        $baseCommission = ($salesAmount * $baseRate) / 100;

        // حساب نسبة الإنجاز
        if ($target > 0) {
            $achievementPercentage = ($salesAmount / $target) * 100;

            // إضافة المكافأة إذا تحقق الهدف
            if ($achievementPercentage >= $achievementThreshold) {
                $bonusCommission = ($salesAmount * $bonusRate) / 100;
                return $baseCommission + $bonusCommission;
            }
        }

        return $baseCommission;
    }

    // إنشاء خطة حوافز افتراضية
    public static function createDefault()
    {
        return static::create([
            'name_ar' => 'خطة العمولة الأساسية',
            'name_en' => 'Basic Commission Plan',
            'type' => 'fixed_commission',
            'description' => 'خطة عمولة ثابتة للمندوبين الجدد',
            'configuration' => [
                'commission_rate' => 5.0
            ],
            'is_active' => true,
            'is_default' => true,
            'min_sales_amount' => 0,
        ]);
    }
}
