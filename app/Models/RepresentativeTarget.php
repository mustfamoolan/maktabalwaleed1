<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RepresentativeTarget extends Model
{
    use HasFactory;

    protected $fillable = [
        'representative_id',
        'supplier_id',
        'product_category',
        'category_name',
        'target_quantity',
        'unit_type',
        'period_start',
        'period_end',
        'period_type',
        'incentive_amount',
        'bonus_percentage',
        'is_active',
        'achieved_quantity',
        'achievement_percentage',
        'notes'
    ];

    protected $casts = [
        'target_quantity' => 'integer',
        'period_start' => 'date',
        'period_end' => 'date',
        'incentive_amount' => 'decimal:2',
        'bonus_percentage' => 'decimal:2',
        'is_active' => 'boolean',
        'achieved_quantity' => 'integer',
        'achievement_percentage' => 'decimal:2',
    ];

    // العلاقات
    public function representative()
    {
        return $this->belongsTo(Representative::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCurrentPeriod($query)
    {
        $now = now()->toDateString();
        return $query->where('period_start', '<=', $now)
                    ->where('period_end', '>=', $now);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('product_category', $category);
    }

    public function scopeBySupplier($query, $supplierId)
    {
        return $query->where('supplier_id', $supplierId);
    }

    // خصائص محسوبة
    public function getCategoryDisplayNameAttribute()
    {
        $categories = [
            'food' => 'مواد غذائية',
            'cleaning' => 'مواد تنظيف',
            'mixed' => 'مختلط',
            'other' => 'أخرى'
        ];

        return $this->category_name ?: ($categories[$this->product_category] ?? 'غير محدد');
    }

    public function getPeriodDisplayNameAttribute()
    {
        $types = [
            'monthly' => 'شهري',
            'quarterly' => 'ربع سنوي',
            'custom' => 'مخصص'
        ];

        return $types[$this->period_type] ?? 'غير محدد';
    }

    public function getRemainingQuantityAttribute()
    {
        return max(0, $this->target_quantity - $this->achieved_quantity);
    }

    public function getIsAchievedAttribute()
    {
        return $this->achievement_percentage >= 100;
    }

    public function getStatusAttribute()
    {
        if ($this->achievement_percentage >= 100) {
            return 'محقق';
        } elseif ($this->achievement_percentage >= 80) {
            return 'قريب من التحقيق';
        } elseif ($this->achievement_percentage >= 50) {
            return 'في المسار';
        } else {
            return 'يحتاج جهد أكبر';
        }
    }

    public function getStatusColorAttribute()
    {
        if ($this->achievement_percentage >= 100) {
            return 'green';
        } elseif ($this->achievement_percentage >= 80) {
            return 'blue';
        } elseif ($this->achievement_percentage >= 50) {
            return 'yellow';
        } else {
            return 'red';
        }
    }

    // دوال مساعدة
    public function updateAchievement()
    {
        // حساب الكمية المحققة من جدول المبيعات
        $achieved = RepresentativeSale::where('representative_id', $this->representative_id)
            ->when($this->supplier_id, function($q) {
                return $q->where('supplier_id', $this->supplier_id);
            })
            ->when($this->product_category !== 'mixed', function($q) {
                return $q->where('product_category', $this->product_category);
            })
            ->whereBetween('sale_date', [$this->period_start, $this->period_end])
            ->where('sale_status', '!=', 'cancelled')
            ->sum('quantity_sold');

        $this->achieved_quantity = $achieved;
        $this->achievement_percentage = $this->target_quantity > 0
            ? ($achieved / $this->target_quantity) * 100
            : 0;

        $this->save();

        return $this;
    }

    public function calculateIncentive()
    {
        if (!$this->incentive_amount || $this->achievement_percentage < 100) {
            return 0;
        }

        $baseIncentive = $this->incentive_amount;

        // حافز إضافي إذا تجاوز الهدف
        if ($this->achievement_percentage > 100 && $this->bonus_percentage) {
            $extraPercentage = $this->achievement_percentage - 100;
            $bonus = $baseIncentive * ($extraPercentage / 100) * ($this->bonus_percentage / 100);
            return $baseIncentive + $bonus;
        }

        return $baseIncentive;
    }
}
