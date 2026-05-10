<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN order_status ENUM('new','received','confirmed','preparing','ready','completed','cancelled') DEFAULT 'new'");
        DB::statement("ALTER TABLE order_status_logs MODIFY COLUMN status ENUM('new','received','confirmed','preparing','ready','completed','cancelled') NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN order_status ENUM('new','preparing','completed','cancelled') DEFAULT 'new'");
        DB::statement("ALTER TABLE order_status_logs MODIFY COLUMN status ENUM('new','preparing','completed','cancelled') NULL");
    }
};
