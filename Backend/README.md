# MlupDong Restaurants Management System

Full-stack restaurant management system with a Vue 3 + Vuetify frontend and Laravel 12 backend.

## Tech Stack
- Frontend: Vue 3, Vite, Vuetify, Pinia, Vue Router, Axios
- Backend: Laravel 12, PHP 8.2+, JWT (`tymon/jwt-auth`), Fortify (included), Eloquent ORM
- Database: MySQL (recommended) or SQLite

## Project Structure
- `Frontend/` - Vue application
- `Backend/` - Laravel API and web app

## Prerequisites
- Node.js `^20.19.0` or `>=22.12.0`
- npm
- PHP `^8.2`
- Composer
- MySQL (if using MySQL)

## Quick Start

### 1. Install dependencies
Backend:
```bash
cd Backend
composer install
```

Frontend:
```bash
cd Frontend
npm install
```

### 2. Configure backend environment
In `Backend/.env`, make sure database and app values are correct.

Recommended MySQL config:
```env
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=restaurant-management
DB_USERNAME=root
DB_PASSWORD=
```

Important:
- Do not leave a leading space in `DB_DATABASE`.
- If `DB_CONNECTION` is missing, Laravel defaults to SQLite.

Generate app and JWT keys:
```bash
cd Backend
php artisan key:generate
php artisan jwt:secret
```

### 3. Run migrations
```bash
cd Backend
php artisan migrate
```

### 4. Start backend and frontend
Terminal 1 (backend):
```bash
cd Backend
php artisan serve --host=127.0.0.1 --port=8000
```

Terminal 2 (frontend):
```bash
cd Frontend
npm run dev
```

Frontend Vite proxy forwards `/api/*` to `http://localhost:8000` (see `Frontend/vite.config.js`).

## Available Scripts

### Frontend (`Frontend/package.json`)
- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build

### Backend (`Backend/composer.json`)
- `composer run dev` - run Laravel server + queue + Vite concurrently
- `php artisan serve` - start backend only
- `php artisan test` - run tests

## API Routes (Current)
Defined in `Backend/routes/api.php`:
- `restaurants`
- `roles`
- `users`
- `staffs`
- `tables`
- `categories`
- `menu-items`
- `orders`
- `order-items`
- `payments`
- `discounts`
- `order-status-logs`

Each is registered as `Route::apiResource(...)`.

## Authentication Notes
This repository currently has two auth styles in code:
- JWT auth controller flow (API-oriented)
- Session/Fortify-style routes under `Backend/routes/web.php` (`/api/auth/*`)

For consistency with the current frontend Axios base URL (`/api`), use one auth approach and remove/align the other to avoid confusion.

## Common Issues & Fixes

### 1) Vite proxy error `ECONNREFUSED` for `/api/...`
Cause: backend server is not running on the expected host/port.
Fix:
- start backend at `127.0.0.1:8000`
- then run frontend
- if needed, update `Frontend/vite.config.js` proxy target to `http://127.0.0.1:8000`

### 2) `Database file at path [restaurant-management] does not exist`
Cause: app is using SQLite because `DB_CONNECTION` is not set.
Fix:
- set `DB_CONNECTION=mysql`
- ensure `DB_DATABASE=restaurant-management` (no leading space)
- run `php artisan config:clear`

### 3) `Could not create token`
Cause: JWT secret missing or invalid.
Fix:
```bash
cd Backend
php artisan jwt:secret
php artisan optimize:clear
```

### 4) `users.first_name NOT NULL constraint failed`
Cause: user creation is sending `name` but schema requires `first_name` and `last_name`.
Fix:
- align register logic with your `users` schema (`first_name`, `last_name`)

## Development Tips
- Clear Laravel cache after env/config changes:
```bash
cd Backend
php artisan optimize:clear
```
- Check backend errors in:
`Backend/storage/logs/laravel.log`

## License
This project is currently unlicensed for public distribution unless you add a license file.
