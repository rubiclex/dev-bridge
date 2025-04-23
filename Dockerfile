FROM ubuntu:oracular

RUN mkdir -p /home/node/app/node_modules
RUN apt-get install npm
RUN apt-get install nodejs:21
RUN npm install canvas

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

CMD [ "node", "index.js" ]