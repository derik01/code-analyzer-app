FROM nginx:stable-alpine

COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
