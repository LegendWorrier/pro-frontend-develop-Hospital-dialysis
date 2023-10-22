FROM node:16-alpine AS development

RUN mkdir -p /srv/app/node_modules && chown -R node:node /srv/app

WORKDIR /srv/app

COPY package*.json ./

USER node

RUN npm ci --quiet --omit=dev

FROM alpine AS production

RUN apk add --update nodejs
# && apk --no-cache add ca-certificates

WORKDIR /srv/app

COPY --from=development --chown=node:node /srv/app/node_modules ./node_modules
COPY ./dist/ .
COPY ./package.PROD.json ./package.json

EXPOSE 3080

CMD [ "node", "index.js" ]