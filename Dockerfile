# define base image
FROM ubuntu:22.04

# set work directory
WORKDIR /usr/src/app

RUN apt install -y nodejs
RUN apt install -y npm


RUN npm install canvas@2.11.1
        
