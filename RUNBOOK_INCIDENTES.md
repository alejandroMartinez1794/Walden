# 🚑 Runbook Rápido de Emergencias (Basileia v1.0.1)

Este documento es tu guía rápida de acción si recibes una alerta de Datadog o UptimeRobot indicando que el sistema de producción está caído.

## 🔴 Paso 1: Identificar la fuente del incendio
Si la web no carga, entra y verifica qué falla:
* **Falla de Vercel (Frontend):** La pantalla carga completamente en blanco o muestra un error gigante de Vercel.
* **Falla de Heroku (Backend):** La interfaz visual carga, pero no te deja iniciar sesión, no salen las citas y la consola arroja `Error 500` o `Network Error`.

---

## 🏗️ Paso 2: Ejecutar Rollback (Deshacer el daño)

La regla de oro: **En caso de incendio, NO te pongas a programar fixes. Regresa a la versión anterior que sí funcionaba.**

### Si el daño está en el BACKEND (Heroku):
1. Entra a tu dashboard en [Heroku](https://dashboard.heroku.com).
2. Ve a la app `basileia-api`.
3. Haz clic en la pestaña superior llamada **Activity** (Actividad).
4. Localiza en la lista el despliegue anterior que sí funcionaba (fíjate en la fecha y comentarios).
5. Haz clic en el botón de **Roll back to here**. (¡Se arreglará en 30 segundos!).

### Si el daño está en el FRONTEND (Vercel):
1. Entra a tu dashboard de [Vercel](https://vercel.com).
2. Selecciona el proyecto `basileia-app` y ve a la pestaña **Deployments**.
3. Busca en la lista el cuadro verde (`Ready`) del despliegue del día anterior.
4. Haz clic en los tres puntitos del lado derecho `(...)` y dale a **Promote to Production** o **Redeploy**.

---

## 🔍 Paso 3: Verificación Post-Rollback
1. Entra a la página web en "Modo Incógnito".
2. Intenta hacer login con una cuenta de paciente de prueba.
3. Ingresa a Datadog y verifica que la gráfica de *Error Rates* haya vuelto a cero.

---

## 📢 Paso 4: Comunicación (Criterio Médico)
* Si la plataforma estuvo caída por más de 10 minutos y afectó reservaciones activas: **Notificar inmediatamente a los doctores** por grupo interno (WhatsApp/Slack) para que estén al tanto de posibles retrasos en sus citas.
* No es necesario alarmar a todos los pacientes masivamente, solo interceptar de ser necesario a los que tenían cita agendada en la franja del apagón.