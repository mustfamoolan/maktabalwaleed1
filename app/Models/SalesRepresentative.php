<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class SalesRepresentative extends Authenticatable
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name_ar',
        'name_en',
        'phone',
        'email',
        'password',
        'national_id',
        'address',
        'city',
        'hire_date',
        'birth_date',
        'base_salary',
        'incentive_plan',
        'incentive_settings',
        'monthly_target',
        'quarterly_target',
        'annual_target',
        'bank_account',
        'bank_name',
        'iban',
        'is_active',
        'total_sales',
        'total_commission',
        'total_customers',
        'avg_monthly_sales',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'base_salary' => 'decimal:2',
        'monthly_target' => 'decimal:2',
        'quarterly_target' => 'decimal:2',
        'annual_target' => 'decimal:2',
        'total_sales' => 'decimal:2',
        'total_commission' => 'decimal:2',
        'total_customers' => 'integer',
        'avg_monthly_sales' => 'decimal:2',
        'hire_date' => 'date',
        'birth_date' => 'date',
        'incentive_settings' => 'json',
        'password' => 'hashed',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // العلاقات
    public function customers()
    {
        return $this->hasMany(Customer::class, 'sales_representative_id');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'sales_representative_id');
    }

    public function sales()
    {
        return $this->hasMany(Invoice::class, 'sales_representative_id');
    }

    public function targets()
    {
        return $this->hasMany(RepresentativeTarget::class, 'sales_representative_id');
    }

    public function visitReports()
    {
        return $this->hasMany(VisitReport::class, 'sales_representative_id');
    }

    public function commissionCalculations()
    {
        return $this->hasMany(CommissionCalculation::class, 'sales_representative_id');
    }

    public function incentivePlans()
    {
        return $this->belongsToMany(IncentivePlan::class, 'representative_incentive_plans');
    }

    // الوصول للخصائص (Accessors)
    public function getDisplayNameAttribute()
    {
        return $this->name_ar ?? $this->name_en;
    }

    public function getFullNameAttribute()
    {
        $name = $this->name_ar;
        if ($this->name_en) {
            $name .= ' (' . $this->name_en . ')';
        }
        return $name;
    }

    public function getActiveIncentivePlanAttribute()
    {
        return $this->incentivePlans()
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('effective_from')
                      ->orWhere('effective_from', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('effective_to')
                      ->orWhere('effective_to', '>=', now());
            })
            ->first();
    }

    // الفلاتر (Scopes)
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCity($query, $city)
    {
        return $query->where('city', $city);
    }

    public function scopeByIncentivePlan($query, $planType)
    {
        return $query->where('incentive_plan', $planType);
    }

    public function scopeWithHighSales($query, $amount = 0)
    {
        return $query->where('total_sales', '>', $amount);
    }

    // Methods للإحصائيات والحسابات
    public function calculateMonthlySales($month = null, $year = null)
    {
        $month = $month ?? now()->month;
        $year = $year ?? now()->year;

        return $this->sales()
            ->whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->sum('total_amount');
    }

    public function calculateQuarterlySales($quarter = null, $year = null)
    {
        $year = $year ?? now()->year;
        $quarter = $quarter ?? ceil(now()->month / 3);

        $startMonth = ($quarter - 1) * 3 + 1;
        $endMonth = $quarter * 3;

        return $this->sales()
            ->whereBetween('created_at', [
                now()->setYear($year)->setMonth($startMonth)->startOfMonth(),
                now()->setYear($year)->setMonth($endMonth)->endOfMonth()
            ])
            ->sum('total_amount');
    }

    public function calculateAnnualSales($year = null)
    {
        $year = $year ?? now()->year;

        return $this->sales()
            ->whereYear('created_at', $year)
            ->sum('total_amount');
    }

    public function getAchievementPercentage($period = 'monthly', $month = null, $year = null)
    {
        $year = $year ?? now()->year;
        $month = $month ?? now()->month;

        switch ($period) {
            case 'monthly':
                $sales = $this->calculateMonthlySales($month, $year);
                $target = $this->monthly_target;
                break;
            case 'quarterly':
                $quarter = ceil($month / 3);
                $sales = $this->calculateQuarterlySales($quarter, $year);
                $target = $this->quarterly_target;
                break;
            case 'annual':
                $sales = $this->calculateAnnualSales($year);
                $target = $this->annual_target;
                break;
            default:
                return 0;
        }

        if (!$target || $target == 0) {
            return 0;
        }

        return round(($sales / $target) * 100, 2);
    }

    public function calculateCommission($salesAmount = null, $period = 'monthly')
    {
        $salesAmount = $salesAmount ?? $this->calculateMonthlySales();

        // استخدام خطة الحوافز النشطة
        $activePlan = $this->active_incentive_plan;

        if ($activePlan) {
            $targetData = [];
            switch ($period) {
                case 'monthly':
                    $targetData['target'] = $this->monthly_target;
                    break;
                case 'quarterly':
                    $targetData['target'] = $this->quarterly_target;
                    break;
                case 'annual':
                    $targetData['target'] = $this->annual_target;
                    break;
            }

            return $activePlan->calculateIncentive($salesAmount, $targetData);
        }

        // الطريقة التقليدية إذا لم تكن هناك خطة حوافز
        $settings = $this->incentive_settings ?? [];
        $rate = $settings['commission_rate'] ?? 0;

        return ($salesAmount * $rate) / 100;
    }

    public function updatePerformanceMetrics()
    {
        $this->update([
            'total_sales' => $this->calculateAnnualSales(),
            'total_customers' => $this->customers()->count(),
            'avg_monthly_sales' => $this->calculateAnnualSales() / 12,
        ]);
    }

    // Events
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($representative) {
            if (!$representative->code) {
                $representative->code = 'REP' . str_pad(
                    static::max('id') + 1,
                    6,
                    '0',
                    STR_PAD_LEFT
                );
            }
        });
    }
}
