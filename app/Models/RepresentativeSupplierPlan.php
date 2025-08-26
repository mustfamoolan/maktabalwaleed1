<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RepresentativeSupplierPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'representative_id',
        'supplier_id',
        'plan_name',
        'target_quantity',
        'required_percentage',
        'start_date',
        'end_date',
        'notes',
        'status',
        'achieved_quantity',
        'achievement_percentage'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'required_percentage' => 'decimal:2',
        'achievement_percentage' => 'decimal:2'
    ];

    public function representative()
    {
        return $this->belongsTo(Representative::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * حساب نسبة الإنجاز للخطة
     */
    public function calculateAchievementPercentage()
    {
        if ($this->target_quantity <= 0) {
            return 0;
        }

        $achievedQuantity = $this->achieved_quantity ?? 0;
        $percentage = ($achievedQuantity / $this->target_quantity) * 100;

        // تحديث نسبة الإنجاز في قاعدة البيانات
        $this->update(['achievement_percentage' => round($percentage, 2)]);

        return round($percentage, 2);
    }

    /**
     * تحديث حالة الخطة بناءً على التقدم والتاريخ
     */
    public function updateStatus()
    {
        $now = now();
        $achievementPercentage = $this->achievement_percentage ?? 0;

        if ($achievementPercentage >= $this->required_percentage) {
            $status = 'completed';
        } elseif ($now > $this->end_date) {
            $status = 'expired';
        } else {
            $status = 'active';
        }

        $this->update(['status' => $status]);
        return $status;
    }
}
