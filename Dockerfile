FROM ubuntu:oracular

RUN mkdir -p /home/node/app/node_modules

RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_21.x  | bash -
RUN apt-get -y install nodejs
RUN npm install


RUN apt-get install nodejs:21
RUN npm install canvas

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

CMD [ "node", "index.js" ]