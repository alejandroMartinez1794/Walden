# 🚀 DEPLOYMENT CHECKLIST - Psiconepsis

**Objetivo**: Desplegar backend + frontend en 45 minutos

---

## ✅ PASO 1: Keys de Seguridad (DONE ✓)

```bash
JWT_SECRET_KEY=n6Xz2NfbgcoQjwoaQR+MxQPPFj8pK74raJq3wW/l7hE=
ENCRYPTION_KEY=481518553459d658d1166403fcb8afa208b9dedf572ff617ca305749af0ca1c9
CSRF_SECRET=3478c228c1c445b5f23c17ab6c9616d4c257a95daf5126db585ccf2cd47396da
```

**→ Ya copiadas en `backend/.env.production`**

---

## ⏳ PASO 2: MongoDB Atlas (5 min) - HAZLO AHORA

**Link directo**: https://www.mongodb.com/cloud/atlas/register

1. **Sign up**: Click "Sign in with Google" (usa tu cuenta de GitHub email)
2. **Create Organization**: Nombre: "Psiconepsis"
3. **Create Project**: Nombre: "Psiconepsis Production"
4. **Create Database**:
   - Click "Build a Database"
   - Choose: **M0 FREE** (512MB)
   - Provider: AWS
   - Region: **São Paulo (sa-east-1)** ← Más cerca de Colombia
   - Cluster Name: `psiconepsis-prod`
   - Click "Create"

5. **Security Setup**:
   - **Database Access** (menú izquierdo):
     - Add New Database User
     - Authentication: Password
     - Username: `psiconepsis_admin`
     - Password: Click "Autogenerate Secure Password" → **COPIA Y GUARDA**
     - Database User Privileges: "Atlas admin"
     - Click "Add User"
   
   - **Network Access** (menú izquierdo):
     - Add IP Address
     - Click "Allow Access from Anywhere" (0.0.0.0/0)
     - Click "Confirm"

6. **Get Connection String**:
   - Click "Connect" en tu cluster
   - "Connect your application"
   - Copy connection string:
     ```
     mongodb+srv://psiconepsis_admin:<password>@psiconepsis-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - **REEMPLAZA** `<password>` con tu password real (sin < >)
   - **AÑADE** `/psiconepsis` antes del `?`:
     ```
     mongodb+srv://psiconepsis_admin:PASSWORD@psiconepsis-prod.xxxxx.mongodb.net/psiconepsis?retryWrites=true&w=majority
     ```

**→ Copia esto en `MONGO_URL` en `.env.production`**

---

## ⏳ PASO 3: Google OAuth (5 min) - HAZLO AHORA

**Link directo**: https://console.cloud.google.com/projectcreate

1. **Create Project**:
   - Project name: `Psiconepsis`
   - Click "CREATE"

2. **OAuth Consent Screen**:
   - Click hamburger menu → "APIs & Services" → "OAuth consent screen"
   - User Type: **External**
   - Click "CREATE"
   - App information:
     - App name: `Psiconepsis`
     - User support email: Tu email
     - Developer contact: Tu email
   - Click "SAVE AND CONTINUE" (skip scopes, test users)

3. **Create Credentials**:
   - "Credentials" (menú izquierdo)
   - "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `Psiconepsis Backend`
   - Authorized redirect URIs:
     - Click "+ ADD URI"
     - `https://psiconepsis-api.herokuapp.com/api/v1/calendar/google-callback`
   - Click "CREATE"
   - **COPIA**:
     - Client ID: `xxxxx.apps.googleusercontent.com`
     - Client secret: `xxxxx`

**→ Copia en `.env.production`:**
```bash
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
```

4. **Enable Google Calendar API**:
   - "Enabled APIs & services" (menú izquierdo)
   - "+ ENABLE APIS AND SERVICES"
   - Buscar: "Google Calendar API"
   - Click en el resultado → "ENABLE"

---

