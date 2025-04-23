FROM node:21.7.3-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake


COPY . /usr/src/app
RUN npm install

CMD [ "node", "index.js" ]