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
} from './utils/rateLimiter.js';
import { isRedisAvailable } from './utils/cache.js';
import { verifyCsrf } from './utils/csrf.js';
import logger from './utils/logger.js';

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
import clinicalTreatmentRoutes from './Routes/clinical/treatment.js';
import clinicalAlertRoutes from './Routes/clinical/alerts.js';
import clinicalProtocolRoutes from './Routes/clinical/protocols.js';

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

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

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

  if (process.env.USE_HTTPS === 'true') {
    app.use(forceHTTPS);
    app.use(additionalSecurityHeaders);
  }

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          scriptSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(mongoSanitize());

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
          userAgent: req.get('user-agent'),
        });
      });
      next();
    });

    app.use('/api', apiRateLimiter);
    app.use('/api/v1/auth/login', authRateLimiter);
    app.use('/api/v1/auth/register', authRateLimiter);
    app.use('/api/v1/auth/forgot-password', passwordResetRateLimiter);
    app.use('/api/v1/auth/reset-password', passwordResetRateLimiter);
    app.use('/api/v1/bookings', strictRateLimiter);
    app.use('/api/v1/calendar/create-event', strictRateLimiter);
    app.use('/api/v1/calendar/update-event', strictRateLimiter);
  }

  app.get('/', (req, res) => {
    res.send('La gente, la gente!');
  });

  app.get('/health', async (req, res) => {
    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        redis: isRedisAvailable() ? 'connected' : 'not-configured',
      },
    };

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json(healthCheck);
    }

    return res.status(200).json(healthCheck);
  });

  app.get('/ping', (req, res) => {
    res.status(200).send('pong');
  });

  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
  }

  app.use('/api/v1/auth', authRoute);
  app.use('/api/v1/users', userRoute);
  app.use('/api/v1/doctors', doctorRoute);
  app.use('/api/v1/reviews', reviewRoute);
  app.use('/api/v1/calendar', calendarRoutes);
  app.use('/api/v1/bookings', bookingRoute);
  app.use('/api/v1/psychology', psychologyRoute);
  app.use('/api/v1/health', healthRoute);
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
}