## ⏳ PASO 4: Brevo Email (3 min) - HAZLO AHORA

**Link directo**: https://app.brevo.com/account/register

1. **Sign Up**:
   - Email: Tu email
   - Password: Crear contraseña
   - Click "Sign up for free"
   - **Verifica tu email** (check inbox)

2. **Get API Key**:
   - Login → Click tu nombre (arriba derecha) → "SMTP & API"
   - Tab "API Keys"
   - "Generate a new API key"
   - Name: `Psiconepsis Production`
   - Click "Generate"
   - **COPIA el key** (empieza con `xkeysib-`)

**→ Copia en `.env.production`:**
```bash
BREVO_API_KEY=xkeysib-tu_api_key_aqui
```

3. **Add Sender** (para evitar spam):
   - "Senders" (menú izquierdo)
   - "Add a Sender"
   - Email: `noreply@psiconepsis.com` (o tu dominio real después)
   - From name: `Psiconepsis`
   - Click "Save"

---

## ⏳ PASO 5: Wompi Payments (5 min) - HAZLO AHORA

**Link directo**: https://comercios.wompi.co/signup

1. **Sign Up**:
   - Email empresarial
   - Teléfono colombiano
   - Completar registro

2. **Get TEST Keys** (para empezar):
   - Dashboard → "Developers" → "API Keys"
   - Copiar:
     - Public Key (Test): `pub_test_xxxxx`
     - Private Key (Test): `prv_test_xxxxx`
     - Event Secret: `xxxxx`
     - Integrity Secret: `xxxxx`

**→ Copia en `.env.production`:**
```bash
WOMPI_PUBLIC_KEY=pub_test_tu_key
WOMPI_PRIVATE_KEY=prv_test_tu_key
WOMPI_EVENT_SECRET=tu_event_secret
WOMPI_INTEGRITY_SECRET=tu_integrity_secret
```

**Nota**: Para producción necesitas verificar RUT/NIT y cambiar a `pub_prod_` y `prv_prod_`

---

## ⏳ PASO 6: GitHub Student Pack (5 min) - HAZLO AHORA

**Link directo**: https://education.github.com/pack

1. Click "Get student benefits"
2. Subir foto de carnet estudiantil o documento
3. **Esperar aprobación** (1-3 días)

**Mientras esperas**: Puedes desplegar sin New Relic/Sentry (los añadimos después)

---

## ⏳ PASO 7: New Relic (DESPUÉS de Student Pack)

**Link directo**: https://newrelic.com/students

1. Connect with GitHub (debe detectar Student Pack)
2. Create account
3. Get started → Copy License Key
4. Copiar en `.env.production`: `NEW_RELIC_LICENSE_KEY=tu_key`

---

## ⏳ PASO 8: Sentry (DESPUÉS de Student Pack)

**Link directo**: https://sentry.io/signup/

1. Sign in with GitHub
2. Create Organization → Nombre: "Psiconepsis"
3. Create Project → Platform: "Node.js" → Alert frequency: "Alert on every issue"
4. Copy DSN: `https://xxxxx@oxxxxx.ingest.sentry.io/xxxxx`
5. Copiar en `.env.production`: `SENTRY_DSN=tu_dsn`

---

## 🚀 PASO 9: Deploy a Heroku (10 min)

### A. Instalar Heroku CLI

```powershell
# PowerShell
winget install Heroku.HerokuCLI
# O descargar: https://devcenter.heroku.com/articles/heroku-cli
```

### B. Login y crear app

```bash
cd backend

# Login
heroku login

# Crear app
heroku create psiconepsis-api
```

### C. Configurar variables de entorno

**Opción 1 - Plugin (MÁS RÁPIDO)**:
```bash
# Instalar plugin
heroku plugins:install heroku-config

# Subir todas las vars desde .env.production
heroku config:push --file .env.production --app psiconepsis-api
```

