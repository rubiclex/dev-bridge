FROM alpine:3.16.8


ENV NODE_PACKAGE_URL https://unofficial-builds.nodejs.org/download/release/v21.7.2/node-v21.7.2-linux-x64-musl.tar.gz


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

# npm version coming with node is 9.5.1
# To install specific npm version, run the following command, or remove it to use the default npm version:
RUN npm install -g npm@9.6.6

RUN apk update && apk add build-base g++ cairo-dev pango-dev giflib-dev

RUN npm install canvas@2.11.2