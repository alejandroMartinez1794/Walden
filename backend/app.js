import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import compression from 'compression';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

import {
  initSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
} from './config/sentry.js';
import { forceHTTPS, additionalSecurityHeaders } from './config/https.js';
import { setupSwagger } from './config/swagger.js';
import {
  authRateLimiter,
  passwordResetRateLimiter,
  apiRateLimiter,
  strictRateLimiter,
  createCustomRateLimiter
} from './utils/rateLimiter.js';
import { isRedisAvailable } from './utils/cache.js';
import { verifyCsrf } from './utils/csrf.js';
import logger from './utils/logger.js';
import { distributedTracing, addUserContext } from './middleware/distributedTracing.js';  // NEW: Import tracing middleware

import authRoute from './Routes/auth.js';
import userRoute from './Routes/user.js';
import doctorRoute from './Routes/doctor.js';
import reviewRoute from './Routes/review.js';
import calendarRoutes from './Routes/calendar.js';
import bookingRoute from './Routes/booking.js';
import psychologyRoute from './Routes/psychology.js';
import healthRoute from './Routes/health.js';  // Health routes import
import healthProbesRoute from './Routes/healthProbes.js';  // NEW: Health probes import
import clinicalRoutes from './Routes/clinical.js';
import clinicalArcoRoutes from './Routes/clinical/arco.js';
import twoFactorRoutes from './Routes/2fa.js';
import paymentRoutes from './Routes/payment.js';
import clinicalTreatmentRoutes from './Routes/clinical/treatment.js';
import clinicalAlertRoutes from './Routes/clinical/alerts.js';
import clinicalProtocolRoutes from './Routes/clinical/protocols.js';
import internalRoutes from './Routes/internal.js';  // NEW: Import internal routes
import arcoRoutes from './Routes/arco.js';  // NEW: Import ARCO rights routes

function getCorsOptions() {
  const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0) {
        logger.warn(`Bloqueo CORS interceptado para: ${origin}. Variable CORS_ORIGINS no configurada.`);
        return callback(new Error('Bloqueado por politica estricta CORS'));
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  };
}

