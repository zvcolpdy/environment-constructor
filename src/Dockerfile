FROM node:latest

RUN mkdir -p /app

WORKDIR /app/client

COPY ./client/package*.json /app/client/

RUN npm install

COPY ./client /app/client/

WORKDIR /app/server

COPY ./server/package*.json /app/server/

RUN npm install

COPY ./server /app/server/

EXPOSE 3000 5858 8000

#CMD ["npm", "start"]