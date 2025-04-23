FROM ubuntu:oracular

RUN mkdir -p /home/node/app/node_modules

RUN npm install canvas

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

CMD [ "node", "index.js" ]