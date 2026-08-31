# Node.js 24 multi-stage build for Nuxt 3
FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production runtime stage
FROM node:24-alpine AS runner

WORKDIR /app

LABEL org.opencontainers.image.title="Guapa DevOps App" \
      org.opencontainers.image.description="Application Nuxt 3 CI/CD & DevOps pour Guapa" \
      org.opencontainers.image.authors="Ethan Carollo" \
      org.opencontainers.image.source="https://github.com/EthanCarollo/guapa" \
      org.opencontainers.image.licenses="MIT"

ENV NODE_ENV=production \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3000 \
    PORT=3000

# Copy built server output and assets from builder
COPY --from=builder /app/.output ./

EXPOSE 3000

# Health check to ensure Nitro server is up
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Run Nuxt nitro server
CMD ["node", "server/index.mjs"]
