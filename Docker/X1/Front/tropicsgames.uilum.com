server {
    listen 80;
    server_name tropicsgames.uilum.com;

    client_max_body_size 16M;
    keepalive_timeout 60;

    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    proxy_read_timeout 300;
    send_timeout 300;

    root /var/www/apps/ad_front_feat_ui/ad_front/public;

    index index.php;

    access_log /var/log/nginx/tropicsgames.aceess.log;
    error_log /var/log/nginx/tropicsgames.error.log;
    location / {
       try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        #fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_connect_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_read_timeout 300;
     }

    location ~ /\.ht {
        deny all;
    }
}