<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class Representative extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'password',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'password',
    ];

    // تشفير كلمة المرور تلقائياً عند الحفظ
    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = Hash::make($value);
    }

    // نطاق للمندوبين النشطين
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // التحقق من كلمة المرور
    public function checkPassword($password)
    {
        return Hash::check($password, $this->password);
    }

    // العلاقات الجديدة
    public function salaryPlans()
    {
        return $this->hasMany(RepresentativeSalaryPlan::class);
    }

    public function currentSalaryPlan()
    {
        return $this->hasOne(RepresentativeSalaryPlan::class)
                    ->active()
                    ->current()
                    ->latest();
    }

    public function targets()
    {
        return $this->hasMany(RepresentativeTarget::class);
    }

    public function currentTargets()
    {
        return $this->hasMany(RepresentativeTarget::class)
                    ->currentPeriod()
                    ->active();
    }

    public function sales()
    {
        return $this->hasMany(RepresentativeSale::class);
    }

    public function customers()
    {
        return $this->hasMany(RepresentativeCustomer::class);
    }

    public function activeCustomers()
    {
        return $this->hasMany(RepresentativeCustomer::class)->active();
    }

    public function monthlyPerformance($year = null, $month = null)
    {
        $year = $year ?: now()->year;
        $month = $month ?: now()->month;

        $startDate = "{$year}-{$month}-01";
        $endDate = date('Y-m-t', strtotime($startDate));

        return [
            'total_sales' => $this->sales()
                ->byPeriod($startDate, $endDate)
                ->confirmed()
                ->sum('total_selling_amount'),

            'total_boxes' => $this->sales()
                ->byPeriod($startDate, $endDate)
                ->confirmed()
                ->sum('quantity_sold'),

            'total_returns' => $this->sales()
                ->byPeriod($startDate, $endDate)
                ->sum('returned_amount'),

            'total_paid' => $this->sales()
                ->byPeriod($startDate, $endDate)
                ->sum('paid_amount'),

            'invoice_count' => $this->sales()
                ->byPeriod($startDate, $endDate)
                ->confirmed()
                ->count(),

            'targets_achievement' => $this->targets()
                ->where('period_start', '<=', $endDate)
                ->where('period_end', '>=', $startDate)
                ->active()
                ->get()
                ->map(function($target) {
                    return [
                        'category' => $target->category_display_name,
                        'supplier' => $target->supplier ? $target->supplier->company_name : 'جميع الموردين',
                        'target' => $target->target_quantity,
                        'achieved' => $target->achieved_quantity,
                        'percentage' => $target->achievement_percentage,
                        'remaining' => $target->remaining_quantity,
                        'status' => $target->status
                    ];
                })
        ];
    }
}
