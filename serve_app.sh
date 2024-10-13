#!/bin/bash
# run this script as sudo user inside the root dir
cp nginx_config.conf /etc/nginx/sites-enabled/default
rm -rf /var/www/rCloud/frontend
mkdir -p /var/www/rCloud/frontend
cp -r ./frontend/dist /var/www/rCloud/frontend
chown -R www-data:www-data /var/www/rCloud/frontend/dist
chmod -R 755 /var/www/rCloud/frontend/dist
systemctl restart nginx
