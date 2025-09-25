<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseInvoiceItem extends Model
{
    protected $fillable = [
        'purchase_invoice_id',
        'product_id',
        'product_name',
        'supplier_name',
        'category_name',
        'purchase_price',
        'purchase_price_after_cost',
        'sale_price',
        'wholesale_price',
        'quantity',
        'total_price',
        'allocated_cost',
        'notes'
    ];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'purchase_price_after_cost' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'allocated_cost' => 'decimal:2'
    ];

    // العلاقة مع الفاتورة
    public function purchaseInvoice(): BelongsTo
    {
        return $this->belongsTo(PurchaseInvoice::class);
    }

    // العلاقة مع المنتج
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // حساب المجموع تلقائياً عند الحفظ
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($item) {
            $item->total_price = $item->quantity * $item->purchase_price;
        });
    }
}
