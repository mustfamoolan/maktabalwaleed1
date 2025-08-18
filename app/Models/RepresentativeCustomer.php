<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RepresentativeCustomer extends Model
{
    use HasFactory;

    protected $fillable = [
        'representative_id',
        'customer_name',
        'phone',
        'address',
        'governorate',
        'city',
        'nearest_landmark',
        'total_debt',
        'total_paid',
        'debt_due_date',
        'completed_invoices',
        'cancelled_invoices',
        'returned_invoices',
        'total_purchases',
        'status',
        'notes'
    ];

    protected $casts = [
        'total_debt' => 'decimal:2',
        'total_paid' => 'decimal:2',
        'debt_due_date' => 'date',
        'completed_invoices' => 'integer',
        'cancelled_invoices' => 'integer',
        'returned_invoices' => 'integer',
        'total_purchases' => 'integer',
    ];

    // العلاقات
    public function representative()
    {
        return $this->belongsTo(Representative::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'customer_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByGovernorate($query, $governorate)
    {
        return $query->where('governorate', $governorate);
    }

    public function scopeWithDebt($query)
    {
        return $query->where('total_debt', '>', 0);
    }

    public function scopeOverdue($query)
    {
        return $query->where('debt_due_date', '<', now()->toDateString())
                    ->where('total_debt', '>', 0);
    }

    // خصائص محسوبة
    public function getRemainingDebtAttribute()
    {
        return $this->total_debt - $this->total_paid;
    }

    public function getIsOverdueAttribute()
    {
        return $this->debt_due_date &&
               $this->debt_due_date->isPast() &&
               $this->remaining_debt > 0;
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'active' => 'green',
            'inactive' => 'gray',
            'suspended' => 'red',
            default => 'gray'
        };
    }

    public function getStatusTextAttribute()
    {
        return match($this->status) {
            'active' => 'نشط',
            'inactive' => 'غير نشط',
            'suspended' => 'معلق',
            default => 'غير محدد'
        };
    }

    // إحصائيات
    public function getSuccessRateAttribute()
    {
        $total = $this->completed_invoices + $this->cancelled_invoices;
        return $total > 0 ? ($this->completed_invoices / $total) * 100 : 0;
    }
}
