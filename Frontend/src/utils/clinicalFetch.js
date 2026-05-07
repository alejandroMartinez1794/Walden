/**
 * 📍 CLINICAL FETCH UTILITY
 * 
 * Client-side utility for making API requests with distributed tracing
 * Implements W3C Trace Context propagation between frontend and backend
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a trace ID
 */
const generateTraceId = () => {
  return uuidv4().replace(/-/g, '');
};

/**
 * Generates a span ID
 */
const generateSpanId = () => {
  return uuidv4().replace(/-/g, '').substring(0, 16);
};

/**
 * Creates traceparent header
 */
const createTraceparent = (traceId, spanId, traceFlags = '01') => {
  return `00-${traceId}-${spanId}-${traceFlags}`;
};

/**
 * Clinical Fetch - Enhanced fetch with tracing headers
 */
export const clinicalFetch = async (url, options = {}) => {
  // Get or create trace context
  let traceId = sessionStorage.getItem('traceId');
  if (!traceId) {
    traceId = generateTraceId();
    sessionStorage.setItem('traceId', traceId);
  }

  // Create new span for this request
  const spanId = generateSpanId();
  const traceparent = createTraceparent(traceId, spanId);

  // Get request ID or generate new one
  let requestId = sessionStorage.getItem('requestId') || generateSpanId();
  sessionStorage.setItem('requestId', requestId);

  // Prepare headers with tracing information
  const headers = {
    ...options.headers,
    'traceparent': traceparent,
    'X-Request-ID': requestId,
    'X-Clinical-Session': sessionStorage.getItem('clinicalSessionId') || 'unknown',
    'X-User-Agent': navigator.userAgent,
    'Content-Type': 'application/json',
  };

  // Get auth token if available
  const token = sessionStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Prepare fetch options
  const fetchOptions = {
    ...options,
    headers,
  };

  // Add timing information
  const startTime = Date.now();

  try {
    const response = await fetch(url, fetchOptions);
    const duration = Date.now() - startTime;

    // Log the request with timing
    console.groupCollapsed(`🔍 Clinical Fetch: ${options.method || 'GET'} ${url}`);
    console.log({
      url,
      method: options.method || 'GET',
      traceId,
      spanId,
      requestId,
      duration: `${duration}ms`,
      status: response.status,
      statusText: response.statusText,
    });
    console.groupEnd();

    // Report success metrics to clinical metrics service if available
    if (window.ClinicalMetrics) {
      window.ClinicalMetrics.recordApiCall({
        url,
        method: options.method || 'GET',
        status: response.status,
        duration,
        traceId,
        spanId,
        requestId
      });
    }

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log error with full context
    console.groupCollapsed(`🚨 Clinical Fetch ERROR: ${options.method || 'GET'} ${url}`);
    console.error({
      url,
      method: options.method || 'GET',
      traceId,
      spanId,
      requestId,
      duration: `${duration}ms`,
      error: error.message,
      stack: error.stack,
    });
    console.groupEnd();

    // Report error to clinical metrics service if available
    if (window.ClinicalMetrics) {
      window.ClinicalMetrics.recordApiError({
        url,
        method: options.method || 'GET',
        error: error.message,
        duration,
        traceId,
        spanId,
        requestId
      });
    }

    // Report error to error reporting service with clinical context
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          clinical: {
            traceId,
            requestId,
            spanId,
            url,
            method: options.method || 'GET',
            duration,
            userId: sessionStorage.getItem('userId') || 'unknown',
            role: sessionStorage.getItem('role') || 'unknown',
            clinicalSessionId: sessionStorage.getItem('clinicalSessionId') || 'unknown'
          }
        }
      });
    }

    throw error;
  }
};

/**
 * Clinical POST request
 */
export const clinicalPost = async (url, data) => {
  return clinicalFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Clinical GET request
 */
export const clinicalGet = async (url) => {
  return clinicalFetch(url, {
    method: 'GET',
  });
};

/**
 * Clinical PUT request
 */
export const clinicalPut = async (url, data) => {
  return clinicalFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * Clinical DELETE request
 */
export const clinicalDelete = async (url) => {
  return clinicalFetch(url, {
    method: 'DELETE',
  });
};

/**
 * Initialize clinical session tracking
 */
export const initializeClinicalSession = () => {
  // Create a new session ID if one doesn't exist
  if (!sessionStorage.getItem('clinicalSessionId')) {
    const sessionId = generateTraceId();
    sessionStorage.setItem('clinicalSessionId', sessionId);
    
    console.log('🏥 Clinical session initialized', { sessionId });
  }
  
  // Add event listeners to track navigation and errors
  window.addEventListener('beforeunload', () => {
    // Clean up session data if needed
    const sessionId = sessionStorage.getItem('clinicalSessionId');
    console.log('🏥 Clinical session ending', { sessionId });
  });
  
  // Capture unhandled errors with clinical context
  window.addEventListener('error', (event) => {
    if (window.Sentry) {
      window.Sentry.captureException(event.error, {
        contexts: {
          clinical: {
            traceId: sessionStorage.getItem('traceId') || 'unknown',
            requestId: sessionStorage.getItem('requestId') || 'unknown',
            clinicalSessionId: sessionStorage.getItem('clinicalSessionId') || 'unknown',
            url: window.location.href,
            userAgent: navigator.userAgent,
            userId: sessionStorage.getItem('userId') || 'unknown',
            role: sessionStorage.getItem('role') || 'unknown'
          }
        }
      });
    }
  });
  
  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (window.Sentry) {
      window.Sentry.captureException(event.reason, {
        contexts: {
          clinical: {
            traceId: sessionStorage.getItem('traceId') || 'unknown',
            requestId: sessionStorage.getItem('requestId') || 'unknown',
            clinicalSessionId: sessionStorage.getItem('clinicalSessionId') || 'unknown',
            url: window.location.href,
            userAgent: navigator.userAgent,
            userId: sessionStorage.getItem('userId') || 'unknown',
            role: sessionStorage.getItem('role') || 'unknown'
          }
        }
      });
    }
  });
};

export default clinicalFetch;