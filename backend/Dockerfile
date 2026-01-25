# Multi-stage build para optimizar tamaño
FROM node:20-alpine AS builder

# Metadata
LABEL maintainer="Psiconepsis <dev@psiconepsis.com>"
LABEL description="Backend API para plataforma de telemedicina"

# Instalar dependencias de sistema necesarias
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

# Copiar node_modules del builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar código fuente
COPY --chown=nodejs:nodejs . .

# Crear directorios necesarios
RUN mkdir -p logs uploads temp && \
    chown -R nodejs:nodejs logs uploads temp

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Variables de entorno por defecto (override en runtime)
ENV NODE_ENV=production \
    PORT=8000

# Comando de inicio
CMD ["node", "index.js"]
