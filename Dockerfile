FROM node:21.7.3-bookworm

RUN mkdir -p /home/node/app/node_modules

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install


CMD [ "node", "index.js" ]