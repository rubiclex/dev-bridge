# define base image
FROM node:21.7.3-alpine

# set work directory
WORKDIR /usr/src/app

RUN apt-get update && apt-get install python2 -y
RUN npm install canvas
