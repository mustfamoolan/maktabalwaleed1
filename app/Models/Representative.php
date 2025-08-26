<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Representative extends Authenticatable
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'password',
        'address',
        'is_active'
    ];

    protected $hidden = [
        'password'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getAuthIdentifierName()
    {
        return 'id';
    }

    /**
     * Get the username used for authentication (phone number)
     */
    public function getAuthIdentifier()
    {
        return $this->id;
    }

    /**
     * Get the password for authentication
     */
    public function getAuthPassword()
    {
        return $this->password;
    }

    // الفلاتر (Scopes)
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // العلاقات
    public function salaryPlans()
    {
        return $this->hasMany(SalaryPlan::class);
    }

    public function activeSalaryPlans()
    {
        return $this->salaryPlans()->active();
    }

    public function currentSalaryPlans()
    {
        return $this->salaryPlans()->current();
    }

    /**
     * العلاقة مع الرواتب
     */
    public function salaries()
    {
        return $this->hasMany(RepresentativeSalary::class);
    }

    /**
     * الحصول على الراتب الحالي
     */
    public function currentSalary()
    {
        return $this->salaries()->current()->first();
    }

    /**
     * الرواتب النشطة
     */
    public function activeSalaries()
    {
        return $this->salaries()->active();
    }

    /**
     * علاقة مع الخطط متعددة المنتجات
     */
    public function multiProductPlans()
    {
        return $this->hasMany(MultiProductPlan::class);
    }

    /**
     * الخطط متعددة المنتجات النشطة
     */
    public function activeMultiProductPlans()
    {
        return $this->multiProductPlans()->where('status', 'active');
    }

    /**
     * علاقة مع خطط الفئات
     */
    public function categoryPlans()
    {
        return $this->hasMany(RepresentativeCategoryPlan::class);
    }

    /**
     * خطط الفئات النشطة
     */
    public function activeCategoryPlans()
    {
        return $this->categoryPlans()->where('status', 'active');
    }

    /**
     * علاقة مع خطط الموردين
     */
    public function supplierPlans()
    {
        return $this->hasMany(RepresentativeSupplierPlan::class);
    }

    /**
     * خطط الموردين النشطة
     */
    public function activeSupplierPlans()
    {
        return $this->supplierPlans()->where('status', 'active');
    }

    /**
     * علاقة مع العملاء
     */
    public function customers()
    {
        return $this->hasMany(RepresentativeCustomer::class);
    }

    /**
     * العملاء النشطون
     */
    public function activeCustomers()
    {
        return $this->customers()->where('is_active', true);
    }
}
