FROM  node:14

WORKDIR /usr/src
COPY  package.json ./

RUN rm -rf node_modules && npm install

COPY . .
CMD ["node", "server.js"]

