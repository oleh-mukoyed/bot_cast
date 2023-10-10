FROM node:18-alpine as build

USER node

# Create app directory
WORKDIR /usr/src/app

COPY --chown=node:node ./server/package*.json ./
COPY --chown=node:node ./server/tsconfig*.json ./
COPY --chown=node:node ./server/src ./src
COPY --chown=node:node ./shared ../shared
COPY --chown=node:node ./server/prisma ./prisma
COPY --chown=node:node ./replace_dependency.sh ./

RUN chmod +x replace_dependency.sh
RUN ./replace_dependency.sh

RUN yarn install

ENV NODE_ENV production

RUN yarn install --prod --immutable && yarn cache clean

RUN npx prisma generate

#RUN yarn build
RUN npx @nestjs/cli build

FROM node:18-alpine As production

WORKDIR /app

COPY --chown=node:node --from=build /usr/src/app/package.json ./package.json
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma

CMD yarn start:migrate:prod
