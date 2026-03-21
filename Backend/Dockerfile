FROM php:8.2-fpm

WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libicu-dev \
    unzip \
    git \
    curl \
    libxml2-dev \
    supervisor \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo_mysql \
        gd \
        zip \
        pcntl \
        bcmath \
        fileinfo \
        intl \
        xml \
        opcache \
    && rm -rf /var/lib/apt/lists/*

# Install Redis extension
RUN pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /tmp/pear

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy composer files first (better layer caching)
COPY composer.json composer.lock ./

# ← KEY FIX: added --ignore-platform-reqs
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --no-scripts \
    --prefer-dist \
    --ignore-platform-reqs

# Copy application source
COPY . .

# Post install scripts
RUN composer run-script post-autoload-dump \
    --no-interaction \
    --ignore-platform-reqs || true

# PHP 8.2 OPcache configuration
RUN { \
    echo "opcache.enable=1"; \
    echo "opcache.memory_consumption=256"; \
    echo "opcache.interned_strings_buffer=16"; \
    echo "opcache.max_accelerated_files=20000"; \
    echo "opcache.revalidate_freq=0"; \
    echo "opcache.validate_timestamps=0"; \
    echo "opcache.fast_shutdown=1"; \
} > /usr/local/etc/php/conf.d/opcache.ini

# PHP 8.2 general configuration
RUN { \
    echo "upload_max_filesize=20M"; \
    echo "post_max_size=20M"; \
    echo "memory_limit=256M"; \
    echo "max_execution_time=120"; \
    echo "expose_php=Off"; \
    echo "error_reporting=E_ALL & ~E_DEPRECATED & ~E_STRICT"; \
    echo "log_errors=On"; \
} > /usr/local/etc/php/conf.d/custom.ini

# PHP-FPM pool configuration
RUN { \
    echo "[www]"; \
    echo "user = www-data"; \
    echo "group = www-data"; \
    echo "listen = 0.0.0.0:9000"; \
    echo "pm = dynamic"; \
    echo "pm.max_children = 20"; \
    echo "pm.start_servers = 5"; \
    echo "pm.min_spare_servers = 5"; \
    echo "pm.max_spare_servers = 10"; \
    echo "pm.max_requests = 500"; \
} > /usr/local/etc/php-fpm.d/www.conf

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 9000

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD php-fpm -t && kill -0 1 || exit 1