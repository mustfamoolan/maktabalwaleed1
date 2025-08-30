<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Preparer extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'phone',
        'password',
        'salary',
        'is_active',
        'notes'
    ];

    protected $hidden = [
        'password',
        'remember_token'
    ];

    protected $casts = [
        'salary' => 'decimal:2',
        'is_active' => 'boolean',
        'email_verified_at' => 'datetime',
        'password' => 'hashed'
    ];

    // علاقة مع جدول الرواتب (سيتم إضافتها لاحقاً)
    public function salaryDetails()
    {
        return $this->hasMany(PreparerSalaryDetail::class);
    }

    // تخصيص حقل username للمصادقة
    public function getAuthIdentifierName()
    {
        return 'phone';
    }
}
