FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV Port=8080

EXPOSE 8080

CMD [ "npm", "start" ]