**Opción 2 - Manual** (si plugin falla):
```bash
heroku config:set MONGO_URL="mongodb+srv://..." --app psiconepsis-api
heroku config:set JWT_SECRET_KEY="n6Xz2NfbgcoQjwoaQR+..." --app psiconepsis-api
# ... etc para cada variable
```

### D. Añadir Redis addon

```bash
heroku addons:create heroku-redis:hobby-dev --app psiconepsis-api
```

### E. Deploy

```bash
# Desde la raíz del proyecto
git push heroku Cambios:main
```

### F. Verificar

```bash
heroku logs --tail --app psiconepsis-api
heroku open --app psiconepsis-api
```

**Test health endpoint**:
```bash
curl https://psiconepsis-api.herokuapp.com/health
```

---

## 🎨 PASO 10: Deploy Frontend a Vercel (5 min)

### A. Instalar Vercel CLI

```powershell
npm install -g vercel
```

### B. Deploy

```bash
cd Frontend

# Login
vercel login

# Deploy (primera vez)
vercel

# Responder:
# Set up and deploy? Y
# Which scope? Tu cuenta
# Link to existing project? N
# Project name? psiconepsis
# In which directory is your code located? ./
# Want to override settings? N

# Deploy a producción
vercel --prod
```

### C. Configurar variables

```bash
# Añadir variable de entorno
vercel env add VITE_BASE_URL production
# Cuando pregunte el valor: https://psiconepsis-api.herokuapp.com
```

### D. Redeploy con nueva variable

```bash
vercel --prod
```

---

## 🌐 PASO 11: Dominio (OPCIONAL - después de Student Pack)

**Con Name.com Student Pack** (gratis 1 año):

1. https://www.name.com/partner/github-students
2. Buscar dominio: `psiconepsis.app` o `psiconepsis.dev`
3. Checkout (usa Student Pack, $0)
4. Configurar DNS:
   - Frontend (Vercel): Settings → Domains → Add `psiconepsis.app`
   - Backend (Heroku): Settings → Domains → Add `api.psiconepsis.app`

---

## ✅ VALIDACIÓN FINAL

```bash
cd backend
npm run validate-production
```

Debe decir: **"🎉 Production environment is ready for deployment!"**

---

## 📊 TIMELINE

| Paso | Tiempo | Status |
|------|--------|--------|
| 1. Keys generadas | ✅ Done | - |
| 2. MongoDB Atlas | 5 min | ⏳ Pendiente |
| 3. Google OAuth | 5 min | ⏳ Pendiente |
| 4. Brevo Email | 3 min | ⏳ Pendiente |
| 5. Wompi Payments | 5 min | ⏳ Pendiente |
| 6. Student Pack | 5 min | ⏳ Pendiente |
| 7-8. New Relic/Sentry | Esperar | ⏰ Después |
| 9. Deploy Heroku | 10 min | ⏳ Pendiente |
| 10. Deploy Vercel | 5 min | ⏳ Pendiente |
| **TOTAL** | **38 min** | - |

---

## 🆘 TROUBLESHOOTING

### MongoDB connection fails
```bash
# Verificar que IP 0.0.0.0/0 está permitida
# Verificar password sin caracteres especiales
# Verificar que añadiste /psiconepsis en la URL
```

### Heroku deploy fails
```bash
heroku logs --tail --app psiconepsis-api
# Revisar errores de Node.js/npm
```

### Vercel build fails
```bash
# Verificar que VITE_BASE_URL apunta a Heroku
# Verificar que npm run build funciona localmente
cd Frontend && npm run build
```

---

## 🎯 PRÓXIMOS PASOS (después de desplegar)

1. **Esperar Student Pack** (1-3 días)
2. **Activar New Relic + Sentry**
3. **Obtener dominio .app gratis**
4. **Verificar Wompi producción** (necesita RUT/NIT)
5. **Configurar Cloudinary** (para imágenes)
6. **Configurar hCaptcha** (anti-bots)

---

**¡Vamos con todo! 🚀**
