FROM node:21-alpine

RUN mkdir -p /home/node/app/node_modules
RUN npm install --global node-gyp@^2.11.2

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "node", "index.js" ]