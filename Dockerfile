FROM ubuntu:25.04

RUN apt-get update

WORKDIR /usr/src/app

COPY package*.json .

RUN apt install curl
RUN curl -sL https://deb.nodesource.com/setup_21.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y npm

RUN npm install



CMD ["bash"]
