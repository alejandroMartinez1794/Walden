import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import authRoute from './Routes/auth.js';
import userRoute from './Routes/user.js';
import doctorRoute from './Routes/doctor.js';
import reviewRoute from './Routes/review.js';
import calendarRoutes from './Routes/calendar.js';
import bookingRoute from './Routes/booking.js';
import psychologyRoute from './Routes/psychology.js';
import healthRoute from './Routes/health.js';
import clinicalRoutes from './Routes/clinical.js';
import twoFactorRoutes from './Routes/2fa.js';
import paymentRoutes from './Routes/payment.js';

// ============= NEW: CLINICAL ARCHITECTURE ROUTES =============
import clinicalTreatmentRoutes from './Routes/clinical/treatment.js';
import clinicalAlertRoutes from './Routes/clinical/alerts.js';
import clinicalProtocolRoutes from './Routes/clinical/protocols.js';

import { verifyCsrf } from './utils/csrf.js';

// Servicios de Automatización
import { startAppointmentReminderService } from './services/appointmentReminderService.js';
import { startMedicalAlertService } from './services/medicalAlertService.js';
import { startFollowUpService } from './services/followUpService.js';
import { ensureCriticalIndexes } from './scripts/ensureIndexes.js';

// Seguridad Avanzada (PsicoNepsis Shield) - Solo lo esencial para performance
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
// DESACTIVADO para performance: xss-clean y hpp (redundantes con otras validaciones)

// Cargar .env.local primero (credenciales locales), luego .env (plantilla)
// IMPORTANTE: No llamar a dotenv.config() dos veces, solo una
const envPath = '.env.local'; // Intenta primero .env.local
try {
    dotenv.config({ path: envPath, override: true });
    console.log('✅ Loaded .env.local');
} catch (err) {
    console.log('⚠️ .env.local not found, falling back to .env');
    dotenv.config({ path: '.env', override: true });
}

const app = express();
const PORT = process.env.PORT || 8000;

app.disable('x-powered-by');

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
};

app.get('/', (req, res) => {
    res.send('La gente, la gente!');
});

// database connection

mongoose.set('strictQuery', false);
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            maxPoolSize: 10,
            minPoolSize: 2,
        });

        console.log('📊 MongoDB: Conectado');
        
        // 🚀 Verificar índices en background (no bloquea)
        ensureCriticalIndexes().catch(() => {});
        
        // 🚀 LAZY LOADING: Servicios se inician 5 segundos DESPUÉS (reducido de 10s)
        setTimeout(() => {
            console.log('🤖 Servicios de automatización: Activados\n');
            startAppointmentReminderService();
            startMedicalAlertService();
            startFollowUpService();
        }, 5000); // 5 segundos delay (optimizado)

    } catch (error) { 
        console.error('❌ MongoDB connection FAIL:', error.message);
        console.log('⚠️ Servidor corriendo sin conexión a base de datos');
    }
}

// --- MIDDLEWARE OPTIMIZADO (orden importa para performance) ---

// 1. Básicos primero (más rápidos)
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// 2. Seguridad (Helmet - headers HTTP)
app.use(helmet({
    contentSecurityPolicy: false, // Desactivado para no ralentizar
    crossOriginEmbedderPolicy: false,
}));

// 3. Sanitización (solo esencial para performance)
app.use(mongoSanitize());

// 4. Rate Limiting (Protección contra fuerza bruta y abuso de API)
// Limiter General
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones por IP
    message: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente en 15 minutos.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter); 

// 4.1. Auth Limiter (Más estricto para Login/Register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // Máximo 10 intentos de login/registro por IP
    message: { status: false, message: 'Demasiados intentos de autenticación. Bloqueo temporal por seguridad.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// ------------------------------------------------

app.use('/api/v1/auth', authRoute); // http://localhost:5000/api/v1/auth/register  
app.use('/api/v1/users', userRoute); 
app.use('/api/v1/doctors', doctorRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/bookings', bookingRoute);
app.use('/api/v1/psychology', psychologyRoute); // Nuevas rutas de psicología
app.use('/api/v1/health', healthRoute); // Rutas de salud del paciente
app.use('/api/v1/clinical', clinicalRoutes);
app.use('/api/v1/clinical/treatment', clinicalTreatmentRoutes); // New clinical architecture
app.use('/api/v1/clinical/alerts', clinicalAlertRoutes); // New clinical architecture
app.use('/api/v1/clinical/protocols', clinicalProtocolRoutes); // New clinical architecture
app.use('/api/v1/auth/2fa', twoFactorRoutes);
app.use('/api/v1/payment', paymentRoutes);

// CSRF protection (solo para requests con cookie y sin Authorization header)
app.use((req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (req.path.startsWith('/api/v1/auth')) return next();

    const hasAuthHeader = req.headers.authorization?.startsWith('Bearer ');
    const hasCookieAuth = Boolean(req.cookies?.access_token);

    if (!hasCookieAuth || hasAuthHeader) return next();
    return verifyCsrf(req, res, next);
});
    




app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ BACKEND LISTO - API disponible en http://localhost:' + PORT);
    console.log('='.repeat(60) + '\n');
    
    // MongoDB se conecta en background (no bloquea)
    connectDB();
})

