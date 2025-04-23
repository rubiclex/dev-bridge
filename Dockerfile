FROM node:latest

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
RUN apt-get install -y python3.6 \
    && ln -s /usr/bin/python3.6 /usr/bin/python3
RUN python3 -V

WORKDIR /home/node/app

COPY package*.json ./

USER node
RUN apk add python3 2
RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "node", "index.js" ]