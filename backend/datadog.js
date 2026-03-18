// backend/datadog.js
import tracer from 'dd-trace';

// Datadog APM Initialization
// MUST be loaded before any other modules (express, http, pg, etc)
tracer.init({
  logInjection: true,
  env: process.env.NODE_ENV || 'production',
  service: 'basileia-api',
  // Evitar que el tracer falle si no encuentra el agente en desarrollo local
  startupLogs: false
});

export default tracer;
