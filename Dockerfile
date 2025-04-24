# define base image
FROM node:21.7.3-alpine

# set work directory
WORKDIR /usr/src/app

RUN apk add --no-cache \
        sudo \
        curl \
        build-base \
        g++ \
        libpng \
        libpng-dev \
        jpeg-dev \
        pango-dev \
        cairo-dev \
        giflib-dev \
        python \
        ;

RUN npm install canvas
