# 🐳 Guía de Despliegue con Docker

Esta guía te ayudará a desplegar Psiconepsis usando Docker.

## 📋 Requisitos Previos

- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM mínimo
- 10GB espacio en disco

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores
nano .env
```

**Variables críticas a configurar:**
- `MONGO_URL`: Tu MongoDB Atlas URL (recomendado para producción)
- `JWT_SECRET`: Un string aleatorio seguro
- `ENCRYPTION_KEY`: Exactamente 32 caracteres
- `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`: De Google Cloud Console
- `EMAIL_USER` y `EMAIL_PASSWORD`: Credenciales SMTP

### 2. Construir y Levantar Servicios

```bash
# Build + start de todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver solo logs del backend
docker-compose logs -f backend
```

### 3. Verificar que todo funciona

```bash
# Health check del backend
curl http://localhost:8000/api/v1/health

# Health check del frontend
curl http://localhost/health
```

## 🏗️ Servicios Incluidos

### Backend (puerto 8000)
- Node.js 20 Alpine
- Express.js API
- Health checks automáticos
- Logs persistentes en `./backend/logs`

### Frontend (puerto 80)
- React + Vite build
- Nginx optimizado
- Gzip compression
- Security headers

### MongoDB (puerto 27017)
- Solo para desarrollo local
- **En producción usa MongoDB Atlas**
- Datos persistentes en volume `mongo-data`

### Redis (puerto 6379)
- Cache y sesiones
- Datos persistentes en volume `redis-data`

## 📦 Comandos Útiles

### Gestión de Servicios

```bash
# Parar todo
docker-compose down

# Parar y eliminar volumes (¡CUIDADO! Borra datos)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart backend

# Ver estado
docker-compose ps

# Reconstruir después de cambios en código
docker-compose up -d --build
```

### Logs y Debug

```bash
# Logs en tiempo real
docker-compose logs -f

# Últimas 100 líneas
docker-compose logs --tail=100

# Entrar a un container
docker-compose exec backend sh
docker-compose exec frontend sh
```

### Mantenimiento

```bash
# Eliminar imágenes antiguas
docker image prune -a

# Ver uso de espacio
docker system df

# Limpiar todo (¡CUIDADO!)
docker system prune -a --volumes
```

## 🔧 Configuraciones Avanzadas

### Solo Backend y Frontend (MongoDB en Atlas)

```bash
# Editar .env para usar MongoDB Atlas
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/psiconepsis

# Levantar solo servicios necesarios
docker-compose up backend frontend -d
```

### Con Nginx Proxy (SSL)

```bash
# Crear directorio para certificados
mkdir -p nginx/ssl

# Copiar certificados
cp /path/to/cert.pem nginx/ssl/
cp /path/to/key.pem nginx/ssl/

# Levantar con proxy
docker-compose --profile with-proxy up -d
```

### Desarrollo vs Producción

```bash
# Desarrollo (con hot reload)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Producción
docker-compose up -d
```

## 🌐 Despliegue en Servidor

### Opción 1: VPS (DigitalOcean, Linode, etc)

```bash
# 1. Conectar a servidor
ssh user@your-server-ip

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Clonar repo
git clone https://github.com/alejandroMartinez1794/Walden.git
cd Walden

# 4. Configurar .env
cp .env.example .env
nano .env

# 5. Levantar servicios
docker-compose up -d

# 6. Configurar Nginx reverse proxy (opcional)
# Ver ejemplo en nginx/nginx-reverse-proxy.conf
```

### Opción 2: Railway

```bash
# Railway detecta Dockerfile automáticamente
railway up
```

### Opción 3: Render

1. Conectar repo de GitHub
2. Render detecta Dockerfile automáticamente
3. Configurar variables de entorno
4. Deploy

## 🔒 Seguridad en Producción

### Checklist

- [ ] Cambiar todas las contraseñas del .env.example
- [ ] Usar MongoDB Atlas (no MongoDB local)
- [ ] Habilitar SSL/TLS (Let's Encrypt)
- [ ] Configurar firewall (solo puertos 80/443)
- [ ] Habilitar backups automáticos
- [ ] Configurar logs externos (Papertrail, Loggly)
- [ ] Habilitar monitoring (UptimeRobot)
- [ ] Revisar security headers (usar security-scan workflow)

### SSL con Let's Encrypt

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d psiconepsis.com -d www.psiconepsis.com

# Auto-renovación
sudo certbot renew --dry-run
```

## 📊 Monitoring

### Logs

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Exportar logs
docker-compose logs > logs-$(date +%Y%m%d).txt
```

### Métricas de Containers

```bash
# Uso de recursos
docker stats

# Inspeccionar container
docker inspect psiconepsis-backend
```

### Health Checks

Los health checks están configurados automáticamente:
- Backend: cada 30s
- Frontend: cada 30s
- MongoDB: cada 10s
- Redis: cada 10s

## 🐛 Troubleshooting

### Backend no arranca

```bash
# Ver logs
docker-compose logs backend

# Verificar variables de entorno
docker-compose exec backend env

# Reiniciar
docker-compose restart backend
```

### Error de conexión a MongoDB

```bash
# Verificar que MongoDB está corriendo
docker-compose ps mongo

# Ver logs de MongoDB
docker-compose logs mongo

# Verificar conectividad
docker-compose exec backend ping mongo
```

### Frontend no carga

```bash
# Verificar build
docker-compose logs frontend

# Verificar Nginx config
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Reiniciar Nginx
docker-compose restart frontend
```

## 🔄 Actualizaciones

```bash
# 1. Pull últimos cambios
git pull origin main

# 2. Rebuild containers
docker-compose up -d --build

# 3. Verificar
docker-compose ps
```

## 💾 Backups

### Backup de MongoDB

```bash
# Crear backup
docker-compose exec mongo mongodump --out /tmp/backup
docker cp psiconepsis-mongo:/tmp/backup ./backup-$(date +%Y%m%d)

# Restaurar backup
docker cp ./backup psiconepsis-mongo:/tmp/
docker-compose exec mongo mongorestore /tmp/backup
```

### Backup de Volumes

```bash
# Crear backup de todos los volumes
docker run --rm \
  -v medicare-booking-main_mongo-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mongo-backup-$(date +%Y%m%d).tar.gz /data
```

## 📞 Soporte

- GitHub Issues: https://github.com/alejandroMartinez1794/Walden/issues
- Email: dev@psiconepsis.com
- Documentación: Ver /docs en el repo
