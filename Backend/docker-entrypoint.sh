#!/bin/sh
set -e

# Ensure Laravel storage directories exist (volumes may be empty on first boot)
echo "Ensuring storage directories exist..."
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/framework/cache/data
mkdir -p storage/logs
mkdir -p bootstrap/cache

# Fix permissions
echo "Setting permissions..."
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Wait for database (Crucial for CI/CD)
echo "Waiting for database connection..."
RETRIES=30
until php artisan db:monitor --databases=mysql > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo "Waiting for mysql... ($RETRIES attempts left)"
  sleep 2
  RETRIES=$((RETRIES-1))
done

# Run Artisan commands
echo "Warming up caches..."
php artisan config:cache --no-interaction
php artisan route:cache --no-interaction
php artisan view:cache --no-interaction

exec "$@"
