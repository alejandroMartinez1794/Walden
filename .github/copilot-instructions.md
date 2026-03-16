# Basileia Platform - AI Agent Guide

## Project Architecture

**Full-stack medical appointment booking system** with React (Vite) frontend and Express/MongoDB backend.

- **Frontend**: `Frontend/` - React + Vite + Tailwind CSS + FullCalendar
- **Backend**: `backend/` - Express.js + MongoDB + Google Calendar API integration
- **Key Integration**: Google OAuth2 for authentication + Google Calendar for appointment management

## Dual User System

The app supports **two user types with separate schemas**:
- **Patients** (`UserSchema.js`) - role: `"paciente"`, can book appointments
- **Doctors** (`DoctorSchema.js`) - role: `"doctor"`, manage appointments & profiles

**Authentication pattern**: Check BOTH models during login/registration:
```javascript
const patient = await User.findOne({ email });
const doctor = await Doctor.findOne({ email });
user = patient || doctor;
```

## Google Calendar Integration

**Two-step OAuth flow**:
1. **Auth**: `/api/v1/calendar/google-auth` → redirects to Google → callback at `/api/v1/calendar/google/callback`
2. **Storage**: Tokens saved in `GoogleTokenSchema` (per-user), reloaded via `config/google.js`
3. **Usage**: `getOAuthClientWithUserTokens()` helper fetches user-specific tokens for calendar operations

**Booking flow**: Creating a `Booking` document automatically creates a Google Calendar event and stores `calendarEventId` for later reference.

## Authentication & Authorization

**JWT-based auth** with role-based access control:
- `authenticate` middleware - verifies JWT from `Authorization: Bearer <token>`
- `restrict(['role1', 'role2'])` middleware - filters by user role
- Frontend stores: `token`, `user`, `role` in localStorage + `AuthContext`

**Protected routes example**:
```javascript
router.post('/bookings', authenticate, createBooking); // any authenticated user
router.put('/doctors/:id', authenticate, restrict(['doctor']), updateDoctor); // doctors only
```

## Frontend Patterns

**State management**: React Context (`AuthContext.jsx`) with reducer pattern for global auth state

**Data fetching**: Custom `useFetchData` hook auto-includes auth token:
```javascript
const { data, loading, error } = useFetchData(`${BASE_URL}/doctors`);
```

**Routing**: 
- `ProtectedRoute` component wraps role-restricted pages
- Google OAuth redirects to `/google-auth-redirect` to handle token storage

**Config**: `Frontend/src/config.js` defines `BASE_URL` (backend API endpoint)

## Backend Structure

**MVC-style organization**:
- `Routes/` → define endpoints + apply middleware
- `Controllers/` → business logic (e.g., `authController.js`, `bookingController.js`)
- `Models/` → Mongoose schemas (note: `UserSchema.js` and `DoctorSchema.js` are separate)
- `auth/verifyToken.js` → authentication middleware

**Nested routes pattern**: Reviews are nested under doctors:
```javascript
// In doctor.js

# Basileia — Guía breve para agentes de código (en español)

Orientación rápida para hacer cambios productivos en este repositorio (concisa y accionable).

Arquitectura y dónde mirar
- Full‑stack: `Frontend/` (React + Vite + Tailwind) y `backend/` (Node/Express + Mongoose + Google APIs).
- Rutas principales montadas en `backend/index.js`: `/api/v1/auth`, `/api/v1/users`, `/api/v1/doctors`, `/api/v1/reviews`, `/api/v1/calendar`, `/api/v1/bookings`, `/api/v1/psychology`, `/api/v1/health`, `/api/v1/clinical`.

Autenticación y roles (crítico)
- JWT en header: `Authorization: Bearer <token>`; el middleware en `backend/auth/verifyToken.js` establece `req.user`, `req.userId`, `req.role`.
- Valores de rol usados: `"paciente"`, `"doctor"`, `"admin"`.
- El middleware `restrict(roles)` valida que el usuario exista (revisa `User` y `Doctor`) y luego verifica el rol.

Integración con Google Calendar
- Endpoints de OAuth: `/api/v1/calendar/google-auth` y `/api/v1/calendar/google/callback` (ver `backend/config/google.js`).
- Los tokens se persisten por usuario en `GoogleTokenSchema` y `getOAuthClientWithUserTokens(userId)` carga el cliente con esos tokens; hay hooks que reescriben los tokens refrescados en MongoDB.
- Los `Booking` se sincronizan con eventos de calendario (revisar campo `calendarEventId` en `BookingSchema.js`).

Convenciones del frontend
- Estado de auth guardado en localStorage: claves `user`, `token`, `role`. Ver `Frontend/src/context/AuthContext.jsx`.
- Hook `Frontend/src/hooks/useFetchData.jsx` lee `token` desde localStorage y añade el header `Authorization` en las peticiones.
- Rutas protegidas usan `Frontend/src/routes/ProtectedRoute.jsx`. Páginas de OAuth de Google: `GoogleAuthRedirect.jsx` y `GoogleCallback.jsx`.

Flujos de desarrollo
- Backend (desde `backend/`):
	- npm run start-dev  # nodemon para desarrollo
	- npm start          # producción
- Frontend (desde `Frontend/`):
	- npm run dev        # servidor Vite

Patrones y particularidades del proyecto
- El repositorio usa módulos ES (`package.json` incluye `"type": "module"`); usa `import`/`export`.
- Las respuestas API usan la forma: `{ success: boolean, message: string, data: any }` — controladores esperan/retornan este formato.
- Muchos controladores esperan `req.userId` (el middleware `verifyToken` establece tanto `req.user.id` como `req.userId`).
- Los helpers de Google esperan que el documento de tokens incluya `userId`; cuando añadas funciones nuevas, guarda `userId` en `GoogleTokenSchema`.

Archivos para abrir primero al cambiar comportamiento
- `backend/auth/verifyToken.js`, `backend/config/google.js`, `backend/utils/getOAuthClientWithUserTokens.js`
- `backend/Controllers/*Controller.js` (lógica de negocio)
- `Frontend/src/context/AuthContext.jsx`, `Frontend/src/hooks/useFetchData.jsx`, `Frontend/src/routes/ProtectedRoute.jsx`

Si algo no queda claro, indícame exactamente qué cambio (archivos/líneas) quieres y lo actualizo, agrego pruebas pequeñas o conecto tokens/rutas según haga falta.
