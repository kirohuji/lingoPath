FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps/frontend/package.json apps/frontend/package.json
RUN corepack enable && pnpm install
COPY . .
WORKDIR /app/apps/frontend
RUN pnpm build

FROM nginx:1.27-alpine
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
