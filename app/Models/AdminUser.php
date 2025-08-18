<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class AdminUser extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'password',
        'role',
        'is_active',
        'last_login',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'last_login' => 'datetime',
        'is_active' => 'boolean',
    ];

    // تشفير كلمة المرور تلقائياً
    public function setPasswordAttribute($password)
    {
        $this->attributes['password'] = Hash::make($password);
    }

    // التحقق من كلمة المرور
    public function checkPassword($password)
    {
        return Hash::check($password, $this->password);
    }

    // تحديث آخر تسجيل دخول
    public function updateLastLogin()
    {
        $this->update(['last_login' => now()]);
    }

    // التحقق من كونه مدير
    public function isManager()
    {
        return $this->role === 'مدير';
    }

    // التحقق من كونه موظف
    public function isEmployee()
    {
        return $this->role === 'موظف';
    }

    // نطاق للمدراء فقط
    public function scopeManagers($query)
    {
        return $query->where('role', 'مدير');
    }

    // نطاق للموظفين فقط
    public function scopeEmployees($query)
    {
        return $query->where('role', 'موظف');
    }

    // نطاق للمستخدمين النشطين
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
