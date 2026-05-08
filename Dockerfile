# ===== Build Stage =====
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

# Copy source and build
COPY . .
RUN npm run build

# ===== Runtime Stage =====
FROM node:22-alpine AS runtime
WORKDIR /app

# Copy built frontend and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package*.json ./

# Install only production deps for the server
RUN npm install --omit=dev --ignore-scripts 2>/dev/null || true

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server/index.js"]
