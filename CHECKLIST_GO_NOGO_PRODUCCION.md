# 🚀 Checklist GO / NO-GO para Producción (Nivel Manual)

Esta es tu guía exacta, paso a paso, para que los pipelines funcionen y la aplicación quede operativa. No se requiere escribir código adicional, solo inyectar valores en los paneles de control.

## Nivel 1: GitHub Secrets (CI/CD Automático)
Ve a tu repositorio en **GitHub > Settings > Secrets and variables > Actions** y añade:

### Requisitos Heroku (Backend)
- [ ] `HEROKU_API_KEY`: Tu token personal desde Cuenta de Heroku.
- [ ] `HEROKU_EMAIL`: Tu correo asociado a Heroku.
- [ ] `HEROKU_APP_NAME`: El nombre exacto de la app en Heroku.

### Requisitos Vercel (Frontend)
- [ ] `VERCEL_TOKEN`: Token generado en los ajustes de Vercel.
- [ ] `VERCEL_ORG_ID`: ID de tu organización en Vercel.
- [ ] `VERCEL_PROJECT_ID`: ID del proyecto que creaste en Vercel.

---

## Nivel 2: Variables de Entorno en Heroku (Backend - Settings > Config Vars)
Asegúrate de configurar lo siguiente directo en el panel de tu app en Heroku:

- [ ] `PORT`: Dejar vacío o asignar (Heroku lo reasigna automáticamente, pero es bueno saberlo).
- [ ] `MONGO_URL`: El string de acceso de MongoDB Atlas (¡Asegúrate de reemplazar `<password>`!).
- [ ] `JWT_SECRET_KEY`: Una cadena criptográfica fuerte (ej: un UUID o hash random).
- [ ] `CLIENT_SITE_URL`: La URL base de tu frontend en Vercel (Ej: `https://basileia-app.vercel.app`).
- [ ] `GOOGLE_CLIENT_ID`: Obtenido de Google Cloud Console.
- [ ] `GOOGLE_CLIENT_SECRET`: Obtenido de Google Cloud Console.
- [ ] `GOOGLE_REDIRECT_URI`: Exactamente `https://<tu-app-heroku>.herokuapp.com/api/v1/calendar/google/callback`.

---

## Nivel 3: Variables de Entorno en Vercel (Frontend - Settings > Environment Variables)
- [ ] `VITE_BACKEND_URL`: La URL base de tu backend en Heroku (Ej: `https://<tu-app-heroku>.herokuapp.com/api/v1`).
_Asegúrate de habilitarla en Vercel para Producción (Production)._

---

## Nivel 4: Configuración Externa (Seguridad)

### MongoDB Atlas
- [ ] **Acceso de Red:** Ve a _Network Access_ y asegúrate de permitir conexiones. Heroku no tiene IPs estáticas por defecto. Para arrancar, añade `0.0.0.0/0` (permitir cualquier origen) asumiendo que tu usuario/contraseña es seguro.

### Google Cloud Console (OAuth 2.0)
En tu cliente OAuth (Credenciales ID de cliente de OAuth 2.0):
- [ ] **Orígenes de JavaScript autorizados:** Añade la URL exacta de tu Vercel (Ej: `https://basileia-app.vercel.app`).
- [ ] **URI de redireccionamiento autorizados:** Añade la URL callback de Heroku configurada en el Paso 2 (Ej: `https://<tu-app-heroku>.herokuapp.com/api/v1/calendar/google/callback`).

---

## ✅ GO / Lanzamiento
1. Haz **push** de la rama `basileia` al remoto (o abre un Pull Request hacia `main` y haz Merge).
2. Los GitHub Actions detectarán el cambio automáticamente.
3. El frontend de Vercel y el backend de Heroku compilarán.
4. Si las URLs y los secretos fueron pegados sin comillas extra y exactamente como se indica, el sistema quedará operativo en vivo.