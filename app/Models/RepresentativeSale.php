<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RepresentativeSale extends Model
{
    use HasFactory;

    protected $fillable = [
        'representative_id',
        'product_id',
        'supplier_id',
        'invoice_number',
        'sale_date',
        'customer_name',
        'customer_address',
        'customer_phone',
        'product_name',
        'product_category',
        'quantity_sold',
        'unit_type',
        'unit_cost_price',
        'unit_selling_price',
        'total_cost',
        'total_selling_amount',
        'profit_amount',
        'commission_amount',
        'sale_status',
        'payment_status',
        'paid_amount',
        'remaining_amount',
        'returned_quantity',
        'returned_amount',
        'return_date',
        'return_reason',
        'notes'
    ];

    protected $casts = [
        'sale_date' => 'date',
        'quantity_sold' => 'integer',
        'unit_cost_price' => 'decimal:2',
        'unit_selling_price' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'total_selling_amount' => 'decimal:2',
        'profit_amount' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'returned_quantity' => 'integer',
        'returned_amount' => 'decimal:2',
        'return_date' => 'date',
    ];

    // العلاقات
    public function representative()
    {
        return $this->belongsTo(Representative::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    // Scopes
    public function scopeByRepresentative($query, $representativeId)
    {
        return $query->where('representative_id', $representativeId);
    }

    public function scopeByPeriod($query, $startDate, $endDate)
    {
        return $query->whereBetween('sale_date', [$startDate, $endDate]);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('product_category', $category);
    }

    public function scopeBySupplier($query, $supplierId)
    {
        return $query->where('supplier_id', $supplierId);
    }

    public function scopeConfirmed($query)
    {
        return $query->whereIn('sale_status', ['confirmed', 'delivered']);
    }

    public function scopePending($query)
    {
        return $query->where('sale_status', 'pending');
    }

    public function scopeReturned($query)
    {
        return $query->where('sale_status', 'returned');
    }

    public function scopeOverdue($query)
    {
        return $query->where('payment_status', 'overdue');
    }

    // خصائص محسوبة
    public function getSaleStatusDisplayAttribute()
    {
        $statuses = [
            'pending' => 'معلق',
            'confirmed' => 'مؤكد',
            'delivered' => 'تم التسليم',
            'returned' => 'مرتجع',
            'cancelled' => 'ملغي'
        ];

        return $statuses[$this->sale_status] ?? 'غير محدد';
    }

    public function getPaymentStatusDisplayAttribute()
    {
        $statuses = [
            'pending' => 'معلق',
            'partial' => 'دفع جزئي',
            'paid' => 'مدفوع',
            'overdue' => 'متأخر'
        ];

        return $statuses[$this->payment_status] ?? 'غير محدد';
    }

    public function getCategoryDisplayAttribute()
    {
        $categories = [
            'food' => 'مواد غذائية',
            'cleaning' => 'مواد تنظيف',
            'mixed' => 'مختلط',
            'other' => 'أخرى'
        ];

        return $categories[$this->product_category] ?? 'غير محدد';
    }

    public function getNetQuantityAttribute()
    {
        return $this->quantity_sold - $this->returned_quantity;
    }

    public function getNetAmountAttribute()
    {
        return $this->total_selling_amount - $this->returned_amount;
    }

    public function getNetProfitAttribute()
    {
        $netQuantity = $this->net_quantity;
        $netAmount = $this->net_amount;
        $netCost = $netQuantity * $this->unit_cost_price;

        return $netAmount - $netCost;
    }

    public function getProfitMarginAttribute()
    {
        if ($this->total_selling_amount <= 0) {
            return 0;
        }

        return ($this->profit_amount / $this->total_selling_amount) * 100;
    }

    public function getCommissionRateAttribute()
    {
        if ($this->total_selling_amount <= 0) {
            return 0;
        }

        return ($this->commission_amount / $this->total_selling_amount) * 100;
    }

    // دوال مساعدة
    public function calculateAmounts()
    {
        $this->total_cost = $this->quantity_sold * $this->unit_cost_price;
        $this->total_selling_amount = $this->quantity_sold * $this->unit_selling_price;
        $this->profit_amount = $this->total_selling_amount - $this->total_cost;
        $this->remaining_amount = $this->total_selling_amount - $this->paid_amount;

        $this->save();

        return $this;
    }

    public function processReturn($returnQuantity, $returnReason = null)
    {
        if ($returnQuantity > $this->quantity_sold - $this->returned_quantity) {
            throw new \InvalidArgumentException('كمية الإرجاع أكبر من الكمية المتاحة');
        }

        $this->returned_quantity += $returnQuantity;
        $this->returned_amount += $returnQuantity * $this->unit_selling_price;
        $this->return_date = now();
        $this->return_reason = $returnReason;

        if ($this->returned_quantity >= $this->quantity_sold) {
            $this->sale_status = 'returned';
        }

        $this->save();

        // تحديث الأهداف المرتبطة
        $this->updateRelatedTargets();

        return $this;
    }

    public function processPayment($amount)
    {
        $this->paid_amount += $amount;

        if ($this->paid_amount >= $this->total_selling_amount) {
            $this->payment_status = 'paid';
        } elseif ($this->paid_amount > 0) {
            $this->payment_status = 'partial';
        }

        $this->remaining_amount = $this->total_selling_amount - $this->paid_amount;
        $this->save();

        return $this;
    }

    protected function updateRelatedTargets()
    {
        // تحديث الأهداف المرتبطة بهذا المندوب والفترة الزمنية
        $targets = RepresentativeTarget::where('representative_id', $this->representative_id)
            ->where('period_start', '<=', $this->sale_date)
            ->where('period_end', '>=', $this->sale_date)
            ->when($this->supplier_id, function($q) {
                return $q->where('supplier_id', $this->supplier_id);
            })
            ->when($this->product_category !== 'mixed', function($q) {
                return $q->where('product_category', $this->product_category);
            })
            ->get();

        foreach ($targets as $target) {
            $target->updateAchievement();
        }
    }

    // Events
    protected static function booted()
    {
        static::created(function ($sale) {
            $sale->updateRelatedTargets();
        });

        static::updated(function ($sale) {
            $sale->updateRelatedTargets();
        });

        static::deleted(function ($sale) {
            $sale->updateRelatedTargets();
        });
    }
}
