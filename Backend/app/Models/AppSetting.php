<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppSetting extends Model
{
    use HasFactory;

    protected $table = 'app_settings';

    protected $primaryKey = 'setting_id';

    protected $fillable = [
        'language',
        'timezone',
        'currency',
        'restaurant_name',
        'phone',
        'address',
        'logo_path',
        'cash_enabled',
        'credit_enabled',
        'qr_code_enabled',
    ];

    protected function casts(): array
    {
        return [
            'cash_enabled' => 'boolean',
            'credit_enabled' => 'boolean',
            'qr_code_enabled' => 'boolean',
        ];
    }
}
