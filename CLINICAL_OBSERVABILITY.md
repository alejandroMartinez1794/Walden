# Sistema de Observabilidad Clínica - Basileia

## Descripción General

El sistema de observabilidad clínica proporciona visibilidad completa en los flujos clínicos, permitiendo la detección temprana de problemas, la correlación forense de eventos y el cumplimiento regulatorio con normativas colombianas de salud digital.

## Componentes del Sistema

### 1. Métricas Clínicas Estructuradas

#### Servicio de Métricas Clínicas (`ClinicalMetricsService.js`)
- Contadores para flujos clínicos críticos
- Histogramas para medir latencias
- Gauges para monitorear estado actual
- Métricas de negocio (citas agendadas, evaluaciones completadas, alertas entregadas)

#### Métricas Rastreables
- `appointmentsScheduled`: Número total de citas agendadas
- `assessmentsCompleted`: Evaluaciones clínicas completadas
- `alertsDelivered`: Alertas médicas entregadas
- `crisisInterventions`: Intervenciones de crisis realizadas
- `phq9HighRiskCount`: Casos PHQ-9 con riesgo alto
- `gad7HighRiskCount`: Casos GAD-7 con riesgo alto
- `clinicalFlowAbandonment`: Abandono de flujos clínicos

### 2. Trazabilidad Distribuida W3C

#### Middleware de Tracing (`distributedTracing.js`)
- Propagación de `traceparent` y `X-Request-ID`
- Correlación entre frontend y backend
- Contexto clínico en logs y respuestas
- Integración con W3C Trace Context

#### Formato de Trace
```
traceparent: 00-{trace-id}-{span-id}-{trace-flags}
X-Request-ID: {unique-request-id}
X-Clinical-Session: {session-id}
```

### 3. Reglas de Alerta Clínica

#### Motor de Reglas (`alertRules.js`)
- Reglas basadas en umbrales clínicos
- Priorización automática por nivel de riesgo
- Acciones automatizadas por tipo de alerta
- Frecuencia controlada para evitar alertas repetidas

#### Umbrales Clínicos
- PHQ-9 ≥ 20: Indicador de riesgo alto
- GAD-7 ≥ 15: Indicador de ansiedad clínicamente significativa
- Tiempo de respuesta P95 > 2 segundos: Degradación del servicio
- Tasa de error > 5%: Problemas de estabilidad
- Tasa de abandono > 5%: Problemas en flujos clínicos

### 4. Dashboard Operativo

#### Endpoints de Métricas
- `GET /internal/metrics`: Snapshot completo de métricas clínicas
- `GET /internal/system-metrics`: Métricas del sistema de automatización
- `GET /internal/health`: Health check con métricas
- `GET /internal/trace-info`: Información de traza para debugging

## Implementación Técnica

### Backend

#### Middleware de Tracing
```javascript
app.use(distributedTracing);
```

El middleware:
- Genera IDs de traza únicos si no existen
- Propaga `traceparent` y `X-Request-ID`
- Añade contexto clínico a los logs
- Mide tiempos de respuesta
- Registra métricas operacionales

#### Controladores Internos
- `internalController.js`: Controlador para métricas y operaciones internas
- `internal.js`: Rutas protegidas para métricas internas

### Frontend

#### Utilidad de Fetch Clínico (`clinicalFetch.js`)
- Implementa propagación de trazas W3C
- Añade contexto clínico a las solicitudes
- Captura errores con contexto completo
- Reporta métricas de rendimiento

## Integración con Herramientas

### Logging
- Todos los logs incluyen contexto de traza (`traceId`, `requestId`)
- Contexto de usuario (`userId`, `role`) cuando está disponible
- Información de rendimiento y estado HTTP

### Monitoreo
- Métricas disponibles en `/internal/metrics`
- Compatible con Prometheus/Grafana
- Estructura adecuada para SIEM

### Reporte de Errores
- Integración con Sentry para reporte de errores
- Contexto clínico en informes de errores
- Identificación de usuarios y roles en fallos

## Cumplimiento Regulatorio

### Resolución 2654/2019
- Métricas de disponibilidad y rendimiento
- Registro de acceso a datos clínicos
- Trazabilidad de flujos clínicos

### Ley 1581/2012
- Trazabilidad forense de eventos
- Control de acceso basado en roles
- Registro de operaciones con datos sensibles

### Auditoría SIC/MinSalud
- Reportes de cumplimiento automático
- Visibilidad en flujos críticos
- Registro de incidentes clínicos

## Uso de la API de Métricas

### Obtener Snapshot de Métricas
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://your-api/internal/metrics
```

### Respuesta de Ejemplo
```json
{
  "success": true,
  "data": {
    "business": {
      "appointmentsScheduled": 125,
      "assessmentsCompleted": 89,
      "alertsDelivered": 7,
      "crisisInterventions": 3
    },
    "clinical": {
      "phq9HighRiskCount": 2,
      "gad7HighRiskCount": 1,
      "clinicalFlowAbandonment": 5
    },
    "operational": {
      "activePatientCount": 42,
      "activeDoctorCount": 8,
      "totalRequests": 1250,
      "totalErrors": 12,
      "errorRate": 0.96,
      "avgResponseTime": 125.4,
      "p95Latency": 320
    },
    "timestamps": {
      "lastUpdated": "2023-11-15T10:30:00.000Z"
    }
  }
}
```

## Validación de Implementación

### Requisitos Cumplidos
✅ Trazabilidad Forense (Ley 1581) - X-Request-ID + Traceparent propagados  
✅ Monitoreo Clínico (Res 2654) - Métricas de negocio y clínicas  
✅ Alertas por Umbral Real - Reglas clínicas con severidad diferenciada  
✅ Correlación UI↔API - clinicalFetch inyecta headers de traza  
✅ Dashboard Mínimo Viable - Endpoint /internal/metrics expone snapshot  

## Monitoreo Continuo

El sistema evalúa las reglas de alerta cada minuto, detectando:
- Degradación en tiempos de respuesta
- Aumento en tasas de error
- Acumulación de casos de riesgo alto
- Problemas en flujos clínicos críticos

Los resultados se registran en logs estructurados y se pueden integrar con sistemas SIEM para análisis forense.