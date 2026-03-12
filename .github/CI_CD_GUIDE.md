# 🚀 CI/CD Pipeline - Basileia

Este documento describe el pipeline de CI/CD implementado para el proyecto Basileia.

## 📋 Workflows Implementados

### 1. **test.yml** - Tests Automáticos
**Trigger:** Push a main/Cambios/develop, Pull Requests a main

**Jobs:**
- ✅ **backend-tests**: Ejecuta todos los tests del backend (312 tests)
- ✅ **frontend-lint**: Verifica lint y build del frontend
- ✅ **security-audit**: Escaneo de vulnerabilidades con npm audit
- ✅ **test-summary**: Resumen de resultados

**Duración estimada:** 3-5 minutos

### 2. **pr-checks.yml** - Validación de Pull Requests
**Trigger:** Apertura/actualización de PRs

**Jobs:**
- 📝 Info del PR (número, autor, branch)
- 🧪 Tests completos
- 📏 Verificación de commits
- 📊 Análisis de tamaño
- 💬 Comentario automático con resumen

### 3. **deploy-staging.yml** - Deploy a Staging
**Trigger:** Push a branch `develop`

**Ambiente:** staging
**Soporta:** Heroku, Render, Vercel

### 4. **deploy-production.yml** - Deploy a Producción
**Trigger:** Push a `main` o tags `v*.*.*`

**Ambiente:** production
**Pasos:**
1. Ejecuta tests completos
2. Build de backend y frontend
3. Crea artifact
4. Deploy a producción
5. Verificación post-deploy

### 5. **security-scan.yml** - Escaneo de Seguridad
**Trigger:** 
- Semanal (Lunes 9 AM)
- Manual
- Push a main

**Checks:**
- 🔍 Dependency scan (npm audit)
- 🛡️ Snyk security scan (si configurado)
- 🔐 Secrets scan con TruffleHog
- 🇨🇴 Compliance Colombia (Ley 1581, Resolución 2654)

## 🔐 Secrets Requeridos

Configure estos secrets en GitHub Settings > Secrets and variables > Actions:

### Básicos
```
MONGO_URL_TEST          # MongoDB para tests (opcional - usa in-memory si no existe)
JWT_SECRET              # Secret para JWT
ENCRYPTION_KEY          # Key de 32 bytes para encriptación
```

### Staging
```
STAGING_API_URL         # URL del API de staging
STAGING_URL             # URL del frontend de staging
HEROKU_API_KEY          # API Key de Heroku (si usa Heroku)
RENDER_DEPLOY_HOOK      # Webhook de Render (si usa Render)
```

### Producción
```
PRODUCTION_API_URL      # URL del API de producción
PRODUCTION_URL          # URL del frontend de producción
VERCEL_TOKEN            # Token de Vercel (si usa Vercel)
```

### Seguridad (Opcionales)
```
SNYK_TOKEN              # Token de Snyk para security scanning
```

## 🐳 Docker

### Build Local

```bash
# Backend
cd backend
docker build -t Basileia-backend .

# Frontend
cd Frontend
docker build --build-arg VITE_API_URL=http://localhost:8000 -t Basileia-frontend .
```

### Docker Compose

```bash
# Desarrollo completo (con MongoDB y Redis locales)
docker-compose up -d

# Solo backend y frontend (usando MongoDB Atlas)
docker-compose up backend frontend
```

## 📊 Badges de Estado

Añade estos badges a tu README.md:

```markdown
![Tests](https://github.com/alejandroMartinez1794/Walden/actions/workflows/test.yml/badge.svg)
![Security](https://github.com/alejandroMartinez1794/Walden/actions/workflows/security-scan.yml/badge.svg)
![Deploy](https://github.com/alejandroMartinez1794/Walden/actions/workflows/deploy-production.yml/badge.svg)
```

## 🔄 Flujo de Trabajo Recomendado

### Para Desarrollo
1. Crear branch desde `develop`: `git checkout -b feature/nueva-funcionalidad`
2. Desarrollar y commitear cambios
3. Push y crear PR hacia `develop`
4. Los checks automáticos se ejecutan
5. Revisar, aprobar y merge
6. Auto-deploy a staging

### Para Producción
1. Crear PR desde `develop` hacia `main`
2. Tests completos se ejecutan
3. Revisión de código
4. Merge a `main`
5. Auto-deploy a producción
6. Verificación post-deploy

## 🚨 Troubleshooting

### Tests fallan en CI pero pasan localmente
- Verificar variables de entorno
- Revisar versión de Node.js (debe ser 20.x)
- Verificar timeout de MongoDB Memory Server

### Deploy falla
- Verificar secrets configurados
- Revisar logs del workflow
- Verificar conectividad con proveedor de hosting

### Security scan detecta vulnerabilidades
- Ejecutar `npm audit fix` localmente
- Revisar si las vulnerabilidades son críticas
- Actualizar dependencias si es necesario

## 📈 Métricas

Los workflows generan métricas automáticamente:
- ✅ Tasa de éxito de tests
- ⏱️ Tiempo de ejecución
- 📊 Cobertura de código (vía Codecov)
- 🔒 Vulnerabilidades detectadas

## 🔗 Links Útiles

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Heroku Deployment](https://devcenter.heroku.com/)
- [Render Deployment](https://render.com/docs)
- [Vercel Deployment](https://vercel.com/docs)
