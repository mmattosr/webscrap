FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./
COPY app/ app/

RUN npm install

EXPOSE 8080

CMD ["node", "app/server.js"]
