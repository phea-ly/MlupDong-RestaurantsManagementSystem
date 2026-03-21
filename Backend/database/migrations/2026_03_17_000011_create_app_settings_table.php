<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('app_settings')) {
            return;
        }

        Schema::create('app_settings', function (Blueprint $table) {
            $table->id('setting_id');
            $table->string('language', 10)->default('en');
            $table->string('timezone', 64)->default('(GMT+07:00) Indochina Time');
            $table->string('currency', 16)->default('USD (USD)');
            $table->string('restaurant_name', 150)->nullable();
            $table->string('phone', 50)->nullable();
            $table->text('address')->nullable();
            $table->string('logo_path', 255)->nullable();
            $table->boolean('cash_enabled')->default(true);
            $table->boolean('credit_enabled')->default(true);
            $table->boolean('qr_code_enabled')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_settings');
    }
};
