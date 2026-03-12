# Basileia (Βασιλειάς)

Plataforma full-stack de gestión de citas médicas con **flujos de trabajo automatizados**.

## ✨ Características Principales

- 📅 Sistema de reservas con integración Google Calendar
- 🤖 **Automatización nativa** (recordatorios, alertas, seguimientos)
- 🔐 Autenticación JWT con roles (paciente/doctor/admin)
- 🧠 Sistema de psicología con métricas de salud mental
- 🚨 Detección automática de riesgos clínicos
- 📧 Notificaciones por email automáticas

## 🤖 Sistema de Automatización

Este proyecto incluye un **sistema de automatización integrado** que elimina la necesidad de N8N:

✅ Recordatorios de citas (24h y 1h antes)  
✅ Alertas médicas críticas (monitoreo cada 30 min)  
✅ Seguimiento post-sesión (cuestionarios y métricas)  
✅ Detección automática de patrones de riesgo  

**Ver documentación completa:** [backend/services/README.md](backend/services/README.md)  
**Configuración rápida:** [backend/services/QUICK_START.md](backend/services/QUICK_START.md)

## Quick start - Backend

1. Ir al directorio `backend` e instalar dependencias:

```powershell
cd backend
npm install
```

2. Copiar el ejemplo de entorno y rellenar variables:

```powershell
cd backend
copy .env.example .env
# (PowerShell) Copy-Item .env.example .env
```

3. Ejecutar en modo desarrollo (nodemon):

```powershell
npm run start-dev
```

## Quick start - Frontend

1. Ir al directorio `Frontend` e instalar dependencias:

```powershell
cd Frontend
npm install
```

2. Copiar el ejemplo de entorno y editar `VITE_BACKEND_URL` si es necesario:

```powershell
cd Frontend
copy .env.example .env
# o Copy-Item .env.example .env
```

3. Ejecutar Vite dev server:

```powershell
npm run dev
```

---

Si necesitas ayuda con las credenciales de Google Calendar o la conexión a MongoDB, dime y te guío para configurarlas.
