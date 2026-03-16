<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DiscountController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\OrderStastusLogController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;


Route::patch('/menu/{id}/availability', [MenuItemController::class, 'updateAvailability']);
Route::apiResource('restaurants', RestaurantController::class);
Route::apiResource('roles', RoleController::class);
Route::apiResource('users', UserController::class);
Route::apiResource('staffs', StaffController::class);
Route::post('tables/generate-all', [TableController::class, 'generateAll']);
Route::post('tables/{id}/generate-qr', [TableController::class, 'generateQr']);
Route::get('tables/{id}/download-qr', [TableController::class, 'downloadQrFile']);
Route::apiResource('tables', TableController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('menu-items', MenuItemController::class);
Route::apiResource('orders', OrderController::class);
Route::apiResource('order-items', OrderItemController::class);
Route::apiResource('payments', PaymentController::class);
Route::apiResource('discounts', DiscountController::class);
Route::apiResource('order-status-logs', OrderStastusLogController::class);

Route::get('/', function () {
    return response()->json(['message' => 'Hello world!']);
});

Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('jwt')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user',  [AuthController::class, 'getUser']);
    Route::put('/user',  [AuthController::class, 'updateUser']);
    Route::post('/user', [AuthController::class, 'updateUser']); 
});
