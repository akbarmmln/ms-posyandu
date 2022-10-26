FROM node:latest

RUN mkdir -p /home/node/app/node_modules
#&& chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

# If you are building your code for production
# RUN npm install --only=production
RUN npm install

COPY . .

#COPY --chown=node:node . .

USER root

EXPOSE 8099

CMD ["npm", "start"]