# GUÍA DE REGISTRO Y COMPLIANCE - COLOMBIA
## Basileiás - Telesalud

**Para operar legalmente servicios de telesalud en Colombia**

---

## 📋 RESUMEN EJECUTIVO

### Costos Totales: **GRATIS** 🎉

- ✅ Registro RNBD (SIC): $0
- ✅ Servicios MongoDB/Google actuales: $0
- ✅ Registro Ministerio de Salud: $0
- ✅ Solo trámites y documentación

### Tiempo Estimado: **2-4 semanas**

---

## FASE 1: REGISTRO NACIONAL DE BASES DE DATOS (RNBD)

### ¿Qué es el RNBD?

Registro obligatorio ante la Superintendencia de Industria y Comercio (SIC) para toda entidad que maneje bases de datos con información personal.

### 📝 Requisitos Previos

1. **Tener los documentos legales listos** ✅ YA TIENES:
   - Política de Tratamiento de Datos ✓
   - Términos y Condiciones ✓
   - Consentimiento Informado ✓

2. **Información de la empresa:**
   - NIT o RUT
   - Certificado de existencia y representación legal
   - Identificación del representante legal
   - Dirección y contacto

### 🚀 Proceso Paso a Paso

#### Paso 1: Preparar Información de las Bases de Datos

Debes registrar **CADA base de datos**. Para Basileiás:

**Base de Datos 1: Usuarios/Pacientes**
```
Nombre: Base de Datos de Pacientes Basileiás
Finalidad: Prestación de servicios de telesalud
Tipo de datos:
  - Datos de identificación (nombre, cédula, fecha nacimiento)
  - Datos de contacto (email, teléfono, dirección)
  - Datos sensibles de salud (diagnósticos, tratamientos, historia clínica)
  - Datos financieros (transacciones)
Cantidad estimada de titulares: [Número estimado]
Ubicación: Colombia (MongoDB Atlas en la nube)
Medidas de seguridad:
  - Cifrado TLS 1.3 en tránsito
  - AES-256 en almacenamiento
  - Autenticación multifactor
  - Controles de acceso
  - Auditorías periódicas
```

**Base de Datos 2: Profesionales**
```
Nombre: Base de Datos de Profesionales de Salud Basileiás
Finalidad: Gestión de proveedores de servicios médicos
Tipo de datos:
  - Datos de identificación
  - Credenciales profesionales (tarjeta profesional, RETHUS)
  - Datos de contacto
  - Información financiera
Cantidad estimada: [Número]
Ubicación: Colombia (MongoDB Atlas)
Medidas de seguridad: [Igual que anterior]
```

#### Paso 2: Acceder al Portal SIC

1. Ir a: https://www.sic.gov.co
2. Menú: **"Protección de Datos Personales"**
3. Click en: **"Registro Nacional de Bases de Datos - RNBD"**
4. Crear cuenta en el portal (si no tienes)

#### Paso 3: Llenar Formulario de Registro

El formulario solicita:

**A. Información del Responsable:**
- Razón social
- NIT
- Dirección
- Teléfono
- Email
- Representante legal
- Actividad económica (Código CIIU: 8690 - Otras actividades de atención de la salud humana)

**B. Información de la Base de Datos:**
- Nombre de la base de datos
- Finalidad (Prestación servicios telesalud)
- Tipo de datos tratados (marcar opciones)
- ☑ Datos sensibles (información de salud)
- Número aproximado de titulares
- Área o departamento responsable
- Medidas de seguridad implementadas

**C. Transferencias Internacionales:**
- ☑ NO (todos los datos en Colombia)

**D. Política de Tratamiento:**
- Adjuntar el archivo PDF de tu Política de Tratamiento de Datos
- URL donde está publicada (cuando tengas sitio web)

#### Paso 4: Adjuntar Documentos

Documentos requeridos (escaneados en PDF):
1. ✅ Política de Tratamiento de Datos Personales
2. ✅ Certificado de existencia y representación legal (Cámara de Comercio)
3. ✅ Cédula del representante legal
4. ✅ Modelo de autorización para tratamiento de datos (tu formulario de consentimiento)

