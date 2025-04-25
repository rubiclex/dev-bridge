FROM ubuntu:25.04

RUN apt-get update

WORKDIR /usr/src/app

COPY package*.json .
RUN npm install

RUN ls -ln

CMD ["bash"]
