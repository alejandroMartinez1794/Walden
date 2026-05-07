# Multi-stage build for optimized image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Crear directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar SOLO dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Runtime
FROM node:20-alpine

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy everything from builder
COPY --from=builder --chown=nextjs:nodejs /app /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 8000

# Health check for liveness probe
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node health-check.js

# Set user
USER nextjs

# Expose port
EXPOSE 8000

# Environment variables (override at runtime)
ENV NODE_ENV=production \
    PORT=8000

# Start the application
CMD ["npm", "start"]
