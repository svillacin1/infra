FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    software-properties-common \
    apt-transport-https \
    lsb-release \
    ca-certificates \
    curl \
    gnupg2 \
    zip \
    unzip \
    gcc \
    make \
    pkg-config \
    libssl-dev \
    wget

RUN add-apt-repository ppa:ondrej/php -y && apt-get update
RUN apt update && apt install -y software-properties-common apt-utils curl nginx -y
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt update && apt install php8.1 php8.1-fpm php8.1-xml php8.1-pdo php8.1-mysql php8.1-xml php8.1-curl php8.1-gd php8.1-zip php8.1-mcrypt php8.1-bcmath php8.1-mbstring composer php8.1-dev php8.1-intl php8.1-cli php-pear libutf8proc-dev -y
RUN apt install nodejs -y
RUN pecl install mongodb
RUN mkdir /var/www/apps/
RUN mkdir /var/www/apps/ad_front

COPY ./ad_front /var/www/apps/ad_front
RUN if [ -L /var/www/apps/ad_front/storage ]; then rm /var/www/apps/ad_front/storage; fi
RUN if [ -L /var/www/apps/ad_front/storage1 ]; then rm /var/www/apps/ad_front/storage1; fi
RUN ln -s /var/www/apps/ad_front/shared/storage /var/www/apps/ad_front/storage

RUN cd /var/www/apps/ad_front \
    composer install --no-scripts
RUN cd /var/www/apps/ad_front \
    php artisan key:generate --force
RUN cd /var/www/apps/ad_front \
    php artisan migrate --force
RUN cd /var/www/apps/ad_front \
    npm i
RUN cd /var/www/apps/ad_front \
    npm run production

RUN if [ -L /etc/nginx/sites-enabled/default ]; then rm /etc/nginx/sites-enabled/default; fi
COPY ./api.tropics.ai /etc/nginx/sites-enabled/api.tropics.ai
COPY ./tropicsgames.uilum.com /etc/nginx/sites-enabled/tropicsgames.uilum.com

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
