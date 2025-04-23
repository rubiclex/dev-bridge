FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install express

COPY . .

ENV Port=8080

EXPOSE 8080

CMD [ "node", "index.js" ]