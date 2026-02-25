FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/worker/package.json apps/worker/

RUN corepack enable && pnpm install --frozen-lockfile --filter worker...

COPY apps/worker/ apps/worker/
RUN pnpm --filter worker build

FROM node:20-alpine
WORKDIR /app/apps/worker
ENV NODE_ENV=production

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/worker/node_modules ./node_modules
COPY --from=builder /app/apps/worker/dist ./dist
COPY --from=builder /app/apps/worker/package.json ./package.json

CMD ["node", "dist/main.js"]
