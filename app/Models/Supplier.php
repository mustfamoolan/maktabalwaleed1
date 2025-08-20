<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'code',
        'name_ar',
        'name_en',
        'contact_person',
        'phone',
        'mobile',
        'email',
        'address',
        'city',
        'country',
        'tax_number',
        'commercial_record',
        'credit_limit',
        'payment_days',
        'commission_rate',
        'is_active',
        'evaluation_score',
        'total_purchases',
        'total_returns',
        'last_transaction_date',
        'notes'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'credit_limit' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'total_purchases' => 'decimal:2',
        'total_returns' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * العلاقة مع فئة المورد الأساسية (many-to-one)
     */
    public function category()
    {
        return $this->belongsTo(SupplierCategory::class);
    }

    /**
     * العلاقة مع فئات المورد الإضافية (many-to-many)
     */
    public function categories()
    {
        return $this->belongsToMany(SupplierCategory::class, 'supplier_category_mappings');
    }

    /**
     * الحصول على جميع الفئات (الأساسية + الإضافية)
     */
    public function getAllCategoriesAttribute()
    {
        $allCategories = collect();

        // إضافة الفئة الأساسية
        if ($this->category) {
            $allCategories->push($this->category);
        }

        // إضافة الفئات الإضافية
        $additionalCategories = $this->categories()->get();
        foreach ($additionalCategories as $category) {
            if (!$allCategories->contains('id', $category->id)) {
                $allCategories->push($category);
            }
        }

        return $allCategories;
    }

    /**
     * العلاقة مع المنتجات (one-to-many)
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * العلاقة مع تقييمات الأداء (one-to-many)
     */
    public function performance()
    {
        return $this->hasMany(SupplierPerformance::class);
    }

    /**
     * Scope للموردين النشطين
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope للموردين حسب الفئة
     */
    public function scopeByCategory($query, $categoryId)
    {
        return $query->whereHas('categories', function ($q) use ($categoryId) {
            $q->where('supplier_categories.id', $categoryId);
        });
    }

    /**
     * الحصول على الفئة الرئيسية للمورد
     */
    public function getPrimaryCategoryAttribute()
    {
        return $this->categories()->orderBy('sort_order')->first();
    }

    /**
     * حساب إجمالي المنتجات
     */
    public function getTotalProductsAttribute()
    {
        return $this->products()->count();
    }

    /**
     * حساب المنتجات النشطة
     */
    public function getActiveProductsAttribute()
    {
        return $this->products()->where('is_active', true)->count();
    }

    /**
     * حساب قيمة المخزون للمورد
     */
    public function getInventoryValueAttribute()
    {
        return $this->products()
            ->selectRaw('SUM(cartons_in_stock * purchase_price) as total_value')
            ->value('total_value') ?? 0;
    }

    /**
     * حساب إجمالي المبيعات الشهرية
     */
    public function getMonthlySales($month = null, $year = null)
    {
        $month = $month ?? now()->month;
        $year = $year ?? now()->year;

        return $this->products()
            ->join('invoice_items', 'products.id', '=', 'invoice_items.product_id')
            ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->whereMonth('invoices.invoice_date', $month)
            ->whereYear('invoices.invoice_date', $year)
            ->where('invoices.status', '!=', 'cancelled')
            ->sum('invoice_items.total_price');
    }

    /**
     * حساب نقاط الأداء
     */
    public function calculatePerformanceScore()
    {
        $sales = $this->getMonthlySales();
        $totalProducts = $this->total_products;
        $activeProducts = $this->active_products;

        // حساب نقاط الأداء بناءً على المبيعات وعدد المنتجات
        $salesScore = min(($sales / 10000000) * 40, 40); // 40 نقطة للمبيعات
        $productScore = min(($totalProducts / 50) * 30, 30); // 30 نقطة لعدد المنتجات
        $activityScore = $activeProducts > 0 ? 30 : 0; // 30 نقطة للنشاط

        return round($salesScore + $productScore + $activityScore, 2);
    }
}
