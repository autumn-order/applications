ARG PUBLIC_VITE_BACKEND_URL

FROM oven/bun:canary-alpine AS builder
WORKDIR /app

COPY package.json bun.lockb ./

RUN bun i

COPY components.json postcss.config.js svelte.config.js tailwind.config.js tsconfig.json vite.config.ts ./
COPY .svelte-kit/tsconfig.json ./.svelte-kit/tsconfig.json
COPY src ./src
COPY static ./static

ENV PUBLIC_VITE_BACKEND_URL=${PUBLIC_VITE_BACKEND_URL}

RUN bun run build

FROM oven/bun:canary-alpine
WORKDIR /app

RUN apk add --no-cache ca-certificates curl

COPY --from=builder /app/build .

ENV NODE_ENV=production

EXPOSE 3000

CMD [ "bun", "run", "start" ]
