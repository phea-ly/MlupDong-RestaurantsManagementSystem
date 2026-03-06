<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('staffs', function (Blueprint $table) {
            $table->id('staff_id');
            $table->unsignedBigInteger('user_id');
            $table->string('position', 100)->nullable();
            $table->string('profile_image', 255)->nullable();
            $table->decimal('salary', 10, 2)->nullable();
            $table->date('hire_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('user_id')->references('user_id')->on('users');
        });

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

        Schema::create('categories', function (Blueprint $table) {
            $table->id('category_id');
            $table->string('category_name', 150);
            $table->text('description')->nullable();
            $table->boolean('status')->default(true);
            $table->unsignedBigInteger('restaurant_id')->nullable();
            $table->timestamps();

            $table->foreign('restaurant_id')->references('restaurant_id')->on('restaurants');
        });

        Schema::create('menu_items', function (Blueprint $table) {
            $table->id('menu_item_id');
            $table->string('item_name', 150);
            $table->decimal('price', 10, 2);
            $table->string('image', 255)->nullable();
            $table->text('description')->nullable();
            $table->boolean('status')->default(true);
            $table->unsignedBigInteger('category_id')->nullable();
            $table->timestamps();

            $table->foreign('category_id')->references('category_id')->on('categories');
        });

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

        Schema::create('order_items', function (Blueprint $table) {
            $table->id('order_item_id');
            $table->unsignedBigInteger('order_id')->nullable();
            $table->unsignedBigInteger('menu_item_id')->nullable();
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->decimal('subtotal', 10, 2)->nullable();
            $table->string('note', 255)->nullable();
            $table->timestamps();

            $table->foreign('order_id')->references('order_id')->on('orders');
            $table->foreign('menu_item_id')->references('menu_item_id')->on('menu_items');
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id');
            $table->unsignedBigInteger('order_id')->nullable();
            $table->enum('payment_method', ['cash', 'card', 'aba', 'wing'])->nullable();
            $table->decimal('amount_paid', 10, 2)->nullable();
            $table->decimal('change_amount', 10, 2)->nullable();
            $table->enum('payment_status', ['pending', 'completed', 'failed'])->nullable();
            $table->dateTime('payment_date')->nullable();
            $table->timestamps();

            $table->foreign('order_id')->references('order_id')->on('orders');
        });

        Schema::create('order_status_logs', function (Blueprint $table) {
            $table->id('log_id');
            $table->unsignedBigInteger('order_id')->nullable();
            $table->enum('status', ['new', 'preparing', 'completed', 'cancelled'])->nullable();
            $table->dateTime('changed_at')->nullable();
            $table->string('note', 255)->nullable();
            $table->timestamps();

            $table->foreign('order_id')->references('order_id')->on('orders');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_status_logs');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('discounts');
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('tables');
        Schema::dropIfExists('staffs');
    }
};
