# 🤖 Sistema de Automatización - Basileiás

## Descripción General

Sistema de automatización nativo integrado en el backend de Basileiás que maneja:
- ✅ Recordatorios automáticos de citas
- ✅ Alertas médicas críticas
- ✅ Seguimiento post-sesión
- ✅ Recordatorios de actualización de métricas

## 📦 Dependencias Instaladas

```bash
npm install node-cron agenda
```

## 🚀 Servicios Activos

### 1. Recordatorios de Citas (`appointmentReminderService.js`)

**Funcionalidad:**
- Envía recordatorios automáticos por email a pacientes antes de sus citas

**Tareas programadas:**
- **24 horas antes**: Se ejecuta cada hora (minuto 0)
- **1 hora antes**: Se ejecuta cada 10 minutos

**Campos de tracking en BookingSchema:**
- `reminderSent24h`: Boolean
- `reminderSent1h`: Boolean

**Contenido del email:**
- Datos de la cita (fecha, hora, doctor)
- Link a sesión virtual (si aplica)
- Información del precio
- Instrucciones de cancelación

---

### 2. Alertas Médicas (`medicalAlertService.js`)

**Funcionalidad:**
- Monitorea alertas críticas no resueltas
- Detecta patrones de riesgo en métricas de pacientes
- Notifica a doctores automáticamente

**Tareas programadas:**
- **Procesamiento de alertas**: Cada 30 minutos
- **Detección de patrones**: Diario a las 2:00 AM

**Alertas detectadas:**
- 🔴 **Riesgo de suicidio**: PHQ-9 ≥ 20 o ideación suicida alta
- 🟠 **Depresión severa**: PHQ-9 entre 15-19
- 🟡 **Empeoramiento de síntomas**: Análisis de tendencias

**Campo de tracking en AlertSchema:**
- `lastNotified`: Date

**Contenido del email:**
- Información del paciente
- Tipo y severidad de la alerta
- Acciones recomendadas
- Link al dashboard clínico

---

### 3. Seguimiento Post-Sesión (`followUpService.js`)

**Funcionalidad:**
- Envía cuestionarios de satisfacción después de las sesiones
- Solicita actualización de métricas de bienestar
- Recuerda agendar próxima cita si el paciente lleva 7+ días sin citas

**Tareas programadas:**
- **Cuestionario post-sesión**: Cada hora (24h después de la cita)
- **Recordatorio de métricas**: Cada 6 horas (48h después de la cita)
- **Recordatorio próxima cita**: Diario a las 10:00 AM (para pacientes sin citas en 7+ días)

**Campos de tracking en BookingSchema:**
- `followUpSent`: Boolean
- `metricsReminderSent`: Boolean

**Emails enviados:**
1. **Cuestionario de feedback** (24h post-sesión)
   - Evaluación de la sesión
   - Calificación del terapeuta
   - Link a formulario de feedback

2. **Actualización de métricas** (48h post-sesión)
   - Estado de ánimo
   - Nivel de ansiedad
   - Calidad del sueño
   - Energía y motivación

3. **Recordatorio de próxima cita** (7+ días sin citas)
   - Importancia del seguimiento continuo
   - Beneficios de la consistencia
   - Link para agendar

---

## 📁 Estructura de Archivos

```
backend/
├── services/
│   ├── appointmentReminderService.js    # Recordatorios de citas
│   ├── medicalAlertService.js           # Alertas médicas
│   └── followUpService.js               # Seguimiento post-sesión
├── models/
│   ├── BookingSchema.js                 # + campos de tracking
│   └── AlertSchema.js                   # + campo lastNotified
├── utils/
│   └── emailService.js                  # Servicio de email (Nodemailer)
└── index.js                             # Inicialización de servicios
```

---

## ⚙️ Configuración

### Variables de entorno necesarias (.env.local):

```env
# Email Configuration
EMAIL_SERVICE=gmail                        # o 'hotmail', 'outlook'
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password           # App password de Gmail
EMAIL_FROM=Basileiás@gmail.com

# Frontend URL (para links en emails)
FRONTEND_URL=http://localhost:5173         # Desarrollo
# FRONTEND_URL=https://Basileiás.com    # Producción

# MongoDB
MONGO_URL=mongodb://...

# Puerto
PORT=8000
```

### Obtener App Password de Gmail:
1. Ir a Google Account → Security
2. Habilitar "2-Step Verification"
3. Ir a "App passwords"
4. Generar password para "Mail"
5. Copiar el password de 16 caracteres en `EMAIL_PASSWORD`

---

## 🚀 Inicialización

Los servicios se inician automáticamente cuando se levanta el servidor:

```javascript
// backend/index.js
app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
    
    // Iniciar servicios de automatización
    startAppointmentReminderService();
    startMedicalAlertService();
    startFollowUpService();
});
```

**Salida en consola:**
```
Server is running on port 8000
🤖 Iniciando servicios de automatización...

📧 Iniciando servicio de recordatorios de citas...
✅ Servicio de recordatorios activo:
   - Recordatorios 24h antes: cada hora
   - Recordatorios 1h antes: cada 10 minutos

🚨 Iniciando servicio de alertas médicas...
✅ Servicio de alertas activo:
   - Procesamiento de alertas: cada 30 minutos
   - Detección de patrones: diario a las 2 AM

📝 Iniciando servicio de seguimiento post-sesión...
✅ Servicio de seguimiento activo:
   - Cuestionarios post-sesión: cada hora (24h después)
   - Recordatorios de métricas: cada 6 horas (48h después)
   - Recordatorio próxima cita: diario a las 10 AM (7+ días sin cita)

✅ Todos los servicios de automatización están activos
```

