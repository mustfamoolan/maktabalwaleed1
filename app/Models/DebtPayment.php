<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DebtPayment extends Model
{
    protected $fillable = [
        'debt_id',
        'payment_number',
        'amount',
        'payment_method',
        'reference_number',
        'notes',
        'received_by_representative_id',
        'payment_date',
        'value_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'value_date' => 'date',
    ];

    // العلاقات
    public function debt(): BelongsTo
    {
        return $this->belongsTo(Debt::class);
    }

    public function receivedByRepresentative(): BelongsTo
    {
        return $this->belongsTo(Representative::class, 'received_by_representative_id');
    }

    // الطرق المساعدة
    public function getPaymentMethodNameAttribute(): string
    {
        $methods = [
            'cash' => 'نقدي',
            'transfer' => 'حوالة',
            'check' => 'شيك',
            'card' => 'بطاقة',
        ];

        return $methods[$this->payment_method] ?? 'غير محدد';
    }

    public function isPostDated(): bool
    {
        return $this->value_date && $this->value_date > now()->toDateString();
    }

    public function isCleared(): bool
    {
        return !$this->isPostDated();
    }
}
