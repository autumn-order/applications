FROM oven/bun:canary-alpine AS builder
WORKDIR /app

RUN apk add --no-cache ca-certificates curl

COPY package.json bun.lockb ./

RUN bun i

COPY drizzle.config.ts tsconfig.json ./
COPY src ./src
COPY drizzle ./drizzle

ENV NODE_ENV=production

EXPOSE 8787

CMD ["sh", "-c", "bun run migrations && bun run start"]
