# 🔒 Security & Secrets Management Checklist

## ✅ Completado

- [x] Sistema de secrets management con múltiples backends
- [x] Validación de secretos requeridos al inicio
- [x] Documentación completa de setup (SECRETS_MANAGEMENT.md)
- [x] Generación de ENCRYPTION_KEY para datos clínicos
- [x] Script de rotación de claves de encriptación
- [x] Caching de secretos (TTL 5 minutos)
- [x] Fallback automático a .env en caso de falla
- [x] Logging estructurado con winston

## 📋 Pendiente para Producción

### Crítico (Bloquea deployment)

- [ ] **Configurar secrets backend de producción**
  - Opción recomendada: AWS Secrets Manager
  - Instalar: `npm install @aws-sdk/client-secrets-manager`
  - Crear secreto en AWS Console
  - Configurar IAM role con permisos

- [ ] **HTTPS/TLS**
  - Obtener certificado SSL (Let's Encrypt gratuito)
  - Configurar reverse proxy (Nginx/Caddy)
  - Forzar HTTPS en producción
  - Habilitar HSTS headers (ya parcial en Helmet)

- [ ] **BAA Agreements (HIPAA)**
  - MongoDB Atlas: Plan M10+ incluye BAA
  - Google Cloud (Calendar/OAuth): Firmar BAA
  - Email provider: Usar servicio con BAA (SendGrid Enterprise)
  - Hosting provider: Verificar compliance HIPAA

- [ ] **Session timeout automático**
  - Implementar auto-logout después de 15 min inactividad
  - Middleware para tracking de última actividad
  - Invalidar tokens después de timeout

### Alta Prioridad

- [ ] **Key rotation automática**
  - Implementar cronjob para rotación trimestral
  - Script: `backend/scripts/rotateEncryptionKey.js` (ya creado)
  - Tracking de última rotación en base de datos
  - Alertas cuando exceda 90 días

- [ ] **Secrets rotation policy**
  - JWT_SECRET_KEY: Cada 90 días
  - ENCRYPTION_KEY: Cada 90 días
  - EMAIL_PASSWORD: Cada 180 días
  - GOOGLE_CLIENT_SECRET: Anual

- [ ] **Have I Been Pwned integration**
  - Validar contraseñas contra breaches conocidos
  - API: https://haveibeenpwned.com/API/v3
  - Bloquear contraseñas comprometidas en registro
  - Alertar usuarios con contraseñas comprometidas

- [ ] **MFA obligatorio para doctores**
  - Forzar 2FA en primer login de doctores
  - No permitir desactivar 2FA para role=doctor
  - Alertas si doctor intenta desactivar 2FA

- [ ] **Refresh tokens**
  - Implementar refresh tokens de larga duración
  - Access tokens de corta duración (15 min)
  - Endpoint /refresh para renovar access token
  - Invalidar refresh tokens en logout

### Media Prioridad

- [ ] **Rate limiting granular**
  - Rate limiting por endpoint y por rol
  - Más restrictivo para endpoints sensibles
  - Whitelist para IPs confiables

- [ ] **IP whitelisting para admin**
  - Restringir acceso a panel admin por IP
  - Configurar en middleware o firewall
  - Alertas de intentos desde IPs no autorizadas

- [ ] **Audit logging de acceso a secretos**
  - Log cada vez que se accede a un secreto
  - Incluir: timestamp, usuario, secreto, resultado
  - Almacenar en CloudTrail/Azure Monitor

- [ ] **Data retention policy**
  - Definir tiempo de retención (7 años típico para HIPAA)
  - Implementar auto-delete después de período
  - Procedimiento de exportación para pacientes

- [ ] **Breach notification system**
  - Detectar accesos no autorizados automáticamente
  - Notificar dentro de 60 días (requisito HIPAA)
  - Sistema de alertas administrativas
  - Procedimiento documentado de respuesta

## 🧪 Testing

- [ ] Tests unitarios de secrets manager
  - Test cada backend (local, AWS, Vault)
  - Test fallback a .env
  - Test caching y TTL
  - Test validación de secretos

- [ ] Tests de rotación de claves
  - Test re-encriptación de datos
  - Test rollback en caso de fallo
  - Test con múltiples documentos

- [ ] Penetration testing
  - Contratar auditor de seguridad externo
  - Verificar compliance HIPAA
  - Test de vulnerabilidades comunes (OWASP Top 10)

## 📊 Monitoring

- [ ] Dashboard de secrets
  - Endpoint /api/v1/admin/secrets/stats
  - Mostrar: backend usado, cache size, última rotación
  - Alertas cuando secretos necesitan rotación

- [ ] CloudWatch/Azure Monitor integration
  - Logs de acceso a secretos
  - Métricas de errores de desencriptación
  - Alertas de intentos de acceso fallidos

## 📚 Documentación

- [x] SECRETS_MANAGEMENT.md - Setup completo
- [ ] Runbook de rotación de claves
- [ ] Procedimiento de recovery ante compromiso
- [ ] Documentación de compliance HIPAA

## 🚀 Deployment

- [ ] CI/CD secrets injection
  - GitHub Actions secrets
  - AWS Parameter Store
  - Nunca hardcodear secretos en código

- [ ] Environment separation
  - Secretos separados por ambiente (dev/staging/prod)
  - Prefijos: `psiconepsis/dev`, `psiconepsis/prod`
  - Diferentes IAM roles por ambiente

## ⚠️ Warnings

**NO hacer:**
- ❌ Commitear .env.local (ya en .gitignore)
- ❌ Compartir secretos por Slack/email
- ❌ Usar mismo secreto en dev y prod
- ❌ Hardcodear secretos en código
- ❌ Loggear valores de secretos
- ❌ Exponer secretos en responses HTTP

**SÍ hacer:**
- ✅ Usar secrets manager en producción
- ✅ Rotar secretos cada 90 días
- ✅ Usar encryption at rest (AWS KMS)
- ✅ Habilitar audit logging
- ✅ Separar secretos por ambiente
- ✅ Usar IAM roles (no access keys)

---

**Última actualización:** 24 de enero, 2026  
**Próxima revisión:** Implementar HTTPS y BAA agreements
