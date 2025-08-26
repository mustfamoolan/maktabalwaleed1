<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Debt extends Model
{
    protected $fillable = [
        'sale_id',
        'debt_number',
        'debtor_type',
        'customer_id',
        'representative_id',
        'original_amount',
        'paid_amount',
        'remaining_amount',
        'status',
        'due_date',
        'last_payment_date',
        'notes',
        'payment_reminders_sent',
    ];

    protected $casts = [
        'original_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'due_date' => 'date',
        'last_payment_date' => 'date',
        'payment_reminders_sent' => 'integer',
    ];

    // العلاقات
    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(RepresentativeCustomer::class, 'customer_id');
    }

    public function representative(): BelongsTo
    {
        return $this->belongsTo(Representative::class, 'representative_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(DebtPayment::class);
    }

    // الطرق المساعدة
    public function generateDebtNumber(): string
    {
        $date = now()->format('Ymd');
        $lastDebt = static::whereDate('created_at', today())->latest()->first();
        $sequence = $lastDebt ? (int)substr($lastDebt->debt_number, -4) + 1 : 1;
        return 'DEBT-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    public function getDebtorNameAttribute(): string
    {
        if ($this->debtor_type === 'customer' && $this->customer) {
            return $this->customer->name;
        } elseif ($this->debtor_type === 'representative' && $this->representative) {
            return $this->representative->name;
        }
        return 'غير محدد';
    }

    public function getDebtorPhoneAttribute(): ?string
    {
        if ($this->debtor_type === 'customer' && $this->customer) {
            return $this->customer->phone;
        } elseif ($this->debtor_type === 'representative' && $this->representative) {
            return $this->representative->phone;
        }
        return null;
    }

    public function isOverdue(): bool
    {
        return $this->due_date < now()->toDateString() && $this->remaining_amount > 0;
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid' && $this->remaining_amount <= 0;
    }

    public function makePayment(float $amount, string $method = 'cash', ?string $notes = null): DebtPayment
    {
        $payment = $this->payments()->create([
            'payment_number' => $this->generatePaymentNumber(),
            'amount' => $amount,
            'payment_method' => $method,
            'notes' => $notes,
            'received_by_representative_id' => auth()->user()->id ?? 1,
            'payment_date' => now(),
        ]);

        $this->paid_amount += $amount;
        $this->remaining_amount -= $amount;
        $this->last_payment_date = now()->toDateString();

        if ($this->remaining_amount <= 0) {
            $this->status = 'paid';
            $this->remaining_amount = 0;
        } elseif ($this->paid_amount > 0) {
            $this->status = 'partially_paid';
        }

        $this->save();

        return $payment;
    }

    private function generatePaymentNumber(): string
    {
        $date = now()->format('Ymd');
        $lastPayment = DebtPayment::whereDate('created_at', today())->latest()->first();
        $sequence = $lastPayment ? (int)substr($lastPayment->payment_number, -4) + 1 : 1;
        return 'PAY-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($debt) {
            if (empty($debt->debt_number)) {
                $debt->debt_number = $debt->generateDebtNumber();
            }
        });
    }
}
