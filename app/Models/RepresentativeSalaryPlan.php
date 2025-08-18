<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RepresentativeSalaryPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'representative_id',
        'base_salary',
        'minimum_achievement_percentage',
        'incentive_plan_type',
        'total_target_boxes',
        'amount_per_box',
        'commission_enabled',
        'default_commission_percentage',
        'settings',
        'is_active',
        'effective_from',
        'effective_to',
        'notes'
    ];

    protected $casts = [
        'base_salary' => 'decimal:2',
        'minimum_achievement_percentage' => 'decimal:2',
        'amount_per_box' => 'decimal:2',
        'commission_enabled' => 'boolean',
        'default_commission_percentage' => 'decimal:2',
        'settings' => 'json',
        'is_active' => 'boolean',
        'effective_from' => 'date',
        'effective_to' => 'date',
    ];

    // العلاقات
    public function representative()
    {
        return $this->belongsTo(Representative::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCurrent($query)
    {
        $now = now()->toDateString();
        return $query->where('effective_from', '<=', $now)
                    ->where(function($q) use ($now) {
                        $q->whereNull('effective_to')
                          ->orWhere('effective_to', '>=', $now);
                    });
    }

    // خصائص محسوبة
    public function getIncentivePlanNameAttribute()
    {
        $plans = [
            'specific_targets' => 'أهداف محددة لكل صنف/مورد',
            'total_target' => 'هدف كلي للكراتين',
            'commission' => 'نظام العمولة',
            'mixed' => 'نظام مختلط'
        ];

        return $plans[$this->incentive_plan_type] ?? 'غير محدد';
    }

    public function calculateTotalEarnings($achievedQuantity, $totalSales = 0)
    {
        $earnings = 0;

        // الراتب الأساسي
        $baseEarnings = $this->base_salary;

        switch ($this->incentive_plan_type) {
            case 'total_target':
                if ($this->total_target_boxes && $this->amount_per_box) {
                    $boxesEarnings = min($achievedQuantity, $this->total_target_boxes) * $this->amount_per_box;
                    $earnings = $baseEarnings + $boxesEarnings;
                }
                break;

            case 'commission':
                if ($this->commission_enabled && $this->default_commission_percentage) {
                    $commissionEarnings = $totalSales * ($this->default_commission_percentage / 100);
                    $earnings = $baseEarnings + $commissionEarnings;
                }
                break;

            default:
                $earnings = $baseEarnings;
                break;
        }

        return $earnings;
    }
}
