# Estrategia de Despliegue Seguro - Basileia

## Descripción General

Esta estrategia de despliegue implementa prácticas de ingeniería DevOps centradas en la seguridad clínica, cumplimiento regulatorio y continuidad operativa para el sistema Basileia, alineado con las regulaciones colombianas de salud digital.

## Componentes del Sistema

### 1. Sondas de Salud Diferenciadas

#### Sonda de Vida (`/health/live`)
- Verifica que el proceso esté vivo y respondiendo
- No depende de dependencias externas
- Ideal para verificación de proceso por orquestador

#### Sonda de Preparación (`/health/ready`)
- Verifica que todas las dependencias estén listas:
  - Conexión a MongoDB
  - Disponibilidad de Redis
  - Funcionalidad criptográfica
  - Workers de automatización clínica
- Usada por balanceador de carga para routing seguro

### 2. Despliegue Atómico (Blue/Green Simplificado)

#### Estrategia de Enrutamiento por Versión
- Despliegue en entorno paralelo ("green")
- Validación post-despliegue automática
- Cambio de tráfico si verificación pasa
- Rollback automático en <10 segundos si falla

#### Imágenes Inmutables
- Etiquetas por SHA de commit (no "latest")
- Trazabilidad completa de código en producción
- Facilita rollbacks precisos

### 3. Plan de Recuperación ante Desastres (DRP)

#### Copias de Seguridad Automatizadas
- Cifrado AES-256 de datos clínicos
- Retención de 10 años (Ley 1581/2012 y Resolución MinSalud)
- RPO ≤ 1 hora (copias cada hora)
- RTO ≤ 15 minutos (tiempo de restauración objetivo)

#### Procedimientos de Restauración
- Scripts automatizados de restauración
- Pruebas mensuales de restauración
- Almacenamiento inmutable para protección contra ransomware

### 4. Puertas de Validación Clínica

#### Verificación Post-Despliegue
- Validación automática de endpoints críticos
- Verificación de funcionalidad criptográfica
- Comprobación de métricas base
- Rollback automático si falla

## Implementación Técnica

### Sondas de Salud

#### Endpoints Disponibles
- `GET /health/live` - Verifica proceso vivo
- `GET /health/ready` - Verifica dependencias listas
- `GET /internal/metrics` - Métricas clínicas operativas

#### Respuesta de Sonda de Vida
```json
{
  "status": "alive",
  "timestamp": "2023-11-15T10:30:00.000Z",
  "uptime": 3600,
  "pid": 12345,
  "environment": "production",
  "securityTier": "prod"
}
```

#### Respuesta de Sonda de Preparación
```json
{
  "status": "ready",
  "timestamp": "2023-11-15T10:30:00.000Z",
  "checks": {
    "database": "connected",
    "redis": "available",
    "crypto": "functional",
    "workers": "running"
  }
}
```

### Scripts de Operación

#### Backup y Recuperación (`scripts/backup-dr.js`)
```bash
# Crear copia de seguridad inmediata
node scripts/backup-dr.js backup

# Programar copias automáticas
node scripts/backup-dr.js schedule

# Restaurar desde copia
node scripts/backup-dr.js restore path/to/backup.enc

# Verificar funcionalidad de backup
node scripts/backup-dr.js verify
```

#### Verificación de Despliegue (`scripts/deploy-verification.js`)
```bash
# Ejecutar verificación de despliegue
node scripts/deploy-verification.js
```

### Docker y Contenedores

#### Dockerfile Optimizado
- Construcción en múltiples etapas
- Usuario no root para seguridad
- Health check integrado
- Tamaño reducido de imagen

## Integración con CI/CD

### Validación Automática
1. Pruebas unitarias e integración pasan
2. Análisis de seguridad y dependencias
3. Despliegue a entorno paralelo
4. Verificación post-despliegue automática
5. Validación de endpoints críticos
6. Cambio de tráfico si todo pasa
7. Rollback automático si falla

### Puertas Clínicas
- Verificación de funcionalidad criptográfica
- Validación de cifrado de PHI
- Prueba de flujos clínicos críticos
- Verificación de métricas de automatización

## Cumplimiento Regulatorio

### Resolución 2654/2019
- Continuidad operativa con RTO ≤ 15 minutos
- Disponibilidad >99% con zero downtime deployments
- Registro de eventos de sistema para auditoría

### Ley 1581/2012
- Copias de seguridad con retención de 10 años
- Cifrado AES-256 de datos clínicos
- RPO ≤ 1 hora para protección de datos

### Auditoría SIC/MinSalud
- Trazabilidad completa de despliegues
- Registros de cambios y validaciones
- Documentación de procedimientos DRP

## Monitoreo y Operaciones

### Indicadores Clave
- Tiempo de despliegue promedio
- Tasa de éxito de despliegues
- Tiempo de rollback promedio
- Disponibilidad del sistema
- Tiempo de restauración tras incidente

### Alertas Automáticas
- Fallo en verificación post-deploy
- Problemas de salud en endpoints críticos
- Falla en copias de seguridad
- Degradación del servicio

## Validación de Implementación

### Requisitos Cumplidos
✅ **Continuidad Res 2654** - Sondas ready/live + deploy blue/green garantizan zero downtime  
✅ **Retención Ley 1581** - Backups cifrados con política retention=10y en storage inmutable  
✅ **RPO/RTO Definidos** - RPO ≤ 1h (backups diarios), RTO ≤ 15 min (restore script probado)  
✅ **Trazabilidad de Deploy** - Imágenes por SHA, no latest, con registro de versiones activas  
✅ **Verificación Post-Deploy** - Gate automático valida endpoints antes de switch de tráfico  

## Documentación de Procedimientos

### Despliegue de Producción
1. Asegurar que pruebas hayan pasado
2. Validar que no haya incidentes activos
3. Programar ventana de mantenimiento si necesario
4. Ejecutar pipeline de CI/CD
5. Supervisar verificación post-deploy
6. Confirmar funcionalidad en producción
7. Documentar cambios realizados

### Procedimiento de Rollback
1. Detectar falla en verificación post-deploy
2. Ejecutar rollback automático (<10s)
3. Notificar equipo de desarrollo
4. Investigar causa raíz
5. Preparar parche si necesario
6. Documentar lección aprendida

El sistema ahora implementa prácticas de despliegue seguro que priorizan la continuidad del servicio clínico y el cumplimiento regulatorio, alejándose del modelo de "deploy y rezar" hacia un sistema resiliente, reversible y auditable.