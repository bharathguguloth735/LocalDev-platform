# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# --- Stage 2: Final Image ---
FROM node:20-alpine
WORKDIR /app

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Copy backend dependencies
COPY backend/package*.json ./backend/
RUN npm install --prefix backend --production

# Copy backend source
COPY backend/ ./backend/

# Copy frontend build from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port (Cloud Run uses 8080 by default)
EXPOSE 8080

# Start server
WORKDIR /app/backend
CMD ["node", "index.js"]
