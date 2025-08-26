<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SalaryPlanTarget extends Model
{
    use HasFactory;

    protected $fillable = [
        'salary_plan_id',
        'product_id',
        'target_quantity',
        'required_percentage',
        'target_date',
        'achieved_quantity',
        'achievement_percentage',
        'is_achieved'
    ];

    protected $casts = [
        'target_quantity' => 'integer',
        'required_percentage' => 'decimal:2',
        'target_date' => 'date',
        'achieved_quantity' => 'integer',
        'achievement_percentage' => 'decimal:2',
        'is_achieved' => 'boolean'
    ];

    // العلاقات
    public function salaryPlan()
    {
        return $this->belongsTo(SalaryPlan::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // الحسابات
    public function updateAchievement($soldQuantity)
    {
        $this->achieved_quantity = $soldQuantity;
        $this->achievement_percentage = ($soldQuantity / $this->target_quantity) * 100;
        $this->is_achieved = $this->achievement_percentage >= $this->required_percentage;
        $this->save();
    }

    public function getStatusAttribute()
    {
        if ($this->is_achieved) {
            return 'محقق';
        } elseif ($this->achievement_percentage > 0) {
            return 'جاري';
        } else {
            return 'لم يبدأ';
        }
    }

    public function getRemainingQuantityAttribute()
    {
        $required = ($this->target_quantity * $this->required_percentage) / 100;
        return max(0, $required - $this->achieved_quantity);
    }
}
