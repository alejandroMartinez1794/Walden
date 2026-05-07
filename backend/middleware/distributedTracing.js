/**
 * 📍 DISTRIBUTED TRACING MIDDLEWARE
 * 
 * Implements W3C Trace Context propagation
 * Correlates requests between frontend and backend
 */

import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

/**
 * Generates a new trace ID if not present
 */
const generateTraceId = () => {
  return uuidv4().replace(/-/g, '');
};

/**
 * Generates a new span ID
 */
const generateSpanId = () => {
  return uuidv4().replace(/-/g, '').substring(0, 16);
};

/**
 * Parses traceparent header
 * Format: {version}-{trace-id}-{span-id}-{trace-flags}
 */
const parseTraceparent = (traceparent) => {
  if (!traceparent) return null;
  
  const parts = traceparent.split('-');
  if (parts.length !== 4) return null;
  
  const [version, traceId, spanId, traceFlags] = parts;
  return { version, traceId, spanId, traceFlags };
};

/**
 * Creates traceparent header
 */
const createTraceparent = (traceId, spanId, traceFlags = '01') => {
  return `00-${traceId}-${spanId}-${traceFlags}`;
};

/**
 * Distributed Tracing Middleware
 */
export const distributedTracing = (req, res, next) => {
  // Extract traceparent from incoming request
  const incomingTraceparent = req.headers.traceparent || req.headers['x-traceparent'];
  let traceId, spanId;
  
  if (incomingTraceparent) {
    // Parse existing traceparent
    const parsed = parseTraceparent(incomingTraceparent);
    if (parsed) {
      traceId = parsed.traceId;
      spanId = generateSpanId(); // Generate new span ID for this service
    }
  }
  
  // If no traceparent, generate new trace
  if (!traceId) {
    traceId = generateTraceId();
    spanId = generateSpanId();
  }
  
  // Create new traceparent for this service
  const traceparent = createTraceparent(traceId, spanId);
  
  // Get request ID (either from header or generate)
  const requestId = req.headers['x-request-id'] || generateSpanId();
  
  // Add trace information to request object
  req.traceId = traceId;
  req.spanId = spanId;
  req.requestId = requestId;
  
  // Add traceparent to response headers
  res.setHeader('traceparent', traceparent);
  res.setHeader('x-request-id', requestId);
  
  // Add trace info to response locals for later use
  res.locals.traceId = traceId;
  res.locals.requestId = requestId;
  
  // Enhance logger with trace context
  req.logger = logger.child({
    traceId,
    requestId,
    method: req.method,
    url: req.url,
    userId: req.userId || null,  // Will be populated by auth middleware
    role: req.role || null       // Will be populated by auth middleware
  });
  
  // Log the start of the request
  req.logger.debug('Request started');
  
  // Capture start time for response time calculation
  const startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    
    // Add response time header if headers not already sent
    try {
      if (!res.headersSent) {
        res.setHeader('X-Response-Time', `${duration}ms`);
      }
    } catch (e) {
      // ignore header set errors
    }
    
    // Log completion
    req.logger.info('Request completed', {
      statusCode: res.statusCode,
      durationMs: duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    // Record response time in metrics
    import('../services/ClinicalMetricsService.js').then(({ clinicalMetricsService }) => {
      clinicalMetricsService.recordResponseTime(duration);
    });
    
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Middleware to add user context to trace
 */
export const addUserContext = (req, res, next) => {
  // This would be called after authentication
  if (req.user) {
    req.logger = req.logger.child({
      userId: req.user._id,
      role: req.user.role
    });
    
    // Add user to active users in metrics
    import('../services/ClinicalMetricsService.js').then(({ clinicalMetricsService }) => {
      if (req.user.role === 'paciente' || req.user.role === 'patient') {
        clinicalMetricsService.addActivePatient(req.user._id);
      } else if (req.user.role === 'doctor') {
        clinicalMetricsService.addActiveDoctor(req.user._id);
      }
    });
  }
  
  next();
};

/**
 * Utility function to log with trace context
 */
export const logWithTrace = (req, level, message, meta = {}) => {
  if (!req.logger) {
    logger[level](message, meta);
    return;
  }
  
  req.logger[level](message, meta);
};

export default distributedTracing;