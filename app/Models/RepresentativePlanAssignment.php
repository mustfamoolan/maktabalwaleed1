<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepresentativePlanAssignment extends Model
{
    protected $fillable = [
        'representative_id',
        'plan_id',
        'plan_type',
        'assigned_date',
        'is_active'
    ];

    protected $casts = [
        'assigned_date' => 'date',
        'is_active' => 'boolean'
    ];

    // العلاقة مع المندوب
    public function representative(): BelongsTo
    {
        return $this->belongsTo(Representative::class);
    }

    // الحصول على الخطة حسب النوع
    public function getPlanAttribute()
    {
        switch ($this->plan_type) {
            case 'sales_plan':
                return SalesPlan::find($this->plan_id);
            case 'commission_plan':
                return CommissionPlan::find($this->plan_id);
            default:
                return null;
        }
    }
}
