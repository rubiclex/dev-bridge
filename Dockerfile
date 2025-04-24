# define base image
FROM node:21.7.3-alpine

# set work directory
WORKDIR /usr/src/app

RUN apk add python3
RUN apk --no-cache add  \
        wget            \
        ca-certificates \
        libstdc++
# Get and install glibc for alpine
RUN apk add gcompat

RUN npm install canvas@2.11.1
        
