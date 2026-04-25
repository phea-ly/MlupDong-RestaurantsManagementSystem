<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['role_name' => 'admin', 'description' => 'Administrator with full access'],
            ['role_name' => 'chef', 'description' => 'Kitchen staff / Chef'],
            ['role_name' => 'waiter', 'description' => 'Waiter / Server'],
            ['role_name' => 'cashier', 'description' => 'Cashier / Payment handling'],
            ['role_name' => 'staff', 'description' => 'General staff member'],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['role_name' => $role['role_name']],
                ['description' => $role['description']]
            );
        }
    }
}