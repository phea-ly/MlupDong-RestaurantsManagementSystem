<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('orders')) {
            return;
        }

        Schema::create('orders', function (Blueprint $table) {
            $table->id('order_id');
            $table->string('order_number', 50)->unique()->nullable();
            $table->enum('order_type', ['dine_in', 'takeaway', 'delivery'])->nullable();
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->decimal('tax', 10, 2)->nullable();
            $table->decimal('final_amount', 10, 2)->nullable();
            $table->enum('payment_status', ['pending', 'paid', 'cancelled'])->default('pending');
            $table->enum('order_status', ['new', 'preparing', 'completed', 'cancelled'])->default('new');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('table_id')->nullable();
            $table->unsignedBigInteger('discount_id')->nullable();
            $table->unsignedBigInteger('restaurant_id')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('user_id')->on('users');
            $table->foreign('table_id')->references('table_id')->on('tables');
            $table->foreign('discount_id')->references('discount_id')->on('discounts');
            $table->foreign('restaurant_id')->references('restaurant_id')->on('restaurants');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
