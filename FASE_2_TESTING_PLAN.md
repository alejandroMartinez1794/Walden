# 🧪 FASE 2: TESTING - ESTADO Y PLAN DE ACCIÓN
## Psiconepsis - Colombia

**Fecha:** 25 de enero de 2026  
**Estado actual:** Suite de testing parcialmente implementada  

---

## 📊 RESUMEN EJECUTIVO

### Estado Actual de Tests

```
✅ Tests pasando:     257 / 327  (78.6%)
❌ Tests fallando:     18 / 327  (5.5%)
⏸️  Tests skipped:     52 / 327  (15.9%)
───────────────────────────────────────
📦 Test Suites:      11/17 passing
⏱️  Tiempo ejecución: 35.2 segundos
```

### Coverage Estimado: ~60-70%
**Meta: 80%+**

---

## ✅ LO QUE YA FUNCIONA

### Tests Unitarios (Schemas)
- ✅ `auth.schemas.test.js` - 100% passing (29/29 tests)
- ✅ `user.schemas.test.js` - 100% passing (21/21 tests)
- ✅ `doctor.schemas.test.js` - 100% passing (19/19 tests)
- ✅ `common.schemas.test.js` - 100% passing (29/29 tests)
- ✅ `psychology.schemas.test.js` - 100% passing (17/17 tests)
- ⚠️  `booking.schemas.test.js` - 1 test fallando
- ⚠️  `review.schemas.test.js` - 1 test fallando
- ⚠️  `health.schemas.test.js` - Mayoría skipped

### Tests de Integración
- ✅ `auth.test.js` - 100% passing (9/9 tests)
- ✅ `user.test.js` - 100% passing (6/6 tests)
- ✅ `doctor.test.js` - 100% passing (10/10 tests)
- ✅ `booking.test.js` - 100% passing (14/14 tests)
- ✅ `review.test.js` - 100% passing (13/13 tests)
- ⚠️  `security.test.js` - 3 tests fallando
- ⚠️  `security-password.test.js` - 7 tests fallando
- ⚠️  `security-logout.test.js` - 2 tests fallando
- ⚠️  `security-audit.test.js` - 4 tests fallando

---

## ❌ TESTS FALLIDOS Y CORRECCIONES

### Grupo 1: Mensajes de Error en Español (7 tests)

**Problema:** Los tests esperan mensajes en inglés, pero el backend responde en español.

```javascript
// ❌ Test espera:
expect(response.body.message).toContain('12 caracteres');

// ✅ Backend responde:
"Errores de validación" (genérico de Joi)
```

**Archivos afectados:**
- `tests/integration/security-password.test.js` (7 tests)

**Solución:**
1. Actualizar assertions a español:
```javascript
expect(response.body.message).toMatch(/12 caracteres|Errores de validación/i);
```

2. O mejor: extraer mensaje específico del array de errores:
```javascript
expect(response.body.errors[0].message).toContain('12 caracteres');
```

---

### Grupo 2: Audit Logs con Datos Incorrectos (4 tests)

**Problema:** userEmail se guarda como "unknown" en lugar del email real.

```javascript
// ❌ Test espera:
expect(auditLog.userEmail).toBe('audit@test.com');

// ✅ Audit log tiene:
auditLog.userEmail = 'unknown'
```

**Archivos afectados:**
- `tests/integration/security-audit.test.js` (4 tests)

**Causa raíz:**  
El middleware `auditLogger.js` no está recibiendo correctamente el email del usuario desde `req.user`.

**Solución:**
Verificar en `backend/middleware/auditLogger.js`:
```javascript
// Debe ser:
userEmail: req.user?.email || 'unknown',

// Y asegurar que verifyToken establece:
req.user = { id, email, role };
```

---

### Grupo 3: Token Blacklist Issues (2 tests)

**Problema:** Token blacklist no funciona correctamente con múltiples tokens del mismo usuario.

```javascript
// ❌ Test espera:
expect(token2Blacklisted).toBe(false);  // token2 debe seguir válido

// ✅ Recibe:
token2Blacklisted = true  // También fue blacklisted
```

**Archivos afectados:**
- `tests/integration/security-logout.test.js` (2 tests)

**Causa raíz:**  
`isTokenBlacklisted()` probablemente valida por `userId` en lugar de por `token` específico.

**Solución:**
En `backend/services/tokenBlacklist.js`:
```javascript
// Debe buscar por token EXACTO:
const blacklisted = await TokenBlacklist.findOne({ token });

// NO por userId:
// ❌ const blacklisted = await TokenBlacklist.findOne({ userId });
```

---

### Grupo 4: Validación de Schema Opcional (2 tests)

**Problema:** Campos opcionales están siendo tratados como requeridos.

```javascript
// ❌ Test espera:
const { error } = cancelBookingSchema.validate({});
expect(error).toBeDefined();  // Esperaba error

// ✅ Schema permite:
cancelBookingSchema = Joi.object({
  reason: Joi.string().min(10).max(500)  // Sin .required()
});
```

**Archivos afectados:**
- `tests/unit/booking.schemas.test.js` (1 test)
- `tests/unit/review.schemas.test.js` (1 test)

**Solución:**
En `backend/validators/*.js`:
```javascript
// Si debe ser requerido:
reason: Joi.string().min(10).max(500).required(),

// O actualizar test si es opcional:
test('debe permitir cancelación sin razón', () => {
  const { error } = cancelBookingSchema.validate({});
  expect(error).toBeUndefined();
});
```

