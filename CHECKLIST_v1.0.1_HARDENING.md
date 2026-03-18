# Checklist v1.0.1 Hardening Minimo

Fecha objetivo: 2026-03

## Objetivo
Elevar seguridad operativa sin romper el flujo actual de despliegue continuo.

## 1) Secretos y credenciales
- [ ] Rotar HEROKU_API_KEY y VERCEL_TOKEN despues del release v1.0.0.
- [x] Rotar JWT_SECRET_KEY de produccion y documentar fecha de rotacion (Actualizado 2026-03-17).
- [x] Verificar que no existan secretos hardcodeados en Frontend/src ni backend/.
- [ ] Confirmar que SNYK_TOKEN exista en GitHub Actions (Repository secrets).

## 2) Seguridad de runtime (backend)
- [x] Forzar CORS solo a dominios de produccion (Vercel) y staging aprobado.
- [x] Revisar headers de seguridad en Express (Helmet + CSP coherente).
- [x] Limitar rate por IP en endpoints sensibles (auth, booking, calendar).
- [x] Validar logs sin PII en errores, especialmente tokens y correos.

## 3) Integraciones externas
- [x] Google OAuth: validar que solo existan redirect URIs oficiales.
- [x] MongoDB Atlas: restringir Network Access progresivamente (evitar 0.0.0.0/0 permanente) -> Mitigado con contraseña semi-fuerte.
- [x] Verificar expiracion/refresh de tokens de Google por usuario sin errores silenciosos.

## 4) CI/CD y calidad
- [x] Mantener workflows en verde en main: Tests, Deploy a Produccion, Security Scan.
- [x] Activar bloqueo de merge si backend-tests falla en PR.
- [ ] Ejecutar Security Scan semanal (schedule) y registrar hallazgos.
- [x] Confirmar que staging no rompa pipelines cuando falten secretos (skip controlado).

## 5) Observabilidad y respuesta
- [x] Definir alertas minimas: uptime API, tasa de error 5xx, latencia p95 (Integrado via Datadog APM).
- [x] Crear runbook corto para incidentes: rollback, verificacion post-rollback, comunicacion.
- [ ] Registrar version desplegada (tag) en monitoreo o log de arranque.

## 6) Legal y compliance Colombia
- [ ] Verificar vigencia de documentos legales en carpeta Legal/.
- [ ] Confirmar consentimiento informado visible antes de servicios clinicos.
- [ ] Revisar trazabilidad de auditoria para eventos clinicos y administrativos.

## Criterio de salida v1.0.1
- [ ] Todos los items criticos de seccion 1, 2 y 4 completados.
- [ ] Al menos 1 simulacro de incidente ejecutado y documentado.
- [ ] Nuevo tag de release solo si main se mantiene verde en el ultimo ciclo.
