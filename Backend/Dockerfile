# backend/Dockerfile
FROM php:8.3-fpm


WORKDIR /var/www/html


RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev \
    libzip-dev libpq-dev unzip git curl \
    libxml2-dev supervisor \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install pdo_mysql pdo_pgsql gd zip pcntl \
 && rm -rf /var/lib/apt/lists/*


# Install Redis PHP extension
RUN pecl install redis-6.1.0 && docker-php-ext-enable redis


COPY --from=composer:2 /usr/bin/composer /usr/bin/composer


COPY . .


RUN composer install --no-dev --optimize-autoloader --no-interaction


RUN chown -R www-data:www-data storage bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache

COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf


EXPOSE 9000


CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

