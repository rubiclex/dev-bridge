FROM alpine:3.16.8

ENV GLIBC_VERSION 2.35-r1
ENV NODE_PACKAGE_URL https://unofficial-builds.nodejs.org/download/release/v21.7.2/node-v21.7.2-linux-x64-musl.tar.gz

# Download and install glibc
RUN apk add --update curl && \
  curl -Lo /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
  curl -Lo glibc.apk "https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${GLIBC_VERSION}/glibc-${GLIBC_VERSION}.apk" && \
  curl -Lo glibc-bin.apk "https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${GLIBC_VERSION}/glibc-bin-${GLIBC_VERSION}.apk" && \
  apk add --force-overwrite glibc-bin.apk glibc.apk && \
  /usr/glibc-compat/sbin/ldconfig /lib /usr/glibc-compat/lib && \
  echo 'hosts: files mdns4_minimal [NOTFOUND=return] dns mdns4' >> /etc/nsswitch.conf && \
  apk del curl && \
  rm -rf /var/cache/apk/* glibc.apk glibc-bin.apk

WORKDIR /usr/src/app

RUN apk add libstdc++
RUN apk add python3
WORKDIR /opt
RUN wget $NODE_PACKAGE_URL
RUN mkdir -p /opt/nodejs
RUN tar -zxvf *.tar.gz --directory /opt/nodejs --strip-components=1
RUN rm *.tar.gz
RUN ln -s /opt/nodejs/bin/node /usr/local/bin/node
RUN ln -s /opt/nodejs/bin/npm /usr/local/bin/npm
RUN apk add --update nodejs npm

RUN apk update && apk add build-base g++ cairo-dev pango-dev giflib-dev

RUN npm install canvas@2.11.2