ARG NODE_VERSION=20.18.0-alpine
ARG NGINX_VERSION=stable-alpine

# build
FROM node:$NODE_VERSION AS builder

WORKDIR /app

COPY .npmrc package.json pnpm-lock.yaml ./
RUN corepack enable && npm install -g corepack
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . /app

RUN pnpm run build

# server
FROM nginx:$NGINX_VERSION

WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist ./

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
