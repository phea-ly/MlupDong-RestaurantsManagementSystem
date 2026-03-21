<?php

namespace App\Http\Controllers;

use App\Models\RestaurantTable;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TableController extends Controller
{
    public function index()
    {
        return response()->json(
            RestaurantTable::query()->with('restaurant')->latest('table_id')->get()
        );
    }

    public function generateQr(string $id)
    {
        try {
            $table = RestaurantTable::query()->findOrFail($id);

            // Create a unique token (qr_code_url) if not exists
            $token = $table->qr_code_url ?? Str::random(32);

            // Construct the URL (e.g. frontend menu URL)
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            $data = "{$frontendUrl}/menu/{$token}";

            // Configure QR Code
            $options = new QROptions([
                'outputType'   => 'svg',
                'eccLevel'     => 'L',
                'addQuietzone' => true,
                'returnRaw'    => true, 
            ]);

            $qrcode = new QRCode($options);
            $svgContent = $qrcode->render($data);

            // If the library returns a data URI despite returnRaw=true, we decode it
            if (str_starts_with($svgContent, 'data:image/svg+xml;base64,')) {
                $svgContent = base64_decode(str_replace('data:image/svg+xml;base64,', '', $svgContent));
            }

            // Ensure directory exists in public disk
            if (!Storage::disk('public')->exists('qrcodes')) {
                Storage::disk('public')->makeDirectory('qrcodes');
            }

            // Save SVG to storage
            $filename = "qrcodes/table-{$id}.svg";
            Storage::disk('public')->put($filename, $svgContent);

            // Update table record
            $table->update([
                'qr_code'     => "storage/{$filename}",
                'qr_code_url' => $token,
            ]);

            return response()->json([
                'message' => 'QR code generated successfully',
                'table' => $table->load('restaurant')
            ]);
        } catch (\Exception $e) {
            Log::error('QR Generation Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to generate QR code',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function generateAll()
    {
        $tables = RestaurantTable::all();
        $count = 0;
        foreach ($tables as $table) {
            try {
                $this->generateQr((string) $table->table_id);
                $count++;
            } catch (\Exception $e) {
                \Log::error("Failed to generate QR for table {$table->table_id}: " . $e->getMessage());
            }
        }

        return response()->json([
            'message' => "QR codes generated for {$count} tables.",
            'count' => $count
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_number'  => [
                'required', 
                'integer', 
                'min:1',
                // Unique table number per restaurant
                Rule::unique('tables')->where(function ($query) use ($request) {
                    return $query->where('restaurant_id', $request->restaurant_id);
                })
            ],
            'capacity'      => ['required', 'integer', 'min:1'],
            'status'        => ['nullable', Rule::in(['available', 'unavailable'])],
            'location'      => ['nullable', 'string', 'max:100'],
            'restaurant_id' => ['nullable', 'exists:restaurants,restaurant_id'],
        ]);

        $table = RestaurantTable::query()->create($validated);

        return response()->json([
            'message' => 'Table registered successfully',
            'table' => $table->load('restaurant')
        ], 201);
    }

    public function show(string $id)
    {
        return response()->json(
            RestaurantTable::query()->with('restaurant')->findOrFail($id)
        );
    }

    public function update(Request $request, string $id)
    {
        $table = RestaurantTable::query()->findOrFail($id);

        $validated = $request->validate([
            'table_number'  => [
                'sometimes', 
                'required', 
                'integer', 
                'min:1',
                Rule::unique('tables')->ignore($id, 'table_id')->where(function ($query) use ($request, $table) {
                    return $query->where('restaurant_id', $request->restaurant_id ?? $table->restaurant_id);
                })
            ],
            'capacity'      => ['sometimes', 'required', 'integer', 'min:1'],
            'status'        => ['nullable', Rule::in(['available', 'unavailable'])],
            'location'      => ['nullable', 'string', 'max:100'],
            'restaurant_id' => ['nullable', 'exists:restaurants,restaurant_id'],
        ]);

        $table->update($validated);

        return response()->json([
            'message' => 'Table updated successfully',
            'table' => $table->load('restaurant')
        ]);
    }

    public function downloadQrFile(string $id)
    {
        $table = RestaurantTable::findOrFail($id);

        if (!$table->qr_code) {
            return response()->json(['message' => 'QR code not generated for this table'], 404);
        }

        $relativePath = str_replace('storage/', '', $table->qr_code);

        if (!Storage::disk('public')->exists($relativePath)) {
            return response()->json(['message' => 'QR code file not found on disk'], 404);
        }

        $headers = [
            'Content-Type' => 'image/svg+xml',
        ];

        return Storage::disk('public')->download($relativePath, "Table-{$table->table_number}-QR.svg", $headers);
    }

    public function getTableByToken(string $token)
    {
        $table = RestaurantTable::where('qr_code_url', $token)->first();

        if (!$table) {
            return response()->json(['message' => 'Table not found'], 404);
        }

        return response()->json($table);
    }

    public function destroy(string $id)
    {
        $table = RestaurantTable::query()->findOrFail($id);
        
        // Clean up QR code file if it exists
        if ($table->qr_code) {
            $relativePath = str_replace('storage/', '', $table->qr_code);
            Storage::disk('public')->delete($relativePath);
        }
        
        $table->delete();

        return response()->json(['message' => 'Table deleted successfully']);
    }
}

