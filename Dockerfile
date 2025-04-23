FROM node:21-alpine

RUN mkdir -p /home/node/app/node_modules

RUN apk --update add --no-cache --virtual=build-dependencies curl \
 && curl -Ls https://github.com/andyshinn/alpine-pkg-glibc/releases/download/$2.23-r1/glibc-$2.23-r1.apk -o /tmp/glibc-$2.23-r1.apk \
 && curl -Ls https://github.com/andyshinn/alpine-pkg-glibc/releases/download/$2.23-r1/glibc-bin-$2.23-r1.apk -o /tmp/glibc-bin-$2.23-r1.apk \
 && curl -Ls https://github.com/andyshinn/alpine-pkg-glibc/releases/download/$2.23-r1/glibc-i18n-$2.23-r1.apk -o /tmp/glibc-i18n-$2.23-r1.apk \
 && apk add --allow-untrusted /tmp/glibc-$2.23-r1.apk /tmp/glibc-bin-$2.23-r1.apk /tmp/glibc-i18n-$2.23-r1.apk \
 && /usr/glibc-compat/bin/localedef --force --inputfile POSIX --charmap UTF-8 C.UTF-8 || true \
 && /usr/glibc-compat/sbin/ldconfig /lib /usr/glibc/usr/lib \
 && echo "export LANG=C.UTF-8" > /etc/profile.d/locale.sh \
 && echo "hosts: files mdns4_minimal [NOTFOUND=return] dns mdns4" >> /etc/nsswitch.conf \
 && apk --update del build-dependencies curl \
 && rm -vfr /tmp/glibc-* \
 && rm -vfr /var/cache/apk/*

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

CMD [ "node", "index.js" ]