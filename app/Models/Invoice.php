<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'representative_id',
        'customer_id',
        'total_amount',
        'paid_amount',
        'remaining_amount',
        'status',
        'notes',
        'invoice_date',
        'delivery_date',
        'is_printed'
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'invoice_date' => 'datetime',
        'delivery_date' => 'datetime',
        'is_printed' => 'boolean',
    ];

    // العلاقات
    public function representative()
    {
        return $this->belongsTo(Representative::class);
    }

    public function customer()
    {
        return $this->belongsTo(RepresentativeCustomer::class, 'customer_id');
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePreparing($query)
    {
        return $query->where('status', 'preparing');
    }

    public function scopeShipping($query)
    {
        return $query->where('status', 'shipping');
    }

    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    public function scopeReturned($query)
    {
        return $query->where('status', 'returned');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    // Helper methods
    public function getStatusTextAttribute()
    {
        $statuses = [
            'pending' => 'قيد الانتظار',
            'preparing' => 'قيد التجهيز',
            'shipping' => 'قيد التوصيل',
            'delivered' => 'تم التسليم',
            'returned' => 'مسترجع',
            'cancelled' => 'ملغية'
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    public function getStatusColorAttribute()
    {
        $colors = [
            'pending' => 'bg-yellow-100 text-yellow-800',
            'preparing' => 'bg-blue-100 text-blue-800',
            'shipping' => 'bg-indigo-100 text-indigo-800',
            'delivered' => 'bg-green-100 text-green-800',
            'returned' => 'bg-orange-100 text-orange-800',
            'cancelled' => 'bg-red-100 text-red-800'
        ];

        return $colors[$this->status] ?? 'bg-gray-100 text-gray-800';
    }

    // إنشاء رقم فاتورة تلقائي
    public static function generateInvoiceNumber()
    {
        $lastInvoice = self::latest('id')->first();
        $lastNumber = $lastInvoice ? intval(substr($lastInvoice->invoice_number, 3)) : 0;
        return 'INV' . str_pad($lastNumber + 1, 6, '0', STR_PAD_LEFT);
    }
}
