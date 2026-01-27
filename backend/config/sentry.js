/**
 * Sentry Error Tracking Configuration
 * 
 * Student Pack: 50,000 errores/mes gratis mientras seas estudiante
 * Valor normal: Aprox $26/mes
 * Docs: https://docs.sentry.io/platforms/node/guides/express/
 */

import * as Sentry from '@sentry/node';

// Conditional import: only load profiling in non-test environments
let ProfilingIntegration;
if (process.env.NODE_ENV !== 'test') {
  const profilingModule = await import('@sentry/profiling-node');
  ProfilingIntegration = profilingModule.ProfilingIntegration;
}

/**
 * Initialize Sentry SDK
 * MUST be called before any other code
 */
export function initSentry(app) {
  // Skip if no DSN provided or in test environment
  if (!process.env.SENTRY_DSN || process.env.NODE_ENV === 'test') {
    // Sentry disabled (test environment or no DSN configured)
    return;
  }

  const integrations = [
    // Express instrumentation
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new Sentry.Integrations.Mongo(),
    
    // Context and debugging
    new Sentry.Integrations.Context(),
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection({ mode: 'warn' }),
  ];

  // Add profiling only in non-test environments
  if (ProfilingIntegration) {
    integrations.push(new ProfilingIntegration());
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    
    // Environment configuration
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version || '1.0.0',
    
    // Performance monitoring (APM)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Integrations
    integrations,
    
    // Performance configuration
    tracing: {
      // Track MongoDB queries
      mongoose: true,
      // Track HTTP requests
      http: true,
    },
    
    // Before sending events
    beforeSend(event, hint) {
      // Filter sensitive data
      if (event.request) {
        // Remove auth headers
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
        
        // Sanitize query params
        if (event.request.query_string) {
          // Remove tokens from query params
          event.request.query_string = event.request.query_string
            .replace(/token=[^&]+/gi, 'token=[FILTERED]')
            .replace(/api_key=[^&]+/gi, 'api_key=[FILTERED]');
        }
      }
      
      // Filter out expected errors in development
      if (process.env.NODE_ENV === 'development') {
        const error = hint?.originalException;
        if (error && typeof error === 'object' && 'statusCode' in error) {
          const statusCode = error.statusCode;
          // Don't report validation errors (400) in dev
          if (statusCode === 400 || statusCode === 401 || statusCode === 404) {
            return null;
          }
        }
      }
      
      return event;
    },
    
    // Breadcrumbs configuration
    maxBreadcrumbs: 50,
    
    // Ignore certain errors
    ignoreErrors: [
      // Common HTTP errors
      'Non-Error promise rejection captured',
      'Network request failed',
      'timeout of 0ms exceeded',
      // JWT errors (expected in auth flow)
      'JsonWebTokenError',
      'TokenExpiredError',
      // Validation errors (expected)
      'ValidationError',
    ],
  });

  // Sentry initialized (check Sentry dashboard for events)
}

/**
 * Express request handler middleware
 * Must be added BEFORE all routes
 */
export const sentryRequestHandler = () => {
  if (process.env.NODE_ENV === 'test') {
    return (req, res, next) => next(); // No-op in tests
  }
  return Sentry.Handlers.requestHandler();
};

/**
 * Express tracing handler middleware
 * Must be added BEFORE all routes but AFTER request handler
 */
export const sentryTracingHandler = () => {
  if (process.env.NODE_ENV === 'test') {
    return (req, res, next) => next(); // No-op in tests
  }
  return Sentry.Handlers.tracingHandler();
};

/**
 * Express error handler middleware
 * Must be added AFTER all routes
 */
export const sentryErrorHandler = () => {
  if (process.env.NODE_ENV === 'test') {
    return (err, req, res, next) => next(err); // No-op in tests
  }
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all 5xx errors
      if (error.status >= 500) {
        return true;
      }
      // Capture unhandled errors
      if (!error.status) {
        return true;
      }
      return false;
    },
  });
};

/**
 * Manually capture exceptions
 * Use when you want to report an error but not crash the app
 */
export function captureException(error, context = {}) {
  Sentry.captureException(error, {
    tags: context.tags,
    extra: context.extra,
    level: context.level || 'error',
  });
}

/**
 * Add breadcrumb for debugging
 * Useful for tracking user actions before errors
 */
export function addBreadcrumb(message, category = 'action', level = 'info', data = {}) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set user context for better error tracking
 * Call this after user authentication
 */
export function setUserContext(user) {
  if (!user) {
    Sentry.setUser(null);
    return;
  }
  
  Sentry.setUser({
    id: user._id || user.id,
    email: user.email,
    role: user.role,
    // Don't send sensitive data
  });
}

/**
 * Clear user context on logout
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Capture custom message
 * Use for important events or warnings
 */
export function captureMessage(message, level = 'info', context = {}) {
  Sentry.captureMessage(message, {
    level,
    tags: context.tags,
    extra: context.extra,
  });
}

export default Sentry;

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Get Sentry DSN from GitHub Student Pack:
 *    - Go to: https://sentry.io/signup/
 *    - Connect GitHub account
 *    - Create new project (Platform: Express)
 *    - Copy DSN from Settings → Client Keys
 * 
 * 2. Add to .env:
 *    SENTRY_DSN=https://your_key@o123456.ingest.sentry.io/123456
 * 
 * 3. In index.js (AFTER New Relic):
 *    import { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from './config/sentry.js';
 *    
 *    const app = express();
 *    initSentry(app);
 *    
 *    app.use(sentryRequestHandler());
 *    app.use(sentryTracingHandler());
 *    
 *    // ... your routes ...
 *    
 *    app.use(sentryErrorHandler());
 * 
 * 4. Usage examples:
 *    - Automatic: All uncaught errors are captured
 *    - Manual: captureException(error, { tags: { feature: 'booking' } })
 *    - User context: setUserContext(req.user) after auth
 *    - Breadcrumbs: addBreadcrumb('User clicked book appointment', 'ui')
 */
