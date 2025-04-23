FROM node:latest

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
RUN apk add python3 && ln -sf python3 /usr/bin/python
RUN apk add py3-pip
RUN apk add build-base

WORKDIR /home/node/app

COPY package*.json ./

USER node
RUN apk add python3 2
RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "node", "index.js" ]