export function createApp() {
  const app = express();

  // Configurar trust proxy para entornos cloud (Heroku/Render/AWS ALB)
  // Ahora usando SECURITY_TIER para determinar si aplicar proxy
  const securityTier = process.env.SECURITY_TIER || 'dev';
  if (securityTier === 'staging' || securityTier === 'prod') {
    app.set('trust proxy', 1);  // Trust first proxy (Load Balancer/CDN)
  } else {
    app.set('trust proxy', false);
  }
  
  app.disable('x-powered-by');

  // NEW: Add distributed tracing middleware early in the stack
  app.use(distributedTracing);

  initSentry(app);
  app.use(sentryRequestHandler());
  app.use(sentryTracingHandler());

  app.use(cors(getCorsOptions()));
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      level: 6,
      threshold: 1024,
    })
  );

  // Aplicar HTTPS basado en SECURITY_TIER en lugar de NODE_ENV
  const useHTTPS = process.env.SECURITY_TIER && ['staging', 'prod'].includes(process.env.SECURITY_TIER);
  if (useHTTPS) {
    app.use(forceHTTPS);
    app.use(additionalSecurityHeaders);
  } else if (process.env.USE_HTTPS === 'true') {
    // Mantener compatibilidad con la variable existante
    app.use(forceHTTPS);
    app.use(additionalSecurityHeaders);
  }

  // Configurar Helmet con políticas de seguridad estrictas
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", "https:", "data:"],
          frameAncestors: ["'none'"],  // Similar a X-Frame-Options DENY
          imgSrc: ["'self'", "data:", "https:"],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          upgradeInsecureRequests: [],
        },
      },
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
      },
      hsts: {
        maxAge: 31536000,           // 1 year in seconds
        includeSubDomains: true,
        preload: true               // Enable preload
      },
      hidePoweredBy: true,
      ieNoOpen: true,
      noSniff: true,
    })
  );

  app.use(mongoSanitize());

  if (process.env.NODE_ENV !== 'test') {
    // NEW: Record request in metrics
    app.use((req, res, next) => {
      import('./services/ClinicalMetricsService.js').then(({ clinicalMetricsService }) => {
        clinicalMetricsService.recordRequest(req.path);
      });
      next();
    });

    // Middleware para logging de requests con contexto de traza
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const durationMs = Date.now() - start;
        
        logger.info('HTTP request', {
          method: req.method,
          path: req.originalUrl,
          status: res.statusCode,
          durationMs,
          traceId: req.traceId,      // NEW: Add trace ID to logs
          requestId: req.requestId,  // NEW: Add request ID to logs
          userId: req.userId,        // NEW: Add user ID if available
          role: req.role,            // NEW: Add role if available
          ip: req.ip,
          userAgent: req.get('user-agent'),
        });
      });
      next();
    });

    // Rate limiting adaptativo por tipo de ruta y rol
    app.use('/api', apiRateLimiter);
    
    // Auth endpoints - 3 req/5min - very strict
    app.use('/api/v1/auth/login', authRateLimiter); // Use the stricter limiter directly
    app.use('/api/v1/auth/register', authRateLimiter); // Apply same strict rate limiting to register
    app.use('/api/v1/auth/forgot-password', passwordResetRateLimiter); // Use dedicated password reset limiter
    app.use('/api/v1/auth/reset-password', passwordResetRateLimiter); // Use dedicated password reset limiter
    
    // Clinical endpoints - 100 req/min
    app.use('/api/v1/psychology', createCustomRateLimiter(100, 1, {
      success: false,
      message: 'Demasiadas solicitudes clínicas. Intente de nuevo en 1 minuto.'
    }));
    app.use('/api/v1/clinical', createCustomRateLimiter(100, 1, {
      success: false,
      message: 'Demasiadas solicitudes clínicas. Intente de nuevo en 1 minuto.'
    }));
    
    // Bookings and calendar - 20 req/hour (expensive operations)
    app.use('/api/v1/bookings', strictRateLimiter);
    app.use('/api/v1/calendar/create-event', createCustomRateLimiter(10, 60, {
      success: false,
      message: 'Demasiadas creaciones de eventos. Intente de nuevo en 1 hora.'
    }));
    app.use('/api/v1/calendar/update-event', createCustomRateLimiter(20, 60, {
      success: false,
      message: 'Demasiadas actualizaciones de eventos. Intente de nuevo en 1 hora.'
    }));
  }

  app.get('/', (req, res) => {
    res.send('La gente, la gente!');
  });

  // NEW: Dedicated health endpoints for orchestration
  app.get('/health/live', (req, res) => {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      pid: process.pid,
      environment: process.env.NODE_ENV || 'development',
      securityTier: process.env.SECURITY_TIER || 'dev'
    });
  });

  app.get('/health/ready', async (req, res) => {
    // Check if all dependencies are ready
    const dbReady = mongoose.connection.readyState === 1;
    const redisAvailable = process.env.REDIS_URL ? require('./utils/cache.js').isRedisAvailable() : true;
    
    if (dbReady && redisAvailable) {
      res.status(200).json({
        status: 'ready',
        checks: {
          database: dbReady ? 'connected' : 'disconnected',
          redis: redisAvailable ? 'available' : 'not-configured',
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not-ready',
        checks: {
          database: dbReady ? 'connected' : 'disconnected',
          redis: redisAvailable ? 'available' : 'not-configured',
        },
        timestamp: new Date().toISOString()
      });
    }
  });

  app.get('/ping', (req, res) => {
    res.status(200).send('pong');
  });

  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
  }

  // NEW: Add internal routes for metrics and operations
  app.use('/internal', internalRoutes);

  // NEW: Add ARCO rights routes
  app.use('/api/v1/legal', arcoRoutes);

  app.use('/api/v1/auth', authRoute);
  app.use('/api/v1/users', userRoute);
  app.use('/api/v1/doctors', doctorRoute);
  app.use('/api/v1/reviews', reviewRoute);
  app.use('/api/v1/calendar', calendarRoutes);
  app.use('/api/v1/bookings', bookingRoute);
  app.use('/api/v1/psychology', psychologyRoute);
  app.use('/api/v1/health', healthRoute);
  app.use('/health', healthProbesRoute);  // NEW: Add health probes routes
  app.use('/api/v1/clinical/arco', clinicalArcoRoutes);
  app.use('/api/v1/clinical', clinicalRoutes);
  app.use('/api/v1/clinical/treatment', clinicalTreatmentRoutes);
  app.use('/api/v1/clinical/alerts', clinicalAlertRoutes);
  app.use('/api/v1/clinical/protocols', clinicalProtocolRoutes);
  app.use('/api/v1/auth/2fa', twoFactorRoutes);
  app.use('/api/v1/payment', paymentRoutes);

  app.use((req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (req.path.startsWith('/api/v1/auth')) return next();

    const hasAuthHeader = req.headers.authorization?.startsWith('Bearer ');
    const hasCookieAuth = Boolean(req.cookies?.access_token);

    if (!hasCookieAuth || hasAuthHeader) return next();
    return verifyCsrf(req, res, next);
  });

  app.use(sentryErrorHandler());

  return app;
};

export default createApp();
