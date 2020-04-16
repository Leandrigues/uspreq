FROM node:13.13-alpine3.10

ENV APP_PATH=/usr/src/app \
    PORT=3000

WORKDIR ${APP_PATH}

COPY package.json yarn.lock ./

RUN yarn install

COPY . ./

EXPOSE ${PORT}

CMD yarn dev