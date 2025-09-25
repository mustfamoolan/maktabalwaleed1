<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommissionPlan extends Model
{
    protected $fillable = [
        'name',
        'product_id',
        'commission_amount',
        'start_date',
        'end_date',
        'is_active'
    ];

    protected $casts = [
        'commission_amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean'
    ];

    // العلاقة مع المنتج
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
