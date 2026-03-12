# ⚡ Guía Rápida - Sistema de Automatización

## 🎯 ¿Qué se automatizó?

Tu backend ahora **NO necesita N8N** porque implementamos:

1. **📧 Recordatorios de citas**
   - 24h antes (cada hora)
   - 1h antes (cada 10 min)

2. **🚨 Alertas médicas críticas**
   - Monitoreo cada 30 min
   - Detección de patrones diaria (2 AM)
   - Notificación automática a doctores

3. **📝 Seguimiento post-sesión**
   - Cuestionario 24h después
   - Recordatorio métricas 48h después
   - Recordatorio próxima cita (7+ días)

## ⚙️ Configuración en 3 pasos

### 1. Variables de entorno (.env.local):
```env
EMAIL_SERVICE=gmail
EMAIL_USERNAME=tu-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App password de Gmail
EMAIL_FROM=Basileia@gmail.com
FRONTEND_URL=http://localhost:5173
```

### 2. Obtener App Password de Gmail:
1. Google Account → Security → 2-Step Verification (activar)
2. App passwords → Mail → Generar
3. Copiar código de 16 caracteres

### 3. Reiniciar servidor:
```bash
cd backend
npm start
```

## ✅ Verificación

Deberías ver en consola:
```
✅ Servicio de recordatorios activo
✅ Servicio de alertas activo
✅ Servicio de seguimiento activo
✅ Todos los servicios de automatización están activos
```

## 📁 Archivos creados

```
backend/services/
├── appointmentReminderService.js  # Recordatorios
├── medicalAlertService.js         # Alertas
├── followUpService.js             # Seguimiento
└── README.md                      # Documentación completa
```

## 🧪 Testing

**Probar recordatorio 24h:**
```javascript
// Crear booking con appointmentDate = now + 24 horas
// Esperar 1 hora (o cambiar frecuencia del cron)
// Verificar email en bandeja del paciente
```

**Probar alerta crítica:**
```javascript
// Crear Alert con severity: 'critical', resolved: false
// Esperar 30 minutos
// Verificar email en bandeja del doctor
```

## 📊 Schemas actualizados

**BookingSchema** (nuevos campos):
- `reminderSent24h`: Boolean
- `reminderSent1h`: Boolean
- `followUpSent`: Boolean
- `metricsReminderSent`: Boolean

**AlertSchema** (nuevo campo):
- `lastNotified`: Date

## 🚀 Beneficios vs. N8N

✅ Sin costos adicionales  
✅ Sin infraestructura externa  
✅ Menor latencia (mismo proceso)  
✅ Más fácil de depurar  
✅ Control total del código  

## 📚 Documentación completa

Ver [backend/services/README.md](./README.md) para:
- Detalles técnicos de cada servicio
- Personalización de frecuencias
- Troubleshooting
- Agregar nuevos servicios

## 🆘 Troubleshooting rápido

**Emails no se envían:**
- Verificar EMAIL_USERNAME y EMAIL_PASSWORD
- Usar App Password, no contraseña normal de Gmail

**Cron jobs no ejecutan:**
- Verificar que el servidor esté corriendo (no reiniciar)
- Revisar logs en consola

**Emails duplicados:**
- Verificar que los campos de tracking se actualicen
- Solo una instancia del servidor debe estar corriendo

---

**¡Sistema listo para producción!** 🎉
