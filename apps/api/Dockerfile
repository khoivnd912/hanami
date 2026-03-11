FROM node:20-alpine AS base
RUN npm install -g pnpm

# ── Install dependencies ───────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/db/package.json       ./packages/db/
COPY packages/types/package.json    ./packages/types/
COPY packages/config/package.json   ./packages/config/
COPY apps/api/package.json          ./apps/api/
RUN pnpm install --frozen-lockfile --shamefully-hoist

# ── Build ──────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
WORKDIR /app/apps/api
RUN pnpm run build

# ── Production runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=deps    /app/node_modules  ./node_modules
EXPOSE 4000
CMD ["node", "dist/server.js"]
