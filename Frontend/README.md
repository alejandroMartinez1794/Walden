# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Quick start (project-specific)

1. Instala dependencias:

```powershell
cd Frontend
npm install
```

2. Crea el archivo de entorno local (usa el ejemplo):

```powershell
cd Frontend
copy .env.example .env
# o para Windows PowerShell: Copy-Item .env.example .env
```

3. Inicia el servidor de desarrollo (Vite):

```powershell
cd Frontend
npm run dev
```

Notas:
- Si Vite encuentra el puerto 5173 ocupado intentará puertos alternativos (5174, 5175 ...).
- Si quieres apuntar a otro backend, edita `Frontend/.env` y cambia `VITE_BACKEND_URL`.

