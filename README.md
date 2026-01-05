# Psiconepsis (monorepo)

Work-in-progress full-stack medical appointment booking platform.

## Quick start - Backend

1. Ir al directorio `backend` e instalar dependencias:

```powershell
cd backend
npm install
```

2. Copiar el ejemplo de entorno y rellenar variables:

```powershell
cd backend
copy .env.example .env
# (PowerShell) Copy-Item .env.example .env
```

3. Ejecutar en modo desarrollo (nodemon):

```powershell
npm run start-dev
```

## Quick start - Frontend

1. Ir al directorio `Frontend` e instalar dependencias:

```powershell
cd Frontend
npm install
```

2. Copiar el ejemplo de entorno y editar `VITE_BACKEND_URL` si es necesario:

```powershell
cd Frontend
copy .env.example .env
# o Copy-Item .env.example .env
```

3. Ejecutar Vite dev server:

```powershell
npm run dev
```

---

Si necesitas ayuda con las credenciales de Google Calendar o la conexión a MongoDB, dime y te guío para configurarlas.
