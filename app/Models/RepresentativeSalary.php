<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepresentativeSalary extends Model
{
    protected $fillable = [
        'representative_id',
        'basic_salary',
        'effective_from',
        'effective_to',
        'is_active'
    ];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'is_active' => 'boolean'
    ];

    // العلاقة مع المندوب
    public function representative(): BelongsTo
    {
        return $this->belongsTo(Representative::class);
    }

    // الحصول على الراتب النشط للمندوب
    public static function getActiveSalary($representativeId)
    {
        return self::where('representative_id', $representativeId)
            ->where('is_active', true)
            ->whereDate('effective_from', '<=', now())
            ->where(function ($query) {
                $query->whereNull('effective_to')
                    ->orWhereDate('effective_to', '>=', now());
            })
            ->first();
    }
}
