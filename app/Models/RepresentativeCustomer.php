<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RepresentativeCustomer extends Model
{
    use HasFactory;

    protected $fillable = [
        'representative_id',
        'name',
        'phone',
        'location_text',
        'latitude',
        'longitude',
        'is_active',
        'notes'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8'
    ];

    // العلاقات
    public function representative()
    {
        return $this->belongsTo(Representative::class);
    }

    // الفلاتر (Scopes)
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByRepresentative($query, $representativeId)
    {
        return $query->where('representative_id', $representativeId);
    }

    // Accessors
    public function getLocationAttribute()
    {
        if ($this->latitude && $this->longitude) {
            return [
                'text' => $this->location_text,
                'lat' => $this->latitude,
                'lng' => $this->longitude
            ];
        }
        return ['text' => $this->location_text, 'lat' => null, 'lng' => null];
    }
}
