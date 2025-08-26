<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MultiProductPlanProduct extends Model
{
    protected $fillable = [
        'multi_product_plan_id',
        'product_id',
        'achieved_quantity'
    ];

    protected $casts = [
        'achieved_quantity' => 'integer'
    ];

    // علاقة مع الخطة
    public function multiProductPlan(): BelongsTo
    {
        return $this->belongsTo(MultiProductPlan::class);
    }

    // علاقة مع المنتج
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
