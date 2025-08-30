<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleItem extends Model
{
    protected $fillable = [
        'sale_id',
        'product_id',
        'quantity',
        'unit_cost_price',
        'unit_sale_price',
        'unit_discount',
        'total_cost',
        'total_sale',
        'total_discount',
        'final_total',
        'profit_amount',
        'notes',
        'pieces_per_carton',
        'piece_weight_grams',
        'item_total_weight_grams',
        'item_total_weight_kg',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_cost_price' => 'decimal:2',
        'unit_sale_price' => 'decimal:2',
        'unit_discount' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'total_sale' => 'decimal:2',
        'total_discount' => 'decimal:2',
        'final_total' => 'decimal:2',
        'profit_amount' => 'decimal:2',
        'pieces_per_carton' => 'integer',
        'piece_weight_grams' => 'decimal:2',
        'item_total_weight_grams' => 'decimal:2',
        'item_total_weight_kg' => 'decimal:3',
    ];

    // العلاقات
    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // الطرق المساعدة
    public function calculateTotals(): void
    {
        $this->total_cost = $this->quantity * $this->unit_cost_price;
        $this->total_sale = $this->quantity * $this->unit_sale_price;
        $this->total_discount = $this->quantity * $this->unit_discount;
        $this->final_total = $this->total_sale - $this->total_discount;
        $this->profit_amount = $this->final_total - $this->total_cost;
    }

    public function getProfitMarginAttribute(): float
    {
        if ($this->final_total > 0) {
            return ($this->profit_amount / $this->final_total) * 100;
        }
        return 0;
    }

    public function getDiscountPercentageAttribute(): float
    {
        if ($this->total_sale > 0) {
            return ($this->total_discount / $this->total_sale) * 100;
        }
        return 0;
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($saleItem) {
            $saleItem->calculateTotals();
        });
    }
}
