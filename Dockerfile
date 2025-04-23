FROM node:21.7.3-alpine

RUN mkdir -p /home/node/app/node_modules

WORKDIR /home/node/app

COPY package*.json ./

RUN apk add --no-cache --virtual .gyp python3 make g++ cairo pango build-base alpine-sdk
 
RUN npm install node-pre-gyp -g  

RUN npm install

CMD [ "node", "index.js" ]