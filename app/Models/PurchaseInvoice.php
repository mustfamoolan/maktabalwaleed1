<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseInvoice extends Model
{
    protected $fillable = [
        'invoice_number',
        'invoice_date',
        'supplier_id',
        'total_amount',
        'driver_cost',
        'workers_cost',
        'total_cost',
        'final_total',
        'notes',
        'status',
        'created_by'
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'total_amount' => 'decimal:2',
        'driver_cost' => 'decimal:2',
        'workers_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'final_total' => 'decimal:2'
    ];

    // العلاقة مع تفاصيل الفاتورة
    public function items(): HasMany
    {
        return $this->hasMany(PurchaseInvoiceItem::class);
    }

    // العلاقة مع المورد
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    // العلاقة مع المستخدم الذي أنشأ الفاتورة
    public function creator(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'created_by');
    }

    // حساب التكلفة الإجمالية الإضافية
    public function calculateTotalCost(): void
    {
        $this->total_cost = $this->driver_cost + $this->workers_cost;
        $this->final_total = $this->total_amount + $this->total_cost;
    }

    // توزيع التكلفة على المنتجات
    public function distributeCostToItems(): void
    {
        $totalAmount = $this->total_amount;
        $totalCost = $this->total_cost;

        if ($totalAmount > 0 && $totalCost > 0) {
            foreach ($this->items as $item) {
                // حساب نسبة هذا المنتج من إجمالي الفاتورة
                $itemRatio = $item->total_price / $totalAmount;

                // توزيع التكلفة حسب النسبة
                $allocatedCost = $totalCost * $itemRatio;
                $item->allocated_cost = $allocatedCost;

                // حساب سعر الشراء بعد التكلفة
                $costPerUnit = $allocatedCost / $item->quantity;
                $item->purchase_price_after_cost = $item->purchase_price + $costPerUnit;

                $item->save();
            }
        }
    }

    // توليد رقم فاتورة تلقائي
    public static function generateInvoiceNumber(): string
    {
        $lastInvoice = self::orderBy('id', 'desc')->first();
        $lastNumber = $lastInvoice ? intval(substr($lastInvoice->invoice_number, 3)) : 0;
        return 'PUR' . str_pad($lastNumber + 1, 6, '0', STR_PAD_LEFT);
    }
}
