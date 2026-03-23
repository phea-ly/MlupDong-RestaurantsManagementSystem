<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\RestaurantTable;
use App\Models\Staff;
use App\Models\User;
use App\Observers\ActivityLogObserver;
use App\Observers\OrderObserver;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // Existing observer
        Order::observe(OrderObserver::class);

        // Auto-log CRUD events for all major models
        User::observe(ActivityLogObserver::class);
        MenuItem::observe(ActivityLogObserver::class);
        Category::observe(ActivityLogObserver::class);
        RestaurantTable::observe(ActivityLogObserver::class);
        Staff::observe(ActivityLogObserver::class);
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(app()->isProduction());

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)->mixedCase()->letters()->numbers()->symbols()->uncompromised()
            : null
        );
    }
}