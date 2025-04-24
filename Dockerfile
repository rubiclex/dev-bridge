# define base image
FROM ubuntu:22.04

# set work directory
WORKDIR /usr/src/app

RUN apt update
RUN apt install -y ca-certificates curl gnupg

RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_21.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

RUN apt update
RUN apt aptitude -y nodejs
RUN apt aptitude -y npm


RUN npm install canvas@2.11.1
        
