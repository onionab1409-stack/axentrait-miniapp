FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/backend-api/package.json apps/backend-api/

RUN corepack enable && pnpm install --frozen-lockfile --filter backend-api...

COPY apps/backend-api/ apps/backend-api/
RUN pnpm --filter backend-api prisma:generate
RUN pnpm --filter backend-api build

FROM node:20-alpine
WORKDIR /app/apps/backend-api
ENV NODE_ENV=production

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/backend-api/node_modules ./node_modules
COPY --from=builder /app/apps/backend-api/dist ./dist
COPY --from=builder /app/apps/backend-api/prisma ./prisma
COPY --from=builder /app/apps/backend-api/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main.js"]
