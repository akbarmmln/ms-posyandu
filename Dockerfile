FROM node:10.15-alpine
# FROM node:latest

RUN mkdir -p /home/node/app/node_modules
#&& chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

RUN wget -qO- "https://github.com/dustinblackman/phantomized/releases/download/2.1.1a/dockerized-phantomjs.tar.gz" | tar xz -C / \
    && npm config set user 0 \
    && npm install -g phantomjs-prebuilt

RUN apk add --update ttf-dejavu ttf-droid ttf-freefont ttf-liberation ttf-ubuntu-font-family && rm -rf /var/cache/apk/*

RUN npm install

COPY . .

#COPY --chown=node:node . .

USER root

EXPOSE 8099

CMD ["npm", "start"]