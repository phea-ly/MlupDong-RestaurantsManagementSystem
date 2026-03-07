<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('tables')) {
            return;
        }

        Schema::create('tables', function (Blueprint $table) {
            $table->id('table_id');
            $table->integer('table_number');
            $table->integer('capacity');
            $table->enum('status', ['available', 'unavailable'])->default('available');
            $table->string('location', 100)->nullable();
            $table->string('qr_code', 255)->unique()->nullable();
            $table->string('qr_code_url', 255)->nullable();
            $table->unsignedBigInteger('restaurant_id')->nullable();
            $table->timestamps();

            $table->foreign('restaurant_id')->references('restaurant_id')->on('restaurants');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tables');
    }
};
