FROM node:19.1.0

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package.json ./
# COPY yarn.lock ./

USER node

# RUN yarn --frozen-lockfile
RUN yarn

COPY --chown=node:node . .

CMD [ "node", "dist/ea/index.js" ]
