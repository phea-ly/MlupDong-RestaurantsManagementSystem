<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('staffs')) {
            return;
        }

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
    }

    public function down(): void
    {
        Schema::dropIfExists('staffs');
    }
};
