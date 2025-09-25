<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class Representative extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'password',
        'is_active'
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // تشفير كلمة المرور عند الحفظ
    public function setPasswordAttribute($password)
    {
        $this->attributes['password'] = Hash::make($password);
    }

    // التحقق من كلمة المرور
    public function checkPassword($password)
    {
        return Hash::check($password, $this->password);
    }

    // الحصول على المندوبين النشيطين
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // العلاقة مع الرواتب
    public function salaries()
    {
        return $this->hasMany(RepresentativeSalary::class);
    }

    // الحصول على الراتب النشط
    public function activeSalary()
    {
        return $this->hasOne(RepresentativeSalary::class)
            ->where('is_active', true)
            ->whereDate('effective_from', '<=', now())
            ->where(function ($query) {
                $query->whereNull('effective_to')
                    ->orWhereDate('effective_to', '>=', now());
            });
    }

    // العلاقة مع خطط البيع
    public function salesPlans()
    {
        return $this->hasMany(SalesPlan::class);
    }

    // العلاقة مع تخصيص الخطط
    public function planAssignments()
    {
        return $this->hasMany(RepresentativePlanAssignment::class);
    }

    // العلاقة مع إنجازات الخطط
    public function achievements()
    {
        return $this->hasMany(PlanAchievement::class);
    }

    // حساب الراتب الشهري
    public function calculateMonthlySalary($month)
    {
        return PlanAchievement::calculateMonthlySalary($this->id, $month);
    }

    // إنشاء رقم مندوب تلقائي
    public static function generateRepresentativeCode()
    {
        $lastRep = self::orderBy('id', 'desc')->first();
        $lastNumber = $lastRep ? $lastRep->id : 0;
        return 'REP' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
    }
}