#### Paso 5: Enviar y Obtener Certificado

1. Revisar información
2. Enviar formulario
3. **Recibirás certificado de registro** por email (PDF)
4. **Número de registro RNBD** para tu base de datos

**Tiempo de respuesta:** Inmediato a 5 días hábiles

#### Paso 6: Publicar Información

Una vez registrado, debes:
1. Incluir en tu sitio web:
   - Política de Tratamiento de Datos
   - Número de registro RNBD
   - Enlace a formulario de derechos

2. En documentos y contratos:
   ```
   "Los datos personales serán tratados según nuestra Política 
   de Tratamiento de Datos, registrada en el RNBD de la SIC 
   bajo el número [NÚMERO]"
   ```

### 💰 Costo: **GRATIS**

No hay costo por registro RNBD.

### 📞 Contacto SIC

**Línea nacional:** 018000 910165  
**Bogotá:** +57 (601) 587 0000  
**Email:** contacto@sic.gov.co  
**Chat en línea:** Disponible en sitio web  
**Dirección:** Carrera 13 # 27-00, Pisos 3 y 4, Bogotá  
**Horario:** Lunes a viernes, 8:00 AM - 5:00 PM  

---

## FASE 2: REGISTRO ANTE MINISTERIO DE SALUD (TELESALUD)

### ¿Es Obligatorio?

**Depende de la modalidad:**

- **Telemedicina (como Basileiás):** Requiere registro
- **Solo información de salud:** No requiere

### 📝 Requisitos

1. **Prestador Primario (Profesionales):**
   - Cada profesional debe tener RETHUS activo
   - Tarjeta profesional vigente
   - Capacitación en telesalud

2. **Plataforma Tecnológica:**
   - Certificado de cumplimiento técnico
   - Medidas de seguridad documentadas
   - Política de privacidad

### 🚀 Proceso de Registro

#### Paso 1: Verificar RETHUS de Profesionales

1. Ir a: https://prestadores.minsalud.gov.co/habilitacion/
2. Consultar RETHUS de cada profesional
3. Asegurar que estén activos

**Para nuevos profesionales:**
- Deben registrarse individualmente en RETHUS
- Incluir "Telemedicina" como modalidad

#### Paso 2: Documentación Técnica

Preparar:

**A. Manual de Procedimientos de Telesalud**
```
1. Protocolo de atención virtual
2. Manejo de emergencias
3. Escalamiento a atención presencial
4. Protección de datos
5. Continuidad del servicio
```

**B. Especificaciones Técnicas**
```
- Requisitos mínimos de conectividad
- Protocolos de seguridad (TLS, cifrado)
- Plan de contingencia
- Respaldos y recuperación
- Control de acceso
```

**C. Consentimiento Informado**
- ✅ Ya tienes: CONSENTIMIENTO_INFORMADO_COLOMBIA.md

#### Paso 3: Registro en Portal Ministerio

1. Portal: https://www.minsalud.gov.co
2. Sección: **"Prestadores de Servicios de Salud"**
3. Click: **"Registro de Telemedicina"**

**Información requerida:**
- Datos de la plataforma (Basileiás)
- NIT empresa
- Servicios ofrecidos
- Cobertura geográfica (Colombia)
- Tecnología utilizada
- Lista de profesionales vinculados

#### Paso 4: Inspección Virtual (Puede Aplicar)

En algunos casos, el Ministerio puede:
- Solicitar demostración de la plataforma
- Verificar medidas de seguridad
- Revisar procesos de atención

**Preparar:**
- Cuenta de prueba para inspección
- Documentación técnica completa
- Registros de capacitación de personal

### 💰 Costo: **GRATIS**

No hay costo por registro en Ministerio de Salud.

### ⏰ Tiempo: 2-3 semanas

### 📞 Contacto Ministerio

**Línea nacional:** 018000 910097  
**Bogotá:** +57 (601) 330 5000  
**Email:** atencionalciudadano@minsalud.gov.co  
**Dirección:** Carrera 13 No. 32-76, Bogotá  

---

## FASE 3: REGISTRO EN SECRETARÍA DE SALUD DE BOGOTÁ

