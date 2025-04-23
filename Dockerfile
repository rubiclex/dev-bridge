FROM node:21.7.3-alpine

RUN mkdir -p /home/node/app/node_modules

WORKDIR /home/node/app

COPY package*.json ./

RUN apk add --no-cache --virtual .gyp python make g++ \
    && npm install canvas:^2.11.2 \
    && apk del .gyp
RUN npm install

CMD [ "node", "index.js" ]