<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Restaurant extends Model
{
    use HasFactory;

    protected $table = 'restaurants';

    protected $primaryKey = 'restaurant_id';

    protected $fillable = [
        'name',
        'address',
        'lat',
        'lng',
        'allowed_radius_meters',
        'phone',
        'open_time',
        'close_time',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'decimal:8',
            'lng' => 'decimal:8',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'restaurant_id', 'restaurant_id');
    }

    public function tables(): HasMany
    {
        return $this->hasMany(RestaurantTable::class, 'restaurant_id', 'restaurant_id');
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class, 'restaurant_id', 'restaurant_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'restaurant_id', 'restaurant_id');
    }
}