---

## 🧪 Testing Manual

### Probar recordatorios de citas:
1. Crear una cita con `appointmentDate` en 24 horas
2. Esperar a que el cron job se ejecute (o cambiar la hora temporalmente)
3. Verificar que el email llegue al paciente
4. Verificar que `reminderSent24h` se actualice a `true` en MongoDB

### Probar alertas médicas:
1. Crear una alerta con `severity: 'critical'` y `resolved: false`
2. Esperar 30 minutos (o forzar ejecución temporalmente)
3. Verificar email al doctor
4. Verificar que `lastNotified` se actualice

### Probar seguimiento post-sesión:
1. Crear una cita completada hace 24 horas con `status: 'approved'`
2. Esperar a que el cron job se ejecute
3. Verificar email de cuestionario
4. Verificar que `followUpSent` se actualice a `true`

---

## 🔧 Personalización

### Cambiar frecuencias de cron jobs:

```javascript
// Formato: minuto hora día mes día-semana
cron.schedule('0 * * * *', ...);        // Cada hora
cron.schedule('*/10 * * * *', ...);     // Cada 10 minutos
cron.schedule('0 2 * * *', ...);        // Diario a las 2 AM
cron.schedule('0 */6 * * *', ...);      // Cada 6 horas
```

### Agregar nuevo servicio:

```javascript
// 1. Crear archivo en services/
// services/myNewService.js

import cron from 'node-cron';

const myScheduledTask = () => {
  return cron.schedule('0 * * * *', async () => {
    // Tu lógica aquí
  });
};

export const startMyNewService = () => {
  console.log('🚀 Iniciando mi nuevo servicio...');
  const job = myScheduledTask();
  return { job };
};

// 2. Importar e iniciar en index.js
import { startMyNewService } from './services/myNewService.js';

app.listen(PORT, () => {
  // ...
  startMyNewService();
});
```

---

## 📊 Monitoreo

### Logs en consola:
- `🔄` Inicio de tarea
- `✅` Tarea completada
- `❌` Error
- `📋` Cantidad de items procesados

### Verificación en MongoDB:
```javascript
// Verificar recordatorios enviados
db.bookings.find({ reminderSent24h: true })

// Verificar alertas notificadas
db.alerts.find({ lastNotified: { $exists: true } })

// Verificar seguimientos enviados
db.bookings.find({ followUpSent: true })
```

---

## 🛡️ Buenas Prácticas

1. **Rate limiting de emails**: Los servicios incluyen pausas (1-3s) entre envíos para no saturar el servidor de email
2. **Límites de queries**: Usamos `.limit()` para procesar lotes pequeños y evitar sobrecarga
3. **Campos de tracking**: Evitan enviar emails duplicados con flags booleanos
4. **Manejo de errores**: Cada tarea tiene try-catch para no detener otros servicios
5. **Timestamps**: `lastNotified` permite re-notificar alertas cada 2 horas si no se resuelven

---

## 🆚 vs. N8N

### Ventajas de este sistema nativo:
✅ **Sin costos adicionales** (no necesitas hosting de N8N)  
✅ **Menor latencia** (todo corre en el mismo proceso)  
✅ **Control total** del código  
✅ **No requiere configuración externa**  
✅ **Más fácil de depurar**

### Cuándo usar N8N:
- Integraciones complejas con APIs externas (Twilio, Slack, WhatsApp)
- Workflows visuales que el equipo no técnico necesita modificar
- Procesamiento de datos que requiere transformaciones complejas
- Necesitas workflows condicionales muy elaborados

---

## 📝 Próximos Pasos Sugeridos

1. **Implementar endpoint de feedback** en frontend:
   - `/patient/feedback/:bookingId` para cuestionario post-sesión
   - `/patient/health-metrics` para actualización de métricas

2. **Dashboard de monitoreo**:
   - Visualizar cuántos emails se han enviado
   - Métricas de engagement (tasa de apertura, respuestas)

3. **SMS notifications** (opcional):
   - Integrar Twilio para recordatorios por SMS
   - Útil para pacientes con baja interacción por email

4. **Webhook para estados de email** (opcional):
   - Verificar bounces, entregas, aperturas
   - Usar SendGrid o Mailgun para mejor tracking

---

## 🐛 Troubleshooting

### Los emails no se envían:
1. Verificar `EMAIL_USERNAME` y `EMAIL_PASSWORD` en `.env.local`
2. Verificar que Gmail tenga "App passwords" habilitado
3. Revisar logs de consola para errores específicos
4. Probar envío manual con `sendEmail()` directamente

### Los cron jobs no se ejecutan:
1. Verificar que el servidor esté corriendo sin reiniciar
2. Revisar sintaxis de cron expression con https://crontab.guru
3. Verificar que no haya errores en la consola al iniciar
4. Testear con frecuencias más cortas temporalmente

### Múltiples emails duplicados:
1. Verificar que los flags de tracking estén actualizándose
2. Revisar que no haya múltiples instancias del servidor corriendo
3. Verificar índices en MongoDB para queries optimizadas

---

## 📚 Referencias

- [node-cron documentation](https://github.com/node-cron/node-cron)
- [Crontab.guru - Cron schedule expressions](https://crontab.guru)
- [Nodemailer documentation](https://nodemailer.com)
- [Agenda.js (alternativa para jobs persistentes)](https://github.com/agenda/agenda)

---

**Desarrollado para Basileiás** 🧠💙  
Sistema de automatización médica integrado y eficiente.
