# Release v1.0.0

Fecha: 2026-03-16

## Estado General
- Produccion estable con deploy automatico operativo.
- Pipelines principales en verde en main (Tests y Deploy a Produccion).
- Integracion con Vercel y Heroku estabilizada para CI/CD.

## Cambios Destacados
- Estandarizacion de variables de entorno:
  - VITE_BACKEND_URL
  - JWT_SECRET_KEY
- Unificacion de ruta OAuth de Google Calendar:
  - /api/v1/calendar/google/callback
- Correccion de workflows de GitHub Actions:
  - Eliminacion de condiciones invalidas con secrets.
  - Deploy backend a Heroku via git push autenticado.
  - Deploy staging en modo seguro cuando faltan secretos.
  - Security Scan sin fallos de sintaxis cuando falta SNYK_TOKEN.
- Actualizacion de acciones a versiones nuevas para reducir warnings del runner.

## Resultado Operativo
- Backend desplegado en Heroku: https://basileia-api.herokuapp.com
- Frontend desplegado en Vercel (proyecto basileia-app)
- Flujo de despliegue continuo funcionando tras push a main.

## Notas
- Los runs rojos antiguos de Actions permanecen como historial visual.
- El estado valido para operacion es el ultimo run por workflow en main.
