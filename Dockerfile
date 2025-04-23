FROM node:21-alpine

RUN mkdir -p /home/node/app/node_modules
RUN apk add --no-cache --virtual .gyp python make g++ \
    && npm install [ your npm dependencies here ] \
    && apk del .gyp

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "node", "index.js" ]