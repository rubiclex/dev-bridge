FROM node:21.6.1-bullseye-slim

RUN mkdir -p /home/node/app/node_modules

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

CMD [ "node", "index.js" ]