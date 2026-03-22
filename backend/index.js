// ============= MONITORING & OBSERVABILITY =============
// CRITICAL: Datadog & New Relic MUST be loaded FIRST before any other modules
import './datadog.js';
import './newrelic.js';

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createHTTPSServer, createHTTPRedirectServer, forceHTTPS, additionalSecurityHeaders } from './config/https.js';

// Sentry error tracking
import { 
  initSentry, 
  sentryRequestHandler, 
  sentryTracingHandler, 
  sentryErrorHandler 
} from './config/sentry.js';

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
import logger from './utils/logger.js';
import { validateSecrets, getSecretsStats } from './utils/secretsManager.js';

// Performance & Scalability (Phase 5)
import { initRedis, closeRedis, isRedisAvailable } from './utils/cache.js';
import compression from 'compression';
import { createOptimizedIndexes } from './scripts/optimizeIndexes.js';

// Advanced Security & Documentation (Phase 6)
import { 
  authRateLimiter, 
  passwordResetRateLimiter,
  apiRateLimiter,
  strictRateLimiter,
  closeRateLimitRedis 
} from './utils/rateLimiter.js';
import { setupSwagger } from './config/swagger.js';

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

// Seguridad Avanzada (Basileia Shield) - Solo lo esencial para performance
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
// DESACTIVADO para performance: xss-clean y hpp (redundantes con otras validaciones)

logger.info('\n═══════════════════════════════════════════════════════');
logger.info('🚀 Iniciando Basileia Backend API');
logger.info('═══════════════════════════════════════════════════════\n');

// Cargar .env.local primero (credenciales locales), luego .env (plantilla)
logger.info('📋 [1/6] Cargando configuración...');
const envPath = '.env.local';
try {
    dotenv.config({ path: envPath, override: true });
    logger.info('   ✓ Variables de entorno cargadas desde .env.local');
} catch (err) {
    logger.info('   ⚠ .env.local no encontrado, usando .env');
    dotenv.config({ path: '.env', override: true });
}

// Validar secretos requeridos al iniciar (skip en entorno de test)
logger.info('\n🔐 [2/6] Validando secretos de seguridad...');
if (process.env.NODE_ENV !== 'test') {
    const secretsValidation = await validateSecrets();
    if (!secretsValidation.valid) {
        logger.error('   ✗ Error: Faltan secretos requeridos:', secretsValidation.missing);
        logger.error('   ✗ La aplicación no puede iniciar sin los secretos requeridos');
        logger.info('   ℹ Ver backend/SECRETS_MANAGEMENT.md para instrucciones');
        process.exit(1);
    }
    logger.info('   ✓ Todos los secretos validados correctamente');
    const stats = getSecretsStats();
    logger.info(`   ✓ Secretos cargados: ${stats.loaded}/${stats.total}`);
} else {
    logger.info('   ⏭ Validación de secretos omitida (entorno de test)');
}

const app = express();

// Set trust proxy for rate limiting and IP resolution behind Heroku's router
app.set('trust proxy', 1);

// ============= SENTRY INITIALIZATION =============
// MUST be called BEFORE any middleware or routes
initSentry(app);

// Sentry request tracking (BEFORE routes)
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

const PORT = process.env.PORT || 8000;

app.disable('x-powered-by');

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Permitir solicitudes sin origen (como curl, Postman o el mismo servidor)
        if (!origin) {
            return callback(null, true);
        }
        
        // Política Deny-by-default: Si CORS_ORIGINS no está configurado, bloqueamos todo lo externo
        if (allowedOrigins.length === 0) {
            logger.warn(`Bloqueo CORS interceptado para: ${origin}. Variable CORS_ORIGINS no configurada.`);
            return callback(new Error('Bloqueado por política estricta CORS'));
        }
        
        // Validación de lista blanca
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
};

app.get('/', (req, res) => {
    res.send('La gente, la gente!');
});

