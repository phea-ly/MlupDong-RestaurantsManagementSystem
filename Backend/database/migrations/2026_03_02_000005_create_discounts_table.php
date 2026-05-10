<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('discounts')) {
            return;
        }

        Schema::create('discounts', function (Blueprint $table) {
            $table->id('discount_id');
            $table->string('code', 50)->unique()->nullable();
            $table->enum('type', ['percentage', 'fixed'])->nullable();
            $table->decimal('value', 10, 2)->nullable();
            $table->decimal('min_order_amount', 10, 2)->nullable();
            $table->dateTime('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('usage_limit')->nullable();
            $table->integer('used_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discounts');
    }
};
