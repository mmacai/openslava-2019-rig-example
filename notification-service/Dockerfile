FROM node:10.15.0-alpine

WORKDIR /home/node

ADD package.json yarn.lock ./

RUN yarn --frozen-lockfile

ENV NODE_ENV production

COPY . .

CMD [ "yarn", "start" ]
