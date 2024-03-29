FROM surnet/alpine-wkhtmltopdf:3.16.2-0.12.6-full as wkhtmltopdf
FROM openjdk:19-jdk-alpine3.16
FROM node:18.19.0-alpine

ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
    
RUN mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app
COPY ./ /home/node/app/      

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
    && update-ca-certificates \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ttf-dejavu \
    ttf-droid \
    ttf-liberation \
    libstdc++ \
    libx11 \
    libxrender \
    libxext \
    libssl1.1 \
    fontconfig \
    && apk add --no-cache --virtual .build-deps \
    msttcorefonts-installer \
    && update-ms-fonts \
    && fc-cache -f \
    && rm -rf /tmp/* \
    && apk del .build-deps \
    && node --version \
    && npm --version

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
#       libstdc++ \
#       libx11 \
#       libxrender \
#       libxext \
#       libssl1.1 \
#       fontconfig \
#       && apk add --no-cache --virtual .build-deps \
#       msttcorefonts-installer \
#       && update-ms-fonts \
#       && fc-cache -f \
#       && rm -rf /tmp/* \
#       && apk del .build-deps \
#       && node --version \
#       && npm --version

# Copy wkhtmltopdf files from docker-wkhtmltopdf image
COPY --from=wkhtmltopdf /bin/wkhtmltopdf /bin/wkhtmltopdf
COPY --from=wkhtmltopdf /bin/wkhtmltoimage /bin/wkhtmltoimage
COPY --from=wkhtmltopdf /bin/libwkhtmltox* /bin/

# Install curl
RUN apk add curl

#Install LFTP
RUN apk add lftp

# Compile code
RUN npm install --no-bin-links && npm cache clean --force

# Config Timezone Asia/Jakarta
RUN apk add tzdata gnupg && cp /usr/share/zoneinfo/Asia/Jakarta /etc/localtime && echo "Asia/Jakarta" >  /etc/timezone

COPY . .

RUN chown -R node:node /bin/*

USER node
EXPOSE 8099

CMD ["npm", "start"]