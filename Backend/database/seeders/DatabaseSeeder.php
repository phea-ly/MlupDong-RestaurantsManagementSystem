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
            ['email' => 'mlupdong@gmail.com'],
            [
                'first_name' => 'Mlup',
                'last_name'  => 'Dong',
                'role'       => 'admin',   // ← make sure this column exists
                'role_id'    => null,      // ← or set the correct role_id if using a roles table
                'password'   => Hash::make('mlupdong@12345'),
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
