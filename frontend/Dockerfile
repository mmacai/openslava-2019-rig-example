FROM node:10.15.0-alpine as builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production

ADD package.json yarn.lock /usr/src/app/

RUN yarn --frozen-lockfile

COPY . /usr/src/app
RUN yarn build

######

FROM nginx:alpine

COPY --from=builder /usr/src/app/build /www/frontend
COPY nginx.conf /etc/nginx/nginx.conf