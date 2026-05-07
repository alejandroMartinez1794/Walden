# Sistema de Automatización Clínica Resiliente

## Descripción General

El sistema de automatización clínica ha sido rediseñado para ser más resistente, confiable y auditable. Implementa características críticas para cumplir con requisitos médicos y legales en entornos clínicos.

## Características Principales

### 1. Reintento con Backoff Exponencial y Jitter
- Los servicios implementan políticas de reintento inteligentes
- Backoff exponencial para evitar sobrecarga en caso de fallos
- Jitter aleatorio para evitar "thundering herd" (muchas solicitudes simultáneas)

### 2. Circuit Breaker Clínico
- Protección contra fallos en cascada
- Diferenciación entre alertas críticas y estándar
- Las alertas de riesgo crítico (ideación suicida, depresión severa) ignoran el circuit breaker
- Configuración diferente de umbrales para tareas críticas vs estándar

### 3. Métricas Estructuradas y DLQ (Dead Letter Queue)
- Contadores de envíos exitosos/fracasados/reintentados/descartados
- Registro detallado de cada tipo de tarea
- Cola muerta para revisiones manuales de tareas que fallaron repetidamente

### 4. Idempotencia y Deduplicación
- Prevención de mensajes duplicados mediante clave de negocio
- Uso de `bookingId + eventType + scheduledDate` como clave única
- Protección contra efectos secundarios al reiniciar workers

### 5. Ejecución en Worker Aislado
- Separación del ciclo de vida HTTP
- Workers dedicados para automatizaciones clínicas
- Si la automatización falla, la API clínica sigue disponible

## Componentes del Sistema

### ClinicalMetrics
- Rastrea métricas de rendimiento y éxito
- Contadores de tareas por tipo
- Tiempos de ejecución promedio
- Disponible vía `/api/v1/health/clinical/metrics`

### CircuitBreaker
- Control de fallos para prevenir sobrecarga
- Configuración por tipo de tarea
- Soporte para tareas críticas que ignoran el breaker
- Disponible vía `/api/v1/health/clinical/circuit-breakers`

### ResilientTaskRunner
- Ejecución de tareas con reintentos inteligentes
- Soporte para diferentes tipos de tareas
- Integración con CircuitBreaker
- Generación de claves únicas para idempotencia

### ClinicalWorker
- Worker dedicado para automatizaciones clínicas
- Separado del proceso principal de la API
- Monitorización de estado y métricas
- Disponible vía `/api/v1/health/clinical/worker`

## Tipos de Automatizaciones

### 1. Recordatorios de Cita
- 24 horas antes de la cita
- 1 hora antes de la cita
- Reintento automático en caso de fallo de email

### 2. Seguimientos Post-Sesión
- Encuestas de satisfacción 24h después
- Recordatorios de métricas de salud 48h después
- Recordatorios de próxima cita después de 7 días

### 3. Alertas Clínicas
- Detección automática de riesgo suicida (PHQ-9 ≥ 20)
- Alertas de depresión severa (PHQ-9 ≥ 15)
- Notificaciones prioritarias a médicos
- Cumple con la Resolución 2654/2019 y normativas del MinSalud

## Endpoints de Monitoreo

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/v1/health/clinical/metrics` | Métricas de automatización |
| `GET /api/v1/health/clinical/circuit-breakers` | Estado de circuit breakers |
| `GET /api/v1/health/clinical/worker` | Estado del worker clínico |
| `POST /api/v1/health/clinical/reset-circuit-breakers` | Reiniciar circuit breakers (requiere autenticación) |
| `POST /api/v1/health/clinical/reset-metrics` | Reiniciar métricas (requiere autenticación) |

## Scripts de Ejecución

### Ejecutar solo el worker clínico:
```bash
cd backend
npm run start-worker        # Producción
npm run start-worker-dev    # Desarrollo con nodemon
```

### Variables de Entorno Relevantes

```env
# Habilitar/deshabilitar automatizaciones
AUTOMATION_ENABLED=true

# Zona horaria para programación
AUTOMATION_TIMEZONE=America/Bogota

# Límites de procesamiento
AUTOMATION_MAX_BATCH=50
AUTOMATION_EMAIL_THROTTLE_MS=1000
AUTOMATION_ALERT_RENOTIFY_HOURS=2
```

## Cumplimiento Regulatorio

### Resolución 2654/2019 & Ministerio de Salud
- Trazabilidad completa de todas las automatizaciones
- Logs estructurados de todas las acciones
- Métricas disponibles para auditorías

### Prevención de Fatiga de Alertas
- Cooldown de 24h entre alertas clínicas similares
- Deduplicación de mensajes idénticos
- Registro de `alertSentAt` para rastrear notificaciones

## Beneficios del Nuevo Sistema

1. **Mayor confiabilidad**: Los servicios ya no fallan en silencio
2. **Auditoría clínica**: Completamente rastreable y medible
3. **Protección de recursos**: Circuit breakers protegen la API principal
4. **Priorización clínica**: Alertas críticas tienen precedencia
5. **Resiliencia**: Recuperación automática de fallos temporales
6. **Escalabilidad**: Workers separados permiten escalado independiente