# define base image
FROM ubuntu:22.04

# set work directory
WORKDIR /usr/src/app

RUN apt-get update
RUN apt install -y build-essential
RUN apt install -y curl
RUN curl -sL https://deb.nodesource.com/setup_21.x | bash -

RUN apt install -y nodejs
RUN apt install -y npm


RUN npm install canvas@2.11.1
        
