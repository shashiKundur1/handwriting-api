# syntax=docker/dockerfile:1

# ============================================================================
# STAGE 1: Base image with security updates and dumb-init
# ============================================================================
FROM node:18-alpine AS base
RUN apk update && apk add --no-cache dumb-init curl
WORKDIR /app


# ============================================================================
# STAGE 2: Development - Install ALL dependencies for hot-reloading
# ============================================================================
FROM base AS development
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
USER node
CMD ["npm", "run", "dev"]


# ============================================================================
# STAGE 3: Dependencies - For builder stage
# ============================================================================
FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci


# ============================================================================
# STAGE 4: Builder - Compile TypeScript and run tests
# ============================================================================
FROM dependencies AS builder
COPY . .
RUN npm run build


# ============================================================================
# STAGE 5: Production - Install only production dependencies
# ============================================================================
FROM base AS production-dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev


# ============================================================================
# STAGE 6: Runtime - Final, lean, and secure image
# ============================================================================
FROM base AS runtime
LABEL maintainer="your-email@example.com"
LABEL org.opencontainers.image.description="Handwriting Digitizer API - OCR and Translation Service"

ENV NODE_ENV=production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/dist ./dist
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY package.json .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/server.js"]