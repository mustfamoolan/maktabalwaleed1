<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseReturnInvoice extends Model
{
    protected $fillable = [
        'invoice_number',
        'invoice_date',
        'supplier_id',
        'supplier_name',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'additional_costs',
        'final_total',
        'status',
        'notes',
        'created_by'
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'additional_costs' => 'decimal:2',
        'final_total' => 'decimal:2'
    ];

    // العلاقة مع المورد
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    // العلاقة مع منشئ الفاتورة
    public function creator(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'created_by');
    }

    // العلاقة مع عناصر الفاتورة
    public function items(): HasMany
    {
        return $this->hasMany(PurchaseReturnInvoiceItem::class);
    }

    // توليد رقم فاتورة جديد
    public static function generateInvoiceNumber(): string
    {
        $lastInvoice = self::latest('id')->first();
        $nextNumber = $lastInvoice ? $lastInvoice->id + 1 : 1;
        return 'PRTI-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }

    // حساب المجاميع تلقائياً عند الحفظ
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($invoice) {
            $invoice->subtotal = $invoice->items->sum('total_price');
            $invoice->total_amount = $invoice->subtotal - $invoice->discount_amount + $invoice->tax_amount;
            $invoice->final_total = $invoice->total_amount + $invoice->additional_costs;
        });

        // عند حذف الفاتورة، إعادة الكميات للمخزون
        static::deleting(function ($invoice) {
            if ($invoice->status === 'confirmed') {
                foreach ($invoice->items as $item) {
                    $product = Product::find($item->product_id);
                    if ($product) {
                        $product->increment('stock_quantity', $item->quantity);
                    }
                }
            }
        });
    }

    // تأكيد الفاتورة وخصم الكميات من المخزون
    public function confirm()
    {
        if ($this->status !== 'draft') {
            throw new \Exception('لا يمكن تأكيد فاتورة غير مسودة');
        }

        foreach ($this->items as $item) {
            $product = Product::find($item->product_id);
            if (!$product) {
                throw new \Exception("المنتج {$item->product_name} غير موجود");
            }

            if ($product->stock_quantity < $item->quantity) {
                throw new \Exception("الكمية المطلوبة من {$item->product_name} غير متوفرة في المخزون");
            }

            // خصم الكمية من المخزون (مرتجع = تقليل من المخزون)
            $product->decrement('stock_quantity', $item->quantity);
        }

        $this->update(['status' => 'confirmed']);
    }

    // إلغاء الفاتورة وإعادة الكميات للمخزون
    public function cancel()
    {
        if ($this->status === 'confirmed') {
            foreach ($this->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->increment('stock_quantity', $item->quantity);
                }
            }
        }

        $this->update(['status' => 'cancelled']);
    }

    // الحصول على لون الحالة
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'draft' => 'warning',
            'confirmed' => 'success',
            'cancelled' => 'danger',
            default => 'secondary'
        };
    }

    // الحصول على نص الحالة
    public function getStatusTextAttribute(): string
    {
        return match($this->status) {
            'draft' => 'مسودة',
            'confirmed' => 'مؤكدة',
            'cancelled' => 'ملغية',
            default => 'غير محدد'
        };
    }
}
