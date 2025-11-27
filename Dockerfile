
FROM node:25-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

RUN npm i -g serve

COPY . .

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]