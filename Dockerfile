FROM node:21-alpine

RUN mkdir -p /home/node/app/node_modules

ENV GLIBC_VERSION 2.23-r1

RUN apk --update add --no-cache --virtual=build-dependencies curl \
 && curl -Ls https://github.com/andyshinn/alpine-pkg-glibc/releases/download/${GLIBC_VERSION}/glibc-${GLIBC_VERSION}.apk -o /tmp/glibc-${GLIBC_VERSION}.apk \
 && curl -Ls https://github.com/andyshinn/alpine-pkg-glibc/releases/download/${GLIBC_VERSION}/glibc-bin-${GLIBC_VERSION}.apk -o /tmp/glibc-bin-${GLIBC_VERSION}.apk \
 && curl -Ls https://github.com/andyshinn/alpine-pkg-glibc/releases/download/${GLIBC_VERSION}/glibc-i18n-${GLIBC_VERSION}.apk -o /tmp/glibc-i18n-${GLIBC_VERSION}.apk \
 && apk add --allow-untrusted /tmp/glibc-${GLIBC_VERSION}.apk /tmp/glibc-bin-${GLIBC_VERSION}.apk /tmp/glibc-i18n-${GLIBC_VERSION}.apk \
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