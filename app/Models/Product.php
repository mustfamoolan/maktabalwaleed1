<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'code',
        'image',
        'stock_quantity',
        'pieces_per_carton',
        'piece_weight',
        'carton_weight',
        'supplier_id',
        'category_id',
        'purchase_price',
        'sale_price',
        'wholesale_price',
        'last_purchase_date',
        'last_sale_date'
    ];

    protected $casts = [
        'last_purchase_date' => 'date',
        'last_sale_date' => 'date',
        'purchase_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
        'piece_weight' => 'decimal:2',
        'carton_weight' => 'decimal:3'
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
