FROM ubuntu:oracular

RUN mkdir -p /home/node/app/node_modules

RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_21.x -o nodesource_setup.sh
RUN sudo -E bash nodesource_setup.sh
RUN sudo apt-get install -y nodejs


RUN apt-get install nodejs:21
RUN npm install canvas

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

CMD [ "node", "index.js" ]