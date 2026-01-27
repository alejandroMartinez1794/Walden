# 🚀 Guía de Deployment - Psiconepsis

Guía completa para desplegar Psiconepsis en producción usando el stack gratuito seleccionado.

## 📋 Stack de Producción (100% Gratuito)

- **Backend**: Railway (512MB RAM, $5/mes en créditos gratis)
- **Frontend**: Vercel (sin límites, gratis permanente)
- **Base de Datos**: MongoDB Atlas M0 (512MB, gratis permanente)
- **Cache**: Railway Redis (opcional, free tier)
- **Storage**: Cloudinary (25GB, gratis permanente)
- **Monitoring**: New Relic (gratis con Student Pack)
- **Error Tracking**: Sentry (50K errores/mes, gratis con Student Pack)
- **Email**: Brevo (300 emails/día, gratis permanente)
- **Payments**: Wompi (Colombia, 2.79% + $400 COP por transacción)
- **Domain**: psiconepsis.app (Name.com Student Pack, gratis 1 año)

---

## 🎯 FASE 1: Preparación Pre-Deployment

### 1.1 Verificar Ambiente Local

```bash
# Backend
cd backend
npm test              # Verificar 312 tests pasan
npm run check-compliance  # Verificar compliance Colombia
npm run start         # Probar inicio local

# Frontend
cd Frontend
npm run build         # Verificar build exitoso
npm run preview       # Probar build localmente
```

### 1.2 Verificar Variables de Entorno

Crear `.env.production` en backend con valores reales:

```bash
# Database
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/psiconepsis

# JWT & Security
JWT_SECRET_KEY=<generar-con-openssl-rand-base64-32>
ENCRYPTION_KEY=<generar-con-openssl-rand-hex-32>
CSRF_SECRET=<generar-con-openssl-rand-hex-32>

# Google OAuth & Calendar
GOOGLE_CLIENT_ID=<tu-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<tu-client-secret>
GOOGLE_REDIRECT_URI=https://api.psiconepsis.app/api/v1/calendar/google-callback

# URLs
BACKEND_URL=https://api.psiconepsis.app
FRONTEND_URL=https://psiconepsis.app
CORS_ORIGINS=https://psiconepsis.app

# New Relic
NEW_RELIC_LICENSE_KEY=<tu-license-key>
NEW_RELIC_APP_NAME=Psiconepsis API

# Sentry
SENTRY_DSN=https://<key>@o<org>.ingest.sentry.io/<project>

# Brevo
BREVO_API_KEY=xkeysib-<tu-api-key>
EMAIL_FROM=noreply@psiconepsis.app
EMAIL_BCC=admin@psiconepsis.app

# Redis (opcional - Railway lo proporciona automáticamente)
REDIS_URL=redis://default:password@host:port

# Wompi
WOMPI_PUBLIC_KEY=pub_test_<tu-key> # Cambiar a prod_
WOMPI_PRIVATE_KEY=prv_test_<tu-key> # Cambiar a prod_
WOMPI_EVENT_SECRET=<tu-webhook-secret>

# hCaptcha
HCAPTCHA_SECRET=<tu-secret>
```

---

## 🗄️ FASE 2: MongoDB Atlas Setup

### 2.1 Crear Cluster

1. Ir a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Crear cuenta (gratis)
3. Crear nuevo proyecto "Psiconepsis"
4. Create Deployment → M0 (FREE)
   - Provider: AWS
   - Region: **São Paulo (sa-east-1)** (más cercano a Colombia)
   - Cluster Name: `psiconepsis-prod`

### 2.2 Configurar Seguridad

1. **Database Access** → Add New Database User
   - Username: `psiconepsis_admin`
   - Password: (generar seguro)
   - Built-in Role: `Atlas Admin`

2. **Network Access** → Add IP Address
   - `0.0.0.0/0` (permite desde cualquier IP - Railway cambia IPs)
   - ⚠️ **IMPORTANTE**: Esto es seguro porque requiere credenciales

### 2.3 Obtener Connection String

