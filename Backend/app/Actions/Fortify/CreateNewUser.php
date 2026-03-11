<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $name = trim($input['name']);
        $firstName = Str::of($name)->before(' ')->value();
        $lastName = trim(Str::of($name)->after(' ')->value());

        return User::create([
            'first_name' => $firstName,
            'last_name' => $lastName !== '' ? $lastName : $firstName,
            'email' => $input['email'],
            'password' => $input['password'],
        ]);
    }
}
