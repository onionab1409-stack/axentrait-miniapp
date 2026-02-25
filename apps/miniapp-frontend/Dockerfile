FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/miniapp-frontend/package.json apps/miniapp-frontend/

RUN corepack enable && pnpm install --frozen-lockfile --filter miniapp-frontend...

COPY apps/miniapp-frontend/ apps/miniapp-frontend/
RUN pnpm --filter miniapp-frontend build

FROM nginx:1.27-alpine
COPY --from=builder /app/apps/miniapp-frontend/dist /usr/share/nginx/html
COPY apps/miniapp-frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
