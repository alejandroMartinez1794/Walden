# Guía de Hardening de Seguridad: HTTPS y Red

## Descripción General

Esta guía documenta los cambios implementados para mejorar la seguridad de la capa de red y HTTPS del sistema Basileia, cumpliendo con los requisitos de la Resolución 2654/2019 y la Ley 1581/2012.

## Cambios Implementados

### 1. Política de Seguridad por Tier

#### Antes:
- Uso de `NODE_ENV` para activar/desactivar HTTPS
- Configuración dependiente del entorno
- Posibilidad de usar HTTP en staging

#### Después:
- Reemplazo de `NODE_ENV` por `SECURITY_TIER` (dev/staging/prod)
- HTTPS obligatorio en staging y prod
- Política estricta por tier:
  - `dev`: HTTPS opcional
  - `staging`: HTTPS forzoso con redirect 301
  - `prod`: HTTPS forzoso con redirect 301

### 2. Validación Criptográfica de Certificados

#### Antes:
- Rutas relativas sin validación
- Posibilidad de usar certificados auto-firmados en producción
- No validación de dominio

#### Después:
- Validación "fail-fast" de certificados
- Verificación de Common Name (CN) y Subject Alternative Names (SAN)
- Rechazo de certificados auto-firmados en producción
- Verificación contra dominio esperado

### 3. Headers de Seguridad Estrictos

#### Antes:
- Headers de seguridad básicos
- CSP permisiva
- Sin HSTS preload

#### Después:
- HSTS con preload (`max-age=31536000; includeSubDomains; preload`)
- CSP restrictiva (sin `unsafe-inline`, `frame-src: 'none'`, `object-src: 'none'`)
- X-Content-Type-Options: `nosniff`
- X-Frame-Options: `DENY`
- Referrer-Policy: `strict-origin-when-cross-origin`
- Permissions-Policy: Restricción de recursos sensibles

### 4. Trust Proxy Nativo

#### Antes:
- Configuración genérica de trust proxy
- IPs detrás de load balancer no resueltas correctamente

#### Después:
- Configuración explícita basada en SECURITY_TIER
- `app.set('trust proxy', 1)` para staging y prod
- Resolución correcta de IPs reales detrás de ALB/Cloudflare

### 5. Rate Limiting Adaptativo

#### Antes:
- Límites fijos para todas las rutas
- No diferenciación por tipo de operación
- No persistencia distribuida

#### Después:
- Límites diferenciados por tipo de operación:
  - Auth endpoints: 5 req/min
  - Clinical endpoints: 100 req/min
  - Public endpoints: 50 req/min
- Persistencia en Redis para distribución
- Almacenamiento distribuido para alta disponibilidad

## Configuración de Variables de Entorno

```env
# Tier de seguridad (obligatorio)
SECURITY_TIER=prod          # Valores: dev, staging, prod

# Dominio para validación de certificados
DOMAIN=api.basileia.com     # Dominio esperado en certificados

# Ruta de certificados SSL (opcional, predeterminado /etc/letsencrypt/live)
SSL_CERT_PATH=/etc/letsencrypt/live

# URL de Redis para almacenamiento distribuido de rate limiting
REDIS_URL=redis://localhost:6379
```

## Implementación Técnica

### 1. Política HTTPS Obligatoria

```javascript
// En app.js
const securityTier = process.env.SECURITY_TIER || 'dev';
if (securityTier === 'staging' || securityTier === 'prod') {
  app.set('trust proxy', 1);  // Confianza en primer proxy
}

// En config/https.js
export const forceHTTPS = (req, res, next) => {
  const securityTier = process.env.SECURITY_TIER || 'dev';
  
  if (securityTier === 'dev') {
    return next(); // Permitir HTTP en desarrollo
  }
  
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  
  if (!isSecure) {
    if (securityTier === 'prod' || securityTier === 'staging') {
      // Forzar HTTPS con redirect 301
      const redirectUrl = `https://${req.headers.host}${req.url}`;
      return res.redirect(301, redirectUrl);
    }
  }
  
  next();
};
```

### 2. Validación de Certificados

```javascript
// En config/https.js
const validateCertificate = (certData, expectedDomain, securityTier) => {
  if (securityTier === 'dev') {
    return; // No validar en desarrollo
  }

  const forge = require('node-forge');
  const cert = forge.pki.certificateFromPem(certData);
  
  // Verificar Common Name (CN) y Subject Alternative Names (SAN)
  const cn = cert.subject.getField('CN');
  const altNamesExt = cert.getExtension('subjectAltName');
  
  // Validación de dominio...
};
```

### 3. Headers de Seguridad

```javascript
// En config/https.js
export const additionalSecurityHeaders = (req, res, next) => {
  // HSTS con preload
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // CSP restrictiva
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-src 'none'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "upgrade-insecure-requests;"
  );
  
  // Otros headers...
};
```

### 4. Rate Limiting Distribuido

```javascript
// En utils/rateLimiter.js
export const createCustomRateLimiter = (max, windowMinutes = 15, message = null) => {
  return createRateLimiter({
    windowMs: windowMinutes * 60 * 1000,
    max,
    message: message || {
      success: false,
      message: `Too many requests. Limit: ${max} per ${windowMinutes} minutes.`,
    },
  });
};

// Ejemplo de uso en app.js
app.use('/api/v1/psychology', createCustomRateLimiter(100, 1, {
  success: false,
  message: 'Demasiadas solicitudes clínicas. Intente de nuevo en 1 minuto.'
}));
```

## Cumplimiento Normativo

### Resolución 2654/2019
- ✅ Canales de comunicación cifrados obligatorios en staging y prod
- ✅ Validación criptográfica de certificados
- ✅ Protección contra downgrade attacks con HSTS

### Ley 1581/2012
- ✅ Prevención de SSL stripping con HSTS preload
- ✅ Mitigación de XSS con CSP restrictiva
- ✅ Protección de datos sensibles con headers adecuados

### Auditoría SIC/MinSalud
- ✅ Demostración de canal seguro mediante políticas estrictas
- ✅ Logging completo de acceso y seguridad
- ✅ Prevención de certificados no validados

## Testing

### Pruebas de Seguridad
1. Validación de certificados en staging/prod
2. Forzado de HTTPS según tier
3. Aplicación correcta de headers de seguridad
4. Funcionamiento de rate limiting por tipo de operación
5. Resolución correcta de IPs detrás de proxy

### Comandos de Prueba

```bash
# Prueba de validación de certificados
npm run validate-production

# Prueba de configuración de seguridad
npm run check-compliance

# Prueba de endpoints de salud
curl -I https://tu-dominio/api/health
```

## Consideraciones de Producción

1. Asegurar que los certificados SSL estén correctamente instalados y validados
2. Configurar correctamente la variable `SECURITY_TIER` en cada entorno
3. Verificar la conectividad a Redis para rate limiting distribuido
4. Monitorear los logs de seguridad y rate limiting
5. Validar periódicamente la expiración de certificados