<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'product_id',
        'cartons_quantity',
        'units_per_carton',
        'total_units',
        'unit_price',
        'carton_price',
        'total_price'
    ];

    protected $casts = [
        'cartons_quantity' => 'integer',
        'units_per_carton' => 'integer',
        'total_units' => 'integer',
        'unit_price' => 'decimal:2',
        'carton_price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    // العلاقات
    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Helper methods
    public function calculateTotalUnits()
    {
        return $this->cartons_quantity * $this->units_per_carton;
    }

    public function calculateTotalPrice()
    {
        return $this->cartons_quantity * $this->carton_price;
    }

    // Boot method للحسابات التلقائية
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($invoiceItem) {
            // حساب إجمالي القطع
            $invoiceItem->total_units = $invoiceItem->cartons_quantity * $invoiceItem->units_per_carton;

            // حساب إجمالي السعر
            $invoiceItem->total_price = $invoiceItem->cartons_quantity * $invoiceItem->carton_price;
        });
    }
}