### ¿Es Necesario?

**Solo si:**
- Tienes oficina física en Bogotá
- Ofreces atención presencial
- Tu razón social está domiciliada en Bogotá

**Si eres 100% virtual:** Puede no ser necesario (consultar con abogado).

### 📝 Proceso (Si Aplica)

1. Portal: https://www.saludcapital.gov.co
2. Sección: **"Prestadores de Servicios"**
3. Formulario de inscripción
4. Adjuntar:
   - NIT y Cámara de Comercio
   - Registro Ministerio de Salud
   - Póliza de responsabilidad civil (profesionales)

### 💰 Costo: **GRATIS**

### 📞 Contacto

**Línea:** 195  
**PBX:** +57 (601) 364 9090  

---

## FASE 4: COMPLIANCE CONTINUO

### Obligaciones Anuales

**1. Actualización RNBD (SIC)**
- Reportar cambios sustanciales
- Actualizar número de titulares
- Renovar políticas si hay cambios

**2. Auditoría Interna**
- Revisar medidas de seguridad
- Verificar cumplimiento de política de datos
- Documentar incidentes de seguridad

**3. Capacitación**
- Entrenar personal en protección de datos
- Actualizar profesionales en normativa telesalud

**4. Respuesta a Derechos**
- Atender solicitudes de acceso/rectificación/supresión
- Responder en plazos legales (10-15 días)

### 📊 Checklist de Cumplimiento

**Mensual:**
- [ ] Revisar log de accesos a datos sensibles
- [ ] Verificar respaldos funcionando
- [ ] Revisar solicitudes de derechos ARCO

**Trimestral:**
- [ ] Auditoría de seguridad
- [ ] Actualizar lista de profesionales RETHUS
- [ ] Revisar política de datos (cambios necesarios)

**Anual:**
- [ ] Actualizar registro RNBD si hay cambios
- [ ] Renovar pólizas de seguros
- [ ] Capacitación de personal
- [ ] Reporte de cumplimiento interno

---

## RECURSOS Y PLANTILLAS

### Documentos Incluidos

✅ `POLITICA_TRATAMIENTO_DATOS_COLOMBIA.md` - Listo para publicar  
✅ `CONSENTIMIENTO_INFORMADO_COLOMBIA.md` - Integrar en plataforma  
✅ `TERMINOS_Y_CONDICIONES_COLOMBIA.md` - Publicar en sitio web  

### Formatos Adicionales Necesarios

**1. Formulario de Autorización** (Para registro de usuarios)
```html
[ ] Autorizo a Basileiás el tratamiento de mis datos personales
[ ] Autorizo el tratamiento de datos sensibles de salud
[ ] He leído y acepto la Política de Tratamiento de Datos
[ ] He leído y acepto el Consentimiento Informado para Telesalud
[ ] Acepto los Términos y Condiciones del servicio

[Enlace] Leer Política de Tratamiento de Datos
[Enlace] Leer Consentimiento Informado
[Enlace] Leer Términos y Condiciones
```

**2. Formulario de Derechos ARCO**
(Para que usuarios ejerzan derechos)
```
Nombre: ___________
Documento: ___________
Email: ___________
Derecho a ejercer:
[ ] Acceso - Conocer mi información
[ ] Rectificación - Corregir datos erróneos
[ ] Actualización - Actualizar información
[ ] Supresión - Eliminar mis datos
[ ] Revocación - Revocar autorización
[ ] Oposición - Oponerme al tratamiento

Descripción de solicitud:
_______________________

Fecha: ___________
Firma: ___________
```

**3. Procedimiento Interno de Respuesta**
```
1. Recepción de solicitud (Email: privacidad@Basileiás.com)
2. Verificación de identidad del titular
3. Evaluación de la solicitud (2 días)
4. Respuesta:
   - Consultas: 10 días hábiles
   - Reclamos: 15 días hábiles
   - Extensión: +8 días si se justifica
5. Ejecución de la solicitud
6. Confirmación al titular
7. Registro en bitácora interna
```

---

## COSTOS RESUMEN

