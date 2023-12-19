FROM node:10.15-alpine

RUN mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app
COPY ./ /home/node/app/

# RUN apk update && apk add --no-cache wget && apk --no-cache add openssl wget && apk add ca-certificates && update-ca-certificates && \
#     echo @3.10 http://nl.alpinelinux.org/alpine/v3.10/community >> /etc/apk/repositories && \
#     echo @3.10 http://nl.alpinelinux.org/alpine/v3.10/main >> /etc/apk/repositories && \
#     apk add chromium@3.10=77.0.3865.120-r0 \
#       nss@3.10 \
#       freetype@3.10 \
#       freetype-dev@3.10 \
#       harfbuzz@3.10 \
#       ca-certificates \
#       ttf-freefont@3.10 \
#       ttf-dejavu \
#       ttf-droid \
#       ttf-liberation \
#       ttf-ubuntu-font-family && rm -rf /var/cache/apk/*
#       # nodejs
#       # yarn

RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    udev \
    ttf-freefont \
    chromium \
    wget \
    openssl \
    ca-certificates \
    && update-ca-certificates
    
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install curl
RUN apk add curl

#Install LFTP
RUN apk add lftp

# Compile code
RUN npm install

# Config Timezone Asia/Jakarta
RUN apk add tzdata && cp /usr/share/zoneinfo/Asia/Jakarta /etc/localtime && echo "Asia/Jakarta" >  /etc/timezone

COPY . .

# RUN chown -R node:node /home/node/*

USER root
EXPOSE 8099

CMD ["npm", "start"]