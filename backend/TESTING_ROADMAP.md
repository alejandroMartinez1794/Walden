# Testing Roadmap - 52 Tests Skipped

## 📊 Estado Actual
- ✅ **182 tests passing** (77.8%)
- ⏭️ **52 tests skipped** (22.2%)  
- ❌ **0 tests failing**

## 🎯 Objetivo
Activar los 52 tests skipped y mantener 100% passing (o documentar por qué permanecen skipped)

---

## 📁 Desglose por Archivo

### ✅ common.schemas.test.js
- **Status**: 31/31 passing (100%) ✅
- **Action**: Ninguna

### 📝 auth.schemas.test.js - 3 skipped
1. ❌ `debe requerir specialization para doctores` - Schema NO requiere specialization
2. ❌ `debe eliminar campos no permitidos (stripUnknown)` - Schema no usa stripUnknown
3. ❌ `debe rechazar token muy corto` - Schema no valida longitud mínima de token

**Decision**: Mantener skipped - funcionalidades no implementadas

---

### 📅 booking.schemas.test.js - 7 skipped  
1. ⚠️ `debe aceptar cita válida` - Validación de horario requiere contexto
2. ⚠️ `debe rechazar cita antes de 8am` - Validación custom con contexto Joi
3. ⚠️ `debe rechazar cita después de 8pm` - Validación custom con contexto Joi
4. ⚠️ `debe rechazar citas en fin de semana` - Validación custom con contexto Joi
5. ⚠️ `debe rechazar duración muy corta (< 30min)` - Schema permite desde 30min
6. ❌ `debe rechazar status inválido` - Test correcto, revisar valores permitidos
7. ❌ `debe rechazar comentario muy largo` - Schema permite hasta 1000, test espera rechazo

**Priority**: MEDIUM - Requieren implementación de contexto o ajuste de tests

---

### 👨‍⚕️ doctor.schemas.test.js - 10 skipped
1. ✅ `debe aceptar actualización completa de perfil` - Puede activarse
2. ❌ `debe rechazar nombre muy corto` - Schema NO valida mínimo de nombre
3. ❌ `debe rechazar especialización inválida` - Schema NO valida lista de especializaciones
4. ❌ `debe rechazar experiencia sin campos requeridos` - Campo experiences NO existe
5. ❌ `debe rechazar endDate < startDate` - Campo experiences NO existe
6. ❌ `debe aceptar experiencia sin endDate` - Campo experiences NO existe
7. ✅ `debe aceptar foto con URL válida` - Puede activarse (urlSchema ya valida)
8. ✅ `debe aceptar filtro por isApproved` - Verificar si campo existe en query schema
9. ✅ `debe aceptar ordenamiento válido` - Verificar sortBy/sortOrder

**Priority**: HIGH - 4 tests pueden activarse fácilmente

---

### 🧑 user.schemas.test.js - 8 skipped
1. ✅ `debe aceptar actualización completa de perfil` - Puede activarse
2. ❌ `debe rechazar nombre muy corto` - Schema requiere mín 2, test puede ajustarse
3. ❌ `debe prohibir cambio de role` - Validación en middleware, no schema
4. ✅ `debe aceptar búsqueda por email` - Verificar si campo existe
5. ✅ `debe aceptar filtro por género` - Verificar si campo existe
6. ❌ `debe aceptar filtro por tipo de sangre` - Campo bloodType NO en query schema
7. ❌ `debe rechazar tipo de sangre inválido` - Campo bloodType NO en query schema
8. ✅ `debe aceptar ordenamiento válido` - Verificar sortBy/sortOrder

**Priority**: HIGH - 4-5 tests pueden activarse

---

### ⭐ review.schemas.test.js - 6 skipped
1. ❌ `debe aceptar reseña sin texto (solo rating)` - reviewText es OBLIGATORIO
2. ❌ `debe rechazar texto muy largo (> 500 caracteres)` - Schema permite 1000
3. ❌ `debe aceptar filtro por doctor` - doctorId va en ruta, no query
4. ❌ `debe aceptar filtro por usuario` - Schema NO tiene userId en query
5. ❌ `debe aceptar filtro por rating máximo` - Schema solo tiene minRating
6. ❌ `debe rechazar maxRating < minRating` - maxRating NO existe

**Priority**: LOW - Mayoría son funcionalidades no implementadas intencionalmente

---

### ❤️ health.schemas.test.js - 13 skipped
**Problema**: Tests usan estructura incorrecta `{type, value, unit}` pero schema espera `{bloodPressure, heartRate, temperature, weight}`

1-12. ⚠️ **TODOS** - Requieren reescritura completa con estructura correcta
13. ⚠️ Filtros y ordenamiento - Verificar implementación

**Priority**: LOW - Requiere trabajo significativo de restructuración

---

### 🧠 psychology.schemas.test.js - 5 skipped
1. ❌ `debe usar nivel de riesgo por defecto "low"` - Verificar default en schema
2. ❌ `debe rechazar userId inválido` - Campo es "name", no "userId"
3. ❌ `debe rechazar referringDoctor inválido` - Verificar si existe validación
4. ❌ `debe rechazar duración muy corta (< 30 min)` - Schema permite desde 15min
5. ❌ `debe rechazar diagnosis muy corto` - diagnosis NO tiene mínimo

**Priority**: MEDIUM - Algunos pueden activarse con ajustes

---

### 🏥 clinical.schemas.test.js - 1 skipped
1. ⚠️ `placeholder` - Suite completa está comentada, necesita análisis profundo

**Priority**: LOW - Suite entera requiere rediseño

---

## 🚀 Plan de Acción

### Fase 1: Quick Wins (Activar ~15 tests)
- [ ] doctor: actualización completa, foto válida, filtro isApproved, ordenamiento
- [ ] user: actualización completa, búsqueda email, filtro género, ordenamiento
- [ ] Ejecutar tests y verificar

### Fase 2: Ajustes de Schema (0-5 tests)
- [ ] Analizar si vale la pena añadir validaciones faltantes
- [ ] O documentar por qué NO se implementan

### Fase 3: Tests Complejos (booking, health)
- [ ] booking: Implementar contexto Joi para validaciones de horario
- [ ] health: Reescribir todos los tests con estructura correcta
- [ ] clinical: Decidir si reactivar suite

### Fase 4: Documentación
- [ ] Actualizar README con coverage final
- [ ] Documentar tests que permanecen skipped y por qué

---

## 📈 Meta Final
- **Objetivo realista**: 205-210 tests passing (~87-90%)
- **Tests que permanecen skipped**: 24-29 (features no implementadas)
- **Coverage mínimo**: 70% (definido en jest.config.js)
