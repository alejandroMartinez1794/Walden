// backend/datadog.js
let tracer = null;

// Mock tracer para tests
const mockTracer = {
  trace: (...args) => {
    const callback = args.findLast((arg) => typeof arg === 'function');
    return callback ? callback() : undefined;
  },
  setTag: () => {},
  addTags: () => {},
  getSpan: () => ({ setTag: () => {}, addTags: () => {}, finish: () => {} }),
  startSpan: () => ({ setTag: () => {}, addTags: () => {}, finish: () => {} }),
};

// Datadog APM Initialization
// MUST be loaded before any other modules (express, http, pg, etc)
if (process.env.NODE_ENV !== 'test') {
  const ddTrace = await import('dd-trace');
  tracer = ddTrace.default;

  tracer.init({
    logInjection: true,
    env: process.env.NODE_ENV || 'production',
    service: 'basileia-api',
    // Evitar que el tracer falle si no encuentra el agente en desarrollo local
    startupLogs: false
  });
} else {
  // Use mock tracer in tests to prevent null reference errors
  tracer = mockTracer;
}

export default tracer;
