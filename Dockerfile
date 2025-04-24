# define base image
FROM node:21.7.3-alpine

# set work directory
WORKDIR /usr/src/app

RUN apk add python3
RUN yum install gcc-c++ cairo-devel libjpeg-turbo-devel pango-devel giflib-devel
RUN npm install canvas