// ============= HEALTH CHECK ENDPOINTS =============
// Used by Heroku, Vercel, UptimeRobot for monitoring
app.get('/health', async (req, res) => {
    const healthCheck = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        services: {
            mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            redis: isRedisAvailable() ? 'connected' : 'not-configured',
        }
    };
    
    // Return 503 if MongoDB is down (critical service)
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json(healthCheck);
    }
    
    res.status(200).json(healthCheck);
});

// Simple ping endpoint (no DB check, fastest response)
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// ============= PHASE 6: API DOCUMENTATION =============
// Swagger/OpenAPI documentation at /api-docs
if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
}

// database connection

mongoose.set('strictQuery', false);
const connectDB = async () => {
    try {
        // ============= PHASE 5: OPTIMIZED CONNECTION POOL =============
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            maxPoolSize: 20, // Increased from 10 (better concurrency)
            minPoolSize: 5,  // Increased from 2 (faster cold starts)
            maxIdleTimeMS: 30000, // Close idle connections after 30s
            socketTimeoutMS: 45000, // Socket timeout
        });

        logger.info('   ✓ Conexión MongoDB establecida');
        logger.info('   ✓ Pool de conexiones optimizado (max: 20, min: 5)');
        
        // ============= PHASE 5: OPTIMIZED DATABASE INDEXES =============
        // Create compound indexes for faster queries
        createOptimizedIndexes().catch((err) => {
            logger.info('   ⚠ Optimización de índices falló (no crítico)');
        });
        
        // 🚀 Verificar índices críticos en background (no bloquea)
        ensureCriticalIndexes().catch(() => {});
        
        // 🚀 LAZY LOADING: Servicios se inician 5 segundos DESPUÉS (reducido de 10s)
        setTimeout(() => {
            logger.info('\n🤖 [6/6] Activando servicios de automatización...');
            logger.info('   ✓ Recordatorios de citas');
            logger.info('   ✓ Alertas médicas críticas');
            logger.info('   ✓ Seguimiento post-sesión');
            startAppointmentReminderService();
            startMedicalAlertService();
            startFollowUpService();
            
            logger.info('\n═══════════════════════════════════════════════════════');
            logger.info('✅ BACKEND LISTO PARA TRABAJAR');
            logger.info('═══════════════════════════════════════════════════════\n');
        }, 5000);

    } catch (error) { 
        logger.error('   ✗ Error en conexión MongoDB:', error.message);
        logger.info('   ⚠ Servidor ejecutándose sin conexión a base de datos');
    }
}

// --- MIDDLEWARE OPTIMIZADO (orden importa para performance) ---

// 1. Básicos primero (más rápidos)
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// 1.5 PHASE 5: Compression middleware (gzip/deflate)
// Compresses all responses > 1KB (improves load times by 60-80%)
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false; // Don't compress if client requests no compression
        }
        return compression.filter(req, res);
    },
    level: 6, // Compression level (0-9, 6 is balanced)
    threshold: 1024, // Only compress responses > 1KB
}));

// 1.5 HTTPS/TLS middleware (solo en producción)
if (process.env.USE_HTTPS === 'true') {
    app.use(forceHTTPS); // Forzar HTTPS
    app.use(additionalSecurityHeaders); // Headers adicionales (HSTS, etc.)
}

// 2. Seguridad (Helmet - headers HTTP)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'none'"], // Backend estricto
            scriptSrc: ["'none'"],
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" } // Permite solicitudes CORS de Vercel
}));

// 3. Sanitización (solo esencial para performance)
app.use(mongoSanitize());

// 3.1 Logging de requests (omitido en tests)
if (process.env.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const durationMs = Date.now() - start;
            logger.info('HTTP request', {
                method: req.method,
                path: req.originalUrl,
                status: res.statusCode,
                durationMs,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });
        });
        next();
    });
}

// 4. Rate Limiting (Protección contra fuerza bruta y abuso de API)
// Solo activado en producción - deshabilitado en tests
if (process.env.NODE_ENV !== 'test') {
    // ============= PHASE 6: ADVANCED RATE LIMITING WITH REDIS =============
    // Uses Redis if available, falls back to in-memory
    
    // General API rate limiter
    app.use('/api', apiRateLimiter);
    
    // Strict authentication rate limiting
    app.use('/api/v1/auth/login', authRateLimiter);
    app.use('/api/v1/auth/register', authRateLimiter);
    app.use('/api/v1/auth/forgot-password', passwordResetRateLimiter);
    app.use('/api/v1/auth/reset-password', passwordResetRateLimiter);
    
    // Strict rate limiting for expensive or sensitive operations
    app.use('/api/v1/bookings', strictRateLimiter);
    app.use('/api/v1/calendar/create-event', strictRateLimiter);
    app.use('/api/v1/calendar/update-event', strictRateLimiter);
}

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

// ============= SENTRY ERROR HANDLER =============
// MUST be added AFTER all routes but BEFORE other error handlers
app.use(sentryErrorHandler());

// Exportar app para testing
export default app;

// Función para iniciar el servidor (solo cuando no sea test)
export const startServer = async () => {
    // ============= PHASE 5: INITIALIZE REDIS =============
    logger.info('\n⚡ [3/6] Inicializando servicios de cache...');
    await initRedis();
    if (isRedisAvailable()) {
        logger.info('   ✓ Redis conectado y disponible');
    } else {
        logger.info('   ⚠ Redis no configurado (opcional)');
    }
    
    const useHTTPS = process.env.USE_HTTPS === 'true';
    
    logger.info('\n🌐 [4/6] Configurando servidor web...');
    if (useHTTPS) {
        // Modo HTTPS
        const httpsServer = await createHTTPSServer(app);
        const httpRedirectServer = createHTTPRedirectServer();
        
        httpsServer.listen(PORT, () => {
            logger.info(`   ✓ Servidor HTTPS listo en https://localhost:${PORT}`);
            logger.info('\n🗄️  [5/6] Conectando a base de datos...');
            connectDB();
        });
        
        const httpPort = process.env.HTTP_REDIRECT_PORT || 8080;
        httpRedirectServer.listen(httpPort, () => {
            logger.info(`   ✓ Servidor de redirección HTTP → HTTPS (puerto ${httpPort})`);
        });
        
        return { httpsServer, httpRedirectServer };
    } else {
        // Modo HTTP (desarrollo)
        const httpServer = app.listen(PORT, () => {
            logger.info(`   ✓ Servidor HTTP listo en http://localhost:${PORT}`);
            logger.info(`   ✓ Entorno: ${process.env.NODE_ENV || 'development'}`);
            logger.info('\n🗄️  [5/6] Conectando a base de datos...');
            connectDB();
        });
        
        return { httpServer };
    }
};

// Iniciar servidor solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
    startServer().catch((error) => {
        logger.error('\n❌ Error crítico al iniciar el servidor:', error.message);
        logger.error('   Stack trace:', error.stack);
        process.exit(1);
    });
    
    // ============= PHASE 5-6: GRACEFUL SHUTDOWN =============
    // Properly close Redis, rate limiter Redis, and MongoDB connections on shutdown
    const gracefulShutdown = async (signal) => {
        logger.info(`\n\n⚠️  ${signal} recibido. Iniciando apagado controlado...`);
        
        try {
            logger.info('   → Cerrando rate limiter Redis...');
            await closeRateLimitRedis();
            logger.info('   → Cerrando Redis cache...');
            await closeRedis();
            logger.info('   → Desconectando MongoDB...');
            await mongoose.disconnect();
            logger.info('\n✅ Apagado controlado completado exitosamente\n');
            process.exit(0);
        } catch (error) {
            logger.error('\n❌ Error durante el apagado:', error.message);
            process.exit(1);
        }
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

