FROM node:carbon

# Create app directory
WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

# Bundle app source
COPY config.yml .
COPY app.js .

USER node:node

CMD [ "npm", "start" ]
