FROM nikolaik/python-nodejs:latest

RUN mkdir -p /home/node/app/node_modules 

WORKDIR /home/node/app

COPY package*.json ./

RUN apk add python3 2
RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "node", "index.js" ]