| Concepto | Costo |
|----------|-------|
| Registro RNBD (SIC) | **$0** ✅ |
| Registro Ministerio Salud | **$0** ✅ |
| Registro Secretaría Bogotá | **$0** ✅ |
| MongoDB M0 (actual) | **$0** ✅ |
| Google personal (actual) | **$0** ✅ |
| **TOTAL** | **$0** 🎉 |

**Opcional (recomendado a futuro):**
- Asesoría legal: $500,000 - $2,000,000 COP
- Auditoría de seguridad: $1,000,000 - $3,000,000 COP/año
- Seguro responsabilidad civil: $500,000 - $1,500,000 COP/año

---

## TIMELINE COMPLETO

### Semana 1
- Lunes: Recopilar documentos empresa (NIT, Cámara de Comercio)
- Martes-Miércoles: Llenar formulario RNBD SIC
- Jueves: Enviar registro RNBD
- Viernes: Preparar documentación técnica para Ministerio

### Semana 2
- Lunes: Recibir certificado RNBD
- Martes-Miércoles: Registro en portal Ministerio de Salud
- Jueves-Viernes: Verificar RETHUS de profesionales

### Semana 3-4
- Esperar aprobación Ministerio
- Publicar documentos en sitio web
- Integrar consentimientos en plataforma
- Capacitar equipo en compliance

### Semana 5+
- **¡LANZAR PLATAFORMA! 🚀**

---

## PRÓXIMOS PASOS INMEDIATOS

### Para Empezar HOY:

1. **Obtener documentos empresa:**
   - [ ] Certificado de existencia y representación legal (Cámara de Comercio)
   - [ ] RUT actualizado
   - [ ] Cédula representante legal

2. **Crear cuenta en portales:**
   - [ ] SIC: www.sic.gov.co
   - [ ] Ministerio: www.minsalud.gov.co

3. **Configurar emails corporativos:**
   - [ ] privacidad@Basileiás.com (datos personales)
   - [ ] legal@Basileiás.com (asuntos legales)
   - [ ] soporte@Basileiás.com (usuarios)

4. **Integrar documentos en plataforma:**
   - [ ] Mostrar Política de Datos en registro
   - [ ] Checkbox de aceptación con enlaces
   - [ ] Página de Términos y Condiciones
   - [ ] Consentimiento Informado antes de primera cita

---

## SOPORTE

### ¿Necesitas Ayuda?

**Para registro RNBD:**  
SIC - 018000 910165 - contacto@sic.gov.co

**Para registro telesalud:**  
Ministerio - 018000 910097 - atencionalciudadano@minsalud.gov.co

**Consulta legal:**  
Buscar abogado especializado en:
- Derecho informático
- Salud y telemedicina
- Protección de datos

**Costo consulta típico:** $200,000 - $500,000 COP

---

## ✅ CHECKLIST FINAL

Antes de lanzar, asegurar:

### Documentación Legal
- [x] Política de Tratamiento de Datos publicada
- [x] Términos y Condiciones publicados
- [x] Consentimiento Informado integrado
- [ ] Registro RNBD obtenido
- [ ] Registro Ministerio Salud obtenido

### Plataforma
- [ ] Checkboxes de aceptación en registro
- [ ] Enlaces a documentos legales
- [ ] Formulario de derechos ARCO disponible
- [ ] Email privacidad@ funcionando

### Seguridad
- [x] HTTPS configurado
- [x] Cifrado de datos
- [x] Autenticación segura
- [x] Respaldos automáticos
- [x] Logs de auditoría

### Profesionales
- [ ] Verificar RETHUS de cada uno
- [ ] Pólizas responsabilidad civil
- [ ] Capacitación en telesalud
- [ ] Firma de confidencialidad

### Operacional
- [ ] Proceso de atención documentado
- [ ] Protocolo de emergencias
- [ ] Plan de contingencia técnica
- [ ] Soporte técnico disponible

---

**¡Todo listo para operar legalmente en Colombia! 🇨🇴**

**Sin costos de infraestructura, solo trámites administrativos.**

La configuración actual (MongoDB M0 + Google gratuito) es **100% legal en Colombia** con los registros apropiados.
