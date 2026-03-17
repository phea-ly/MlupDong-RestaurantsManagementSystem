<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AppSettingController extends Controller
{
    public function show()
    {
        $settings = AppSetting::query()->first();
        if (!$settings) {
            $settings = AppSetting::query()->create([]);
        }

        return response()->json($this->mapSettings($settings));
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'language' => ['nullable', 'string', 'max:10'],
            'timezone' => ['nullable', 'string', 'max:64'],
            'currency' => ['nullable', 'string', 'max:16'],
            'restaurant_name' => ['nullable', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'cash_enabled' => ['nullable', 'boolean'],
            'credit_enabled' => ['nullable', 'boolean'],
            'qr_code_enabled' => ['nullable', 'boolean'],
            'logo' => ['nullable', 'file', 'image', 'max:2048'],
        ]);

        $settings = AppSetting::query()->first();
        if (!$settings) {
            $settings = AppSetting::query()->create([]);
        }

        if ($request->hasFile('logo')) {
            if ($settings->logo_path && str_starts_with($settings->logo_path, '/storage/')) {
                $oldPath = str_replace('/storage/', 'public/', $settings->logo_path);
                Storage::delete($oldPath);
            }
            $path = $request->file('logo')->store('settings', 'public');
            $validated['logo_path'] = Storage::url($path);
        }

        $settings->update($validated);

        return response()->json($this->mapSettings($settings));
    }

    private function mapSettings(AppSetting $settings): array
    {
        return [
            'language' => $settings->language,
            'timezone' => $settings->timezone,
            'currency' => $settings->currency,
            'restaurant_name' => $settings->restaurant_name,
            'phone' => $settings->phone,
            'address' => $settings->address,
            'logo_path' => $settings->logo_path,
            'cash_enabled' => $settings->cash_enabled,
            'credit_enabled' => $settings->credit_enabled,
            'qr_code_enabled' => $settings->qr_code_enabled,
        ];
    }
}
