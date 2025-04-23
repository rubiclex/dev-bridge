FROM node:21-alpine

RUN mkdir -p /home/node/app/node_modules
RUN apk add --no-cache --virtual .gyp \
        python3 \
        make \
        g++

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

CMD [ "node", "index.js" ]