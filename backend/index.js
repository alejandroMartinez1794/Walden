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

// Seguridad Avanzada (PsicoNepsis Shield)
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

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

const corsOptions = { 
    origin: true 
};

app.get('/', (req, res) => {
    res.send('La gente, la gente!');
});

// database connection

mongoose.set('strictQuery', false);
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);

    console.log('MongoDB connection SUCCESS');

    } catch (error) { 
        
        console.error('MongoDB connection FAIL', error);
    }
}

// middleware
app.use(express.json({ limit: '10kb' })); // Limitar tamaño de body para evitar DoS
app.use(cookieParser());
app.use(cors(corsOptions));

// --- CAPA DE SEGURIDAD CLÍNICA (PsicoNepsis) ---

// 1. Headers de seguridad HTTP (Helmet)
app.use(helmet());

// 2. Sanitización de datos (NoSQL Injection & XSS)
app.use(mongoSanitize()); // Previene inyección en MongoDB ($gt, $ne)
app.use(xss()); // Limpia inputs de scripts maliciosos

// 3. Prevención de polución de parámetros HTTP
app.use(hpp());

// 4. Rate Limiting (Protección contra fuerza bruta y abuso de API)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones por IP
    message: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente en 15 minutos.'
});
app.use('/api', limiter); // Aplicar a todas las rutas de API

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
    




app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
})

