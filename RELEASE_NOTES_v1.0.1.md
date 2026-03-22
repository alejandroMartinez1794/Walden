# Release v1.0.1 - Hardening & Security

Fecha: 2026-03-17

## Estado General
- Pipeline de CI/CD corregido y estable para la rama `basileia`.
- Pruebas automatizadas (Backend Tests) funcionando en paralelo de forma estable.
- Implementación de monitoreo, seguridad avanzada y cumplimiento legal completada.

## Cambios Destacados
- **Seguridad (Shields Up):**
  - Implementación de Content Security Policy (CSP) súper estricto usando `helmet`.
  - Configuración de **Rate Limiting** mediante `express-rate-limit` protegiendo de fuerza bruta las rutas sensibles de autenticación y transacciones (`/api/v1/auth`, `/api/v1/bookings`, APIs externas).
  - Rotación y verificación de secretos de producción en Heroku (JWT_SECRET_KEY, URLs permitidas).
- **Observabilidad:**
  - Integración de **Datadog APM** (`dd-trace`) inicializado en el tope del ciclo de vida del proceso de Express (`backend/datadog.js`). Enrutamiento de métricas y perfiles en vivo para monitoreo de APIs.
- **Cumplimiento Legal (Compliance):**
  - Implementación de checkbox obligatorio de Términos y Condiciones, Política de Privacidad y Tratamiento de Datos al completar el agendamiento (Checkout).
  - Versionado del frontend (estampa dinámica visual `v1.0.1 🛡️ Hardened Build`).
- **Resiliencia (Test Suite):**
  - Corrección de bugs críticos de interferencia en tests de Jest por causa de Rate Limiters (`auth.test.js` ya no rompe el flujo por errores de HTTP 429 concurrentes).

## Nuevo Documento:
- `RUNBOOK_INCIDENTES.md` añadido: Procedimiento documentado para atención rápida ante caída de servicios, fuga de información e incidentes de seguridad (Tier 1 a Tier 3).

## Resultado Operativo
- El PR principal `#1` hacia `main` ahora avanza en limpio en GitHub Actions y puede fusionarse.
- Las integraciones a Heroku y Vercel se encuentran protegidas por capas avanzadas de telemetría (Sentry + Datadog) y protección anti-DDoS.
