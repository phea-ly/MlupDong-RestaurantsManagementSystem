<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('order_items')) {
            return;
        }

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
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
