# syntax=docker/dockerfile:1

# ============================================================================
# mega-site — Next.js 16 (standalone) multi-stage image
# Base: Node 22 LTS (Next 16 + React 19 cần Node >= 18.18).
# ============================================================================

# --- deps: cài dependencies (kể cả dev, cần cho `next build`) ---------------
FROM node:22-alpine AS deps
WORKDIR /app
# libc compat cho một số native deps trên alpine
RUN apk add --no-cache libc6-compat
# Không chạy husky/git hook trong container
ENV HUSKY=0
COPY package.json package-lock.json ./
RUN npm ci

# --- builder: build ứng dụng ------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
ENV HUSKY=0
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Biến NEXT_PUBLIC_* được INLINE lúc build → phải truyền qua build-arg.
ARG NEXT_PUBLIC_WS_BASE_URL=""
ENV NEXT_PUBLIC_WS_BASE_URL=${NEXT_PUBLIC_WS_BASE_URL}

RUN npm run build

# --- runner: image chạy production, tối giản --------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Chạy dưới user không phải root
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# `output: "standalone"` gom sẵn server + node_modules tối thiểu vào .next/standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

# server.js do standalone output tạo ra
CMD ["node", "server.js"]
