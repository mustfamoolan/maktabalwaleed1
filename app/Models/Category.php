<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'name'
    ];

    /**
     * العلاقة مع الموردين (many-to-many)
     */
    public function suppliers()
    {
        return $this->belongsToMany(Supplier::class, 'supplier_categories');
    }
}
