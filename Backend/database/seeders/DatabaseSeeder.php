<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@test.com'],
            [
                'first_name' => 'Test Admin',
                'last_name' => 'Test Admin',
                'role' => 'admin',
                'password' => Hash::make('Admin@12345'),
            ]
        );

        // User::updateOrCreate(
        //     ['email' => 'client@test.com'],
        //     [
        //         'name' => 'Test Client',
        //         'role' => 'client',
        //         'password' => Hash::make('Client@12345'),
        //     ]
        // );
    }
}
