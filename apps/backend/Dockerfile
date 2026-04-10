FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
RUN corepack enable && pnpm install
COPY . .
WORKDIR /app/apps/backend
RUN pnpm prisma:generate && pnpm build
EXPOSE 3000
CMD ["node", "dist/main.js"]
