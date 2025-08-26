<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RepresentativeSalary extends Model
{
    use HasFactory;

    protected $fillable = [
        'representative_id',
        'base_salary',
        'allowances',
        'deductions',
        'is_active',
        'effective_date',
        'notes'
    ];

    protected $casts = [
        'base_salary' => 'decimal:2',
        'allowances' => 'decimal:2',
        'deductions' => 'decimal:2',
        'is_active' => 'boolean',
        'effective_date' => 'date'
    ];

    /**
     * العلاقة مع المندوب
     */
    public function representative()
    {
        return $this->belongsTo(Representative::class);
    }

    /**
     * حساب إجمالي الراتب
     */
    public function getTotalSalaryAttribute()
    {
        return $this->base_salary + $this->allowances - $this->deductions;
    }

    /**
     * Scope للرواتب النشطة
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * الحصول على آخر راتب نشط للمندوب
     */
    public function scopeCurrent($query)
    {
        return $query->where('is_active', true)
                    ->orderBy('effective_date', 'desc');
    }
}