---

### Grupo 5: Severity Levels Incorrectos (1 test)

**Problema:** Severidad de audit logs no coincide con expectativa.

```javascript
// ❌ Test espera:
expect(logs[0].severity).toBe('LOW');   // Primera acción

// ✅ Recibe:
logs[0].severity = 'HIGH'
```

**Archivos afectados:**
- `tests/integration/security-audit.test.js` (1 test)

**Solución:**
Verificar configuración de severidad en `auditLogger.js`:
```javascript
const severityMap = {
  'LOGIN': 'LOW',
  'LOGOUT': 'LOW',
  'UPDATE_PHI': 'HIGH',
  // ... etc
};
```

---

### Grupo 6: Validación de Mensajes en Inglés (2 tests)

**Problema:** Tests esperan regex en español pero mensaje está en inglés.

```javascript
// ❌ Test espera:
expect(deniedRes.body.message).toMatch(/revocado|invalido|expirado/i);

// ✅ Backend responde:
"Token has been revoked. Please login again."
```

**Solución:**
Internacionalizar mensajes o actualizar tests:
```javascript
expect(deniedRes.body.message).toMatch(/revoked|revocado|invalid|invalido/i);
```

---

## 📋 PLAN DE CORRECCIÓN

### Prioridad ALTA (Corrección inmediata)

**Tarea 1: Corregir Audit Logs (30 min)**
```bash
# Archivo: backend/middleware/auditLogger.js
- Verificar que req.user.email se captura correctamente
- Asegurar severity mapping correcto
```

**Tarea 2: Corregir Token Blacklist (45 min)**
```bash
# Archivo: backend/services/tokenBlacklist.js
- Cambiar búsqueda de userId a token específico
- Agregar test de múltiples tokens
```

**Tarea 3: Actualizar Mensajes de Tests (30 min)**
```bash
# Archivos: tests/integration/security-*.test.js
- Actualizar regex a español/inglés
- O extraer mensajes específicos de arrays
```

**Tarea 4: Corregir Schemas Opcionales (20 min)**
```bash
# Archivos: backend/validators/*.js
- Decidir si cancelReason es opcional u obligatorio
- Actualizar schema acorde
```

---

### Prioridad MEDIA (Habilitar skipped tests)

**52 tests están skipped - habilitar gradualmente:**

1. **Tests de health metrics** (8 tests skipped)
2. **Tests de booking edge cases** (5 tests skipped)
3. **Tests de user/doctor profile updates** (10 tests skipped)
4. **Tests adicionales de validación** (29 tests skipped)

**Estrategia:**
- Habilitar 10 tests por semana
- Asegurar que pasen antes de continuar
- Documentar razón de skip si aplica

---

### Prioridad BAJA (Mejoras futuras)

**Coverage adicional:**
- Controllers sin tests directos
- Edge cases de payment
- Calendar integration con mocks
- Error handling exhaustivo

---

## 🎯 OBJETIVOS INMEDIATOS (Esta Semana)

### Día 1-2: Corrección de Tests Fallidos
- [ ] Corregir audit logs (4 tests)
- [ ] Corregir token blacklist (2 tests)
- [ ] Actualizar mensajes (9 tests)
- [ ] Corregir schemas (2 tests)
- **Meta: 0 tests fallidos ✅**

### Día 3-4: Habilitar Tests Skipped
- [ ] Habilitar 10 tests de health metrics
- [ ] Habilitar 10 tests de validación adicional
- **Meta: 40 tests skipped (↓ desde 52)**

### Día 5: Coverage Report
- [ ] Generar reporte de coverage
- [ ] Identificar archivos sin cobertura
- [ ] Crear plan para alcanzar 80%

---

## 📊 MÉTRICAS DE ÉXITO

### Semana 1 (Corrección)
```
✅ 0 tests fallidos
⏸️  ≤ 40 tests skipped  
📈 Coverage: ~70%
```

### Semana 2 (Expansión)
```
✅ 0 tests fallidos
⏸️  ≤ 20 tests skipped
📈 Coverage: ~75%
```

### Semana 3 (Completar)
```
✅ 0 tests fallidos
⏸️  ≤ 10 tests skipped
📈 Coverage: 80%+
🎯 CI/CD configurado
```

---

## 🚀 SIGUIENTES PASOS (Después de Tests)

Una vez alcanzado 80%+ coverage y 0 tests fallidos:

### Fase 3: CI/CD
- GitHub Actions workflow
- Tests automáticos en cada PR
- Coverage reporting automático
- Deploy staging/production

### Fase 4: Monitoring
- Datadog / New Relic
- Error tracking (Sentry)
- Performance metrics
- Uptime monitoring

---

## 📝 COMANDOS ÚTILES

```bash
# Ejecutar todos los tests
npm test

# Ejecutar solo tests que fallan
npm test -- --onlyFailures

# Coverage report
npm run test:coverage

# Tests específicos
npm test -- auth.test.js

# Watch mode (desarrollo)
npm run test:watch

# Tests de integración solo
npm run test:integration

# Tests unitarios solo
npm run test:unit
```

---

**Estado:** ⏳ En Progreso - Corrección de Tests  
**Responsable:** Equipo de desarrollo  
**Próxima revisión:** Fin de semana 1  

---

*Ver `PRODUCTION_ROADMAP.md` para contexto completo del proyecto.*
