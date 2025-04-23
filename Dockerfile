FROM python:latest

RUN apt-get update && apt-get upgrade -y && apt-get install -y nodejs npm 

RUN mkdir -p /home/node/app/node_modules

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "node", "index.js" ]