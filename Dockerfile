# Node.js LTS multi-stage build for Nuxt 3
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
ENV PORT=3000

# Copy built server output and assets from builder
COPY --from=builder /app/.output ./

EXPOSE 3000

# Run Nuxt nitro server
CMD ["node", "server/index.mjs"]
