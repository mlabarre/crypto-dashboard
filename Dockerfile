FROM node:20.12.0-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

RUN apk add --no-cache tzdata

USER node

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "node", "app.js" ]