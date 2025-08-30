<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Sale extends Model
{
    protected $fillable = [
        'sale_number',
        'sale_type',
        'seller_representative_id',
        'customer_id',
        'buyer_representative_id',
        'subtotal',
        'total_amount',
        'paid_amount',
        'remaining_amount',
        'discount_amount',
        'payment_status',
        'sale_status',
        'status',
        'primary_supplier_id',
        'primary_category_id',
        'total_profit',
        'driver_id',
        'status_notes',
        'prepared_by',
        'preparation_notes',
        'preparation_completed_at',
        'notes',
        'customer_name',
        'customer_phone',
        'sale_date',
        'due_date',
        'sent_at',
        'prepared_at',
        'delivered_at',
        'approved_at',
        'total_weight_grams',
        'total_weight_kg',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_profit' => 'decimal:2',
        'total_weight_grams' => 'decimal:2',
        'total_weight_kg' => 'decimal:3',
        'sale_date' => 'datetime',
        'due_date' => 'date',
        'sent_at' => 'datetime',
        'prepared_at' => 'datetime',
        'delivered_at' => 'datetime',
        'approved_at' => 'datetime',
        'preparation_completed_at' => 'datetime',
    ];

    // العلاقات
    public function sellerRepresentative(): BelongsTo
    {
        return $this->belongsTo(Representative::class, 'seller_representative_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(RepresentativeCustomer::class, 'customer_id');
    }

    public function buyerRepresentative(): BelongsTo
    {
        return $this->belongsTo(Representative::class, 'buyer_representative_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function debt(): HasOne
    {
        return $this->hasOne(Debt::class);
    }

    public function primarySupplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'primary_supplier_id');
    }

    public function primaryCategory(): BelongsTo
    {
        return $this->belongsTo(SupplierCategory::class, 'primary_category_id');
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function preparer(): BelongsTo
    {
        return $this->belongsTo(Preparer::class, 'prepared_by');
    }

    // الطرق المساعدة
    public function generateSaleNumber(): string
    {
        $date = now()->format('Ymd');
        $lastSale = static::whereDate('created_at', today())->latest()->first();
        $sequence = $lastSale ? (int)substr($lastSale->sale_number, -4) + 1 : 1;
        return 'SAL-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    public function getTotalProfitAttribute(): float
    {
        return $this->items->sum('profit_amount');
    }

    public function getCustomerNameAttribute(): string
    {
        if ($this->sale_type === 'customer' && $this->customer) {
            return $this->customer->name;
        } elseif ($this->sale_type === 'representative' && $this->buyerRepresentative) {
            return $this->buyerRepresentative->name;
        }
        return $this->attributes['customer_name'] ?? 'عميل حاضر';
    }

    public function isFullyPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    public function hasDebt(): bool
    {
        return $this->remaining_amount > 0;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($sale) {
            if (empty($sale->sale_number)) {
                $sale->sale_number = $sale->generateSaleNumber();
            }
        });
    }
}
