# define base image
FROM node:21.7.3-alpine

# set work directory
WORKDIR /usr/src/app

ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

RUN npm install canvas
