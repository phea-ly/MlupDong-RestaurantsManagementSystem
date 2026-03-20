FROM php:8.2-fpm

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
  libpng-dev \
  libjpeg-dev \
  libfreetype6-dev \
  libzip-dev \
  libpq-dev \
  libicu-dev \
  unzip \
  git \
  curl \
  libxml2-dev \
  supervisor \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install \
  pdo_mysql \
  pdo_pgsql \
  gd \
  zip \
  pcntl \
  bcmath \
  fileinfo \
  intl \
  xml \
  && rm -rf /var/lib/apt/lists/*

# Install Redis extension via pecl with error handling
RUN pecl install redis \
  && docker-php-ext-enable redis \
  && rm -rf /tmp/pear

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./

RUN composer install \
  --no-dev \
  --optimize-autoloader \
  --no-interaction \
  --no-scripts \
  --prefer-dist

COPY . .

# Run post-install scripts after full source is available
RUN composer run-script post-autoload-dump --no-interaction || true

RUN chown -R www-data:www-data storage bootstrap/cache \
  && chmod -R 775 storage bootstrap/cache

EXPOSE 9000

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD php-fpm -t || exit 1
