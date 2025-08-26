<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SalaryPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'representative_id',
        'plan_name',
        'start_date',
        'end_date',
        'is_active',
        'notes'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean'
    ];

    // العلاقات
    public function representative()
    {
        return $this->belongsTo(Representative::class);
    }

    public function targets()
    {
        return $this->hasMany(SalaryPlanTarget::class);
    }

    // الفلاتر
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCurrent($query)
    {
        $now = now();
        return $query->where('start_date', '<=', $now)
                    ->where('end_date', '>=', $now);
    }

    // الحسابات
    public function calculateOverallAchievement()
    {
        $targets = $this->targets;
        if ($targets->isEmpty()) {
            return 0;
        }

        $totalAchievement = $targets->sum('achievement_percentage');
        return $totalAchievement / $targets->count();
    }

    public function calculateEarnedSalary()
    {
        $overallAchievement = $this->calculateOverallAchievement();
        return ($this->fixed_salary * $overallAchievement) / 100;
    }

    public function isFullyAchieved()
    {
        return $this->targets->every(function ($target) {
            return $target->achievement_percentage >= $target->required_percentage;
        });
    }
}
