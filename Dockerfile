# define base image
FROM node:21.7.3-alpine

# set work directory
WORKDIR /usr/src/app

RUN npm install canvas
