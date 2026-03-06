FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json ./
COPY packages/db/package.json       ./packages/db/
COPY packages/types/package.json    ./packages/types/
COPY packages/config/package.json   ./packages/config/
COPY apps/api/package.json          ./apps/api/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules         ./node_modules
COPY --from=deps /app/packages/db/node_modules   ./packages/db/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/apps/api/node_modules        ./apps/api/node_modules
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
WORKDIR /app/apps/api
RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=deps    /app/node_modules  ./node_modules
EXPOSE 4000
CMD ["node", "dist/server.js"]
