FROM sitespeedio/node:ubuntu-22-04-nodejs-22.13.0

RUN mkdir -p /home/node/app/node_modules

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

CMD [ "node", "index.js" ]