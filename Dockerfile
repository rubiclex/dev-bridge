FROM ubuntu:25.04

RUN apt-get update

WORKDIR /usr/src/app

COPY package*.json .
RUN ls -ln

RUN apt-get install -y node npm

RUN npm install



CMD ["bash"]
