# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache curl

# Copy package files and install production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built output and prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

# Create uploads directory
RUN mkdir -p uploads/proofs

# Generate prisma client
RUN npx prisma generate

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "dist/server.js"]
