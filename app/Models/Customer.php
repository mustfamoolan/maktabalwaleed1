<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'sales_representative_id',
        'code',
        'name_ar',
        'name_en',
        'contact_person',
        'phone',
        'mobile',
        'email',
        'address',
        'city',
        'district',
        'postal_code',
        'latitude',
        'longitude',
        'tax_number',
        'commercial_record',
        'customer_type',
        'pricing_tier',
        'credit_limit',
        'payment_days',
        'is_active',
        'total_purchases',
        'total_payments',
        'current_balance',
        'last_purchase_date',
        'visit_frequency',
        'next_visit_date',
        'notes'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'credit_limit' => 'decimal:2',
        'total_purchases' => 'decimal:2',
        'total_payments' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'payment_days' => 'integer',
        'visit_frequency' => 'integer',
        'last_purchase_date' => 'date',
        'next_visit_date' => 'date'
    ];

    // العلاقات
    public function salesRepresentative()
    {
        return $this->belongsTo(SalesRepresentative::class, 'sales_representative_id');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function visitReports()
    {
        return $this->hasMany(VisitReport::class);
    }

    // الوصول للخصائص (Accessors)
    public function getDisplayNameAttribute()
    {
        return $this->name_ar ?? $this->name_en;
    }

    // الفلاتر (Scopes)
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByRepresentative($query, $representativeId)
    {
        return $query->where('sales_representative_id', $representativeId);
    }

    // Events
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($customer) {
            if (!$customer->code) {
                $customer->code = 'CUS' . str_pad(
                    static::max('id') + 1,
                    6,
                    '0',
                    STR_PAD_LEFT
                );
            }
        });
    }
}
