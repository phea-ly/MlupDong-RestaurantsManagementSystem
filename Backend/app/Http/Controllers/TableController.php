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
        $table = RestaurantTable::query()->findOrFail($id);

        // Create a unique token (qr_code_url) if not exists
        $token = $table->qr_code_url ?? Str::random(32);

        // Construct the URL (e.g. frontend menu URL)
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $data = "{$frontendUrl}/menu/{$token}";

        // Configure QR Code — SVG output
        $options = new QROptions([
            'outputType' => QRCode::OUTPUT_MARKUP_SVG,
            'eccLevel'   => QRCode::ECC_L,
            'addQuietzone' => true,
        ]);

        $qrcode  = new QRCode($options);
        $dataUri = $qrcode->render($data);

        // render() returns "data:image/svg+xml;base64,<encoded>" — decode it
        if (str_starts_with($dataUri, 'data:image/svg+xml;base64,')) {
            $svg = base64_decode(substr($dataUri, strlen('data:image/svg+xml;base64,')));
        } elseif (str_starts_with($dataUri, 'data:image/svg+xml,')) {
            $svg = urldecode(substr($dataUri, strlen('data:image/svg+xml,')));
        } else {
            $svg = $dataUri; // Already raw SVG
        }

        // Ensure directory exists
        if (!Storage::disk('public')->exists('qrcodes')) {
            Storage::disk('public')->makeDirectory('qrcodes');
        }

        // Save raw SVG to storage
        $filename = "qrcodes/table-{$id}.svg";
        Storage::disk('public')->put($filename, $svg);

        // Update table record
        $table->update([
            'qr_code'     => "storage/{$filename}",
            'qr_code_url' => $token,
        ]);

        return response()->json($table->load('restaurant'));
    }

    public function generateAll()
    {
        $tables = RestaurantTable::all();
        foreach ($tables as $table) {
            $this->generateQr((string) $table->table_id);
        }

        return response()->json(['message' => 'All QR codes generated successfully.']);
    }

    public function getQrCode(string $id)
    {
        $table = RestaurantTable::query()->findOrFail($id);

        return response()->json([
            'table_id'     => $table->table_id,
            'table_number' => $table->table_number,
            'qr_code'      => $table->qr_code,
            'qr_code_url'  => $table->qr_code_url,
            'full_url'     => $table->qr_code ? asset($table->qr_code) : null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_number'  => ['required', 'integer', 'min:1'],
            'capacity'      => ['required', 'integer', 'min:1'],
            'status'        => ['nullable', Rule::in(['available', 'unavailable'])],
            'location'      => ['nullable', 'string', 'max:100'],
            'qr_code'       => ['nullable', 'string', 'max:255', 'unique:tables,qr_code'],
            'qr_code_url'   => ['nullable', 'string', 'max:255'],
            'restaurant_id' => ['nullable', 'exists:restaurants,restaurant_id'],
        ]);

        $table = RestaurantTable::query()->create($validated);

        return response()->json($table->load('restaurant'), 201);
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
            'table_number'  => ['sometimes', 'required', 'integer', 'min:1'],
            'capacity'      => ['sometimes', 'required', 'integer', 'min:1'],
            'status'        => ['nullable', Rule::in(['available', 'unavailable'])],
            'location'      => ['nullable', 'string', 'max:100'],
            'qr_code'       => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('tables', 'qr_code')->ignore($id, 'table_id'),
            ],
            'qr_code_url'   => ['nullable', 'string', 'max:255'],
            'restaurant_id' => ['nullable', 'exists:restaurants,restaurant_id'],
        ]);

        $table->update($validated);

        return response()->json($table->load('restaurant'));
    }

    public function downloadQrFile(string $id)
    {
        $table = RestaurantTable::findOrFail($id);

        if (!$table->qr_code) {
            return response()->json(['message' => 'QR code not generated for this table'], 404);
        }

        // Path is "storage/qrcodes/table-X.svg"
        $relativePath = str_replace('storage/', '', $table->qr_code);

        if (!Storage::disk('public')->exists($relativePath)) {
            return response()->json(['message' => 'QR code file not found on disk'], 404);
        }

        $headers = [
            'Content-Type' => 'image/svg+xml',
        ];

        return Storage::disk('public')->download($relativePath, "Table-{$table->table_number}-QR.svg", $headers);
    }

    public function destroy(string $id)
    {
        $table = RestaurantTable::query()->findOrFail($id);
        $table->delete();

        return response()->noContent();
    }
}
