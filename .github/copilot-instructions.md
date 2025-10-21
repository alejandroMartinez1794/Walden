# Medicare Booking Platform - AI Agent Guide

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
1. **Auth**: `/api/v1/calendar/google-auth` → redirects to Google → callback at `/api/v1/calendar/google-callback`
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
router.use('/:doctorId/reviews', reviewRouter);
// Enables: /api/v1/doctors/:doctorId/reviews
```

## Development Workflow

**Start backend** (from `backend/`):
```bash
npm run start-dev  # Uses nodemon for hot reload
# OR
npm start  # Production mode
```

**Start frontend** (from `Frontend/`):
```bash
npm run dev  # Vite dev server on port 5173
```

**Environment variables** (`.env` in `backend/`):
- `MONGO_URL` - MongoDB connection string
- `JWT_SECRET_KEY` - for token signing
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` - OAuth credentials
- `PORT` - backend port (default 8000)

## Key Files Reference

- `backend/index.js` - Express app setup, CORS, route mounting
- `backend/auth/verifyToken.js` - Auth middleware (`authenticate`, `restrict`)
- `backend/config/google.js` - Google OAuth2 client configuration
- `Frontend/src/context/AuthContext.jsx` - Global auth state management
- `Frontend/src/routes/ProtectedRoute.jsx` - Role-based route protection
- `Frontend/src/hooks/useFetchData.jsx` - Reusable authenticated fetch hook

## Database Conventions

**Mongoose models** with soft error handling:
```javascript
export default mongoose.models.ModelName || mongoose.model('ModelName', schema);
```

**References**: Use `mongoose.Types.ObjectId` with `ref` for relationships (e.g., `appointments`, `reviews`)

**Mixed authentication**: `UserSchema` includes `authProvider` field (`"local"` or `"google"`) - Google users may not have passwords

## Common Patterns

- **API responses**: `{ success: boolean, message: string, data: any }`
- **Error handling**: Try-catch in controllers, return appropriate HTTP status codes
- **Role values**: Use `"paciente"`, `"doctor"`, `"admin"` (note Spanish spelling for patient)
- **Token format**: Always `Bearer <token>` in Authorization header
- **Calendar event sync**: Bookings include `calendarEventId` to maintain sync with Google Calendar