1. Connect → Drivers → Node.js
2. Copiar connection string:
   ```
   mongodb+srv://psiconepsis_admin:<password>@psiconepsis-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. Reemplazar `<password>` con tu contraseña
4. Agregar nombre de base de datos: `/psiconepsis`

### 2.4 Crear Índices Iniciales

```bash
# Conectar a MongoDB y ejecutar
npm run optimize-db
# O manualmente en Atlas UI → Collections → Indexes
```

---

## 🚂 FASE 3: Railway Deployment (Backend)

### 3.1 Preparar Repositorio

```bash
# Asegurarse de estar en branch Cambios
git checkout Cambios
git pull origin Cambios

# Verificar que .gitignore incluya:
# .env
# .env.local
# .env.production
# node_modules/
```

### 3.2 Crear Proyecto en Railway

1. Ir a [Railway.app](https://railway.app)
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo
4. Seleccionar: `alejandroMartinez1794/Walden`
5. Branch: `Cambios`
6. Root Directory: `/backend`

### 3.3 Configurar Variables de Entorno

En Railway Dashboard → Variables:

```bash
NODE_ENV=production
PORT=8000

# Copiar todas las variables de .env.production
MONGO_URL=mongodb+srv://...
JWT_SECRET_KEY=...
ENCRYPTION_KEY=...
# ... (todas las demás)
```

**TIP**: Usar Railway CLI para bulk import:
```bash
npm install -g @railway/cli
railway login
railway link <project-id>
railway variables set -f .env.production
```

### 3.4 Agregar Redis Plugin (Opcional)

1. Railway Dashboard → New → Database → Redis
2. Railway automáticamente agrega `REDIS_URL` a variables
3. Reiniciar servicio backend

### 3.5 Configurar Build

Railway detecta automáticamente Node.js. Verificar en Settings:

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Watch Paths**: `/backend/**`

### 3.6 Deploy

1. Deploy automático al hacer push:
   ```bash
   git push origin Cambios
   ```

2. Ver logs en Railway Dashboard → Deployments

3. Obtener URL pública:
   - Settings → Generate Domain
   - Copiar URL: `https://psiconepsis-backend.up.railway.app`
   - **IMPORTANTE**: Agregar custom domain en Settings → Domains:
     - `api.psiconepsis.app`

---

## ⚡ FASE 4: Vercel Deployment (Frontend)

### 4.1 Preparar Frontend

```bash
cd Frontend

# Actualizar .env.production
cat > .env.production << EOF
VITE_BASE_URL=https://api.psiconepsis.app
EOF

# Verificar build
npm run build
```

### 4.2 Deploy a Vercel

#### Opción A: Vercel CLI (Recomendado)

```bash
npm install -g vercel
vercel login
cd Frontend
vercel --prod
```

#### Opción B: Vercel Dashboard

1. Ir a [Vercel.com](https://vercel.com)
2. Import Git Repository → `alejandroMartinez1794/Walden`
3. Configure Project:
   - Framework Preset: **Vite**
   - Root Directory: `Frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. Environment Variables:
   ```
   VITE_BASE_URL=https://api.psiconepsis.app
   ```

5. Deploy

### 4.3 Custom Domain

1. Vercel Dashboard → Settings → Domains
2. Add Domain: `psiconepsis.app`
3. Seguir instrucciones DNS en Name.com

---

## 🌐 FASE 5: Configurar Dominio (Name.com)

### 5.1 Obtener Dominio Gratis (Student Pack)

1. Ir a [Name.com](https://www.name.com/partner/github-students)
2. Registrar `psiconepsis.app` (gratis 1 año con Student Pack)
3. Renovación: ~$15/año después del primer año

### 5.2 Configurar DNS

En Name.com → Manage Domains → DNS Records:

#### Para Vercel (Frontend):
```
Type: A
Host: @
Answer: 76.76.21.21
TTL: 300

Type: CNAME
Host: www
Answer: cname.vercel-dns.com.
TTL: 300
```

#### Para Railway (Backend API):
```
Type: CNAME
Host: api
Answer: <tu-railway-domain>.up.railway.app.
TTL: 300
```

### 5.3 Verificar SSL

- Vercel: SSL automático (Let's Encrypt)
- Railway: SSL automático
- Verificar: `https://psiconepsis.app` y `https://api.psiconepsis.app`

---

## 📧 FASE 6: Configurar Servicios Externos

### 6.1 Brevo (Email)

1. [app.brevo.com](https://app.brevo.com/account/register)
2. Verificar email
3. Settings → SMTP & API → Create API Key
4. Copiar `BREVO_API_KEY=xkeysib-...`
5. Senders & IP → Add Sender: `noreply@psiconepsis.app`
6. Verificar email sender

### 6.2 New Relic (Monitoring)

1. [newrelic.com/students](https://newrelic.com/students)
2. Connect GitHub account
3. Get license key
4. Copiar `NEW_RELIC_LICENSE_KEY=...`
5. Ver dashboards en New Relic One

### 6.3 Sentry (Error Tracking)

1. [sentry.io/signup](https://sentry.io/signup/)
2. Connect GitHub
3. Create Project → Platform: Express
4. Copiar DSN: `SENTRY_DSN=https://...`

### 6.4 Cloudinary (Image Storage)

1. [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Dashboard → Settings → Security
3. Copiar: Cloud Name, API Key, API Secret
4. Free tier: 25GB storage, 25GB bandwidth

### 6.5 Wompi (Payments)

1. [wompi.com](https://wompi.com/) → Registro
2. Panel → Configuración → API Keys
3. Copiar public y private keys
4. **Producción**: Cambiar de `test` a `prod` keys
5. Configurar Webhooks:
   - URL: `https://api.psiconepsis.app/api/v1/payment/webhook`
   - Events: `transaction.updated`

---

## ✅ FASE 7: Verificación Post-Deployment

### 7.1 Health Checks

```bash
# Backend health
curl https://api.psiconepsis.app/
# Debe retornar: "La gente, la gente!"

# Frontend
curl https://psiconepsis.app/
# Debe retornar HTML

# API Documentation
open https://api.psiconepsis.app/api-docs
```

### 7.2 Pruebas de Endpoints

```bash
# Registro de usuario
curl -X POST https://api.psiconepsis.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test1234!",
    "role": "paciente"
  }'

# Login
curl -X POST https://api.psiconepsis.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'

# Listar doctores aprobados
curl https://api.psiconepsis.app/api/v1/doctors?isApproved=approved
```

### 7.3 Verificar Servicios

- ✅ **MongoDB**: Ver conexiones en Atlas
- ✅ **Redis**: Railway → Redis → Metrics
- ✅ **New Relic**: Ver APM dashboard
- ✅ **Sentry**: Ver errores (debe estar vacío)
- ✅ **Brevo**: Probar envío de email (registro)

---

## 🔒 FASE 8: Seguridad Post-Deployment

### 8.1 Actualizar URLs de Callback

#### Google OAuth:
1. [console.cloud.google.com](https://console.cloud.google.com)
2. APIs & Services → Credentials
3. OAuth 2.0 Client → Authorized redirect URIs:
   - Agregar: `https://api.psiconepsis.app/api/v1/calendar/google-callback`

#### Wompi Webhooks:
1. Panel Wompi → Configuración → Webhooks
2. URL: `https://api.psiconepsis.app/api/v1/payment/webhook`

### 8.2 Habilitar Rate Limiting en Railway

Variables ya configuradas en Phase 6 con Redis.

### 8.3 Configurar Backup Automático

MongoDB Atlas → Clusters → Backup:
- Cloud Backups: **Enabled** (gratis en M0)
- Retention: 2 días (M0 limit)

---

## 📊 FASE 9: Monitoring & Alerts

### 9.1 Configurar New Relic Alerts

1. New Relic → Alerts → Create Policy
2. Alerts:
   - Response time > 2s
   - Error rate > 5%
   - Memory > 80%
   - No requests in 1 hour

### 9.2 Configurar Sentry Alerts

1. Sentry → Alerts → Create Alert
2. Conditions:
   - New issue created
   - Error count > 10/hour

### 9.3 Uptime Monitoring

Usar [UptimeRobot](https://uptimerobot.com/) (gratis):
- Monitor: `https://api.psiconepsis.app`
- Interval: 5 minutes
- Alert: Email cuando down

---

## 🚀 FASE 10: Continuous Deployment

### 10.1 GitHub Actions ya configurado

Ver workflows en `.github/workflows/`:
- `test.yml` - Tests automáticos
- `deploy-production.yml` - Deploy a Railway/Vercel

### 10.2 Workflow de Deploy

```bash
# 1. Desarrollar en branch Cambios
git checkout Cambios
# ... hacer cambios ...
git commit -m "feat: nueva funcionalidad"
git push origin Cambios

# 2. GitHub Actions corre tests automáticamente

# 3. Si tests pasan, Railway auto-deploy

# 4. Merge a main cuando esté listo para producción
git checkout main
git merge Cambios
git push origin main
```

---

## 🆘 Troubleshooting

### Error: "MongoDB connection timeout"
- Verificar IP whitelist en Atlas (debe ser 0.0.0.0/0)
- Verificar connection string correcto
- Verificar password no tiene caracteres especiales sin codificar

### Error: "Redis connection failed"
- Normal si no hay Redis plugin en Railway
- App funciona sin Redis (graceful degradation)
- Agregar Redis plugin si quieres caching

### Error: "CORS policy blocked"
- Verificar `CORS_ORIGINS` incluye frontend URL
- Verificar `FRONTEND_URL` correcto en .env
- Reiniciar backend en Railway

### Error: "New Relic not reporting"
- Verificar `NEW_RELIC_LICENSE_KEY` correcto
- Ver logs en Railway: "New Relic: Initialized"
- Puede tardar 5-10 min en aparecer data

### Error: "Emails no se envían"
- Verificar `BREVO_API_KEY` correcto
- Verificar sender email verificado en Brevo
- Ver logs de Brevo Dashboard → Logs

---

## 📈 Costos Estimados

### Año 1 (con Student Pack):
- MongoDB Atlas M0: **$0/mes**
- Railway: **$0/mes** ($5 en créditos)
- Vercel: **$0/mes**
- Cloudinary: **$0/mes**
- New Relic: **$0/mes** (Student Pack)
- Sentry: **$0/mes** (Student Pack)
- Brevo: **$0/mes**
- Domain: **$0** (Student Pack año 1)
- **TOTAL: $0/mes**

### Año 2+ (sin Student Pack):
- Domain: ~$15/año ($1.25/mes)
- MongoDB: $0/mes (M0 siempre gratis)
- Railway: $5/mes en créditos (probablemente suficiente)
- Vercel: $0/mes (siempre gratis)
- Cloudinary: $0/mes (siempre gratis)
- New Relic: $0/mes (tier gratuito 100GB/mes)
- Sentry: $0/mes (tier gratuito 5K errores/mes)
- Brevo: $0/mes (300 emails/día siempre gratis)
- **TOTAL: ~$1.25/mes** (solo dominio)

### Pagos Wompi:
- 2.79% + $400 COP por transacción
- Ejemplo: Cita de $150,000 COP = $4,585 comisión
- Paciente paga, no es costo tuyo

---

## ✅ Checklist Final

- [ ] MongoDB Atlas cluster creado y funcionando
- [ ] Railway backend deployed y accesible
- [ ] Vercel frontend deployed y accesible
- [ ] Dominio configurado (psiconepsis.app)
- [ ] SSL activo en ambos dominios
- [ ] Google OAuth configurado con URLs de producción
- [ ] Brevo email verificado y funcionando
- [ ] New Relic reportando métricas
- [ ] Sentry capturando errores
- [ ] Cloudinary configurado para imágenes
- [ ] Wompi webhooks configurados
- [ ] Tests pasando en CI/CD
- [ ] Monitoring y alerts configurados
- [ ] Backups automáticos activos

---

## 🎉 ¡Listo para Producción!

Tu aplicación Psiconepsis ahora está en producción con:
- ✅ 100% Gratuito (primer año con Student Pack)
- ✅ Escalable (Railway + Vercel)
- ✅ Monitoreado (New Relic + Sentry)
- ✅ Seguro (HTTPS, rate limiting, encryption)
- ✅ Compliant (Ley 1581, Resolución 2654)
- ✅ Automático (CI/CD con GitHub Actions)

**Próximos pasos:**
1. Registrar RNBD en Superintendencia
2. Registrar en Ministerio de Salud
3. Conseguir primeros usuarios beta
4. Iterar basándose en feedback

¡Éxito! 🚀🇨🇴
