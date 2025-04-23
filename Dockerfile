FROM ubuntu:plucky

RUN apt-get install -y curl 
RUN curl -fsSL https://deb.nodesource.com/setup_21.x -o nodesource_setup.sh 
RUN -E bash nodesource_setup.sh 
RUN apt-get install -y nodejs

RUN mkdir -p /home/node/app/node_modules

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "node", "index.js" ]