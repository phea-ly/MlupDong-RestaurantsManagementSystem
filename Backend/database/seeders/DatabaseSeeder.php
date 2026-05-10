<?php

namespace Database\Seeders;

use App\Models\Role;
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
        // Seed roles first
        $this->call([
            RoleSeeder::class,
        ]);

        // Get admin role ID
        $adminRole = Role::where('role_name', 'admin')->first();

        User::updateOrCreate(
            ['email' => 'mlupdong@gmail.com'],
            [
                'first_name' => 'Mlup',
                'last_name'  => 'Dong',
                'role_id'    => $adminRole?->role_id,
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
