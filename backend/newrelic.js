/**
 * New Relic Agent Configuration
 * 
 * Student Pack: Gratis mientras seas estudiante
 * Valor: $300/mes
 * Docs: https://docs.newrelic.com/docs/apm/agents/nodejs-agent
 * 
 * IMPORTANT: New Relic disabled in test environment (NODE_ENV=test)
 */

// Skip New Relic initialization in test environment or if not configured
if (process.env.NODE_ENV === 'test' || !process.env.NEW_RELIC_LICENSE_KEY || !process.env.NEW_RELIC_APP_NAME) {
  // New Relic disabled (test environment or not configured)
} else {
  // Only import and configure New Relic in non-test environments
  const newrelic = await import('newrelic');
  // New Relic initialized (check logs/newrelic_agent.log for details)
}

export default {};

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. This file MUST be loaded BEFORE any other modules in index.js
 *    Correct: import './newrelic.js'; import express from 'express';
 *    Wrong:   import express from 'express'; import './newrelic.js';
 * 
 * 2. In test environment (NODE_ENV=test), New Relic is disabled automatically
 * 
 * 3. Create newrelic.cjs configuration file in backend/ directory with:
 */

/*
// newrelic.cjs (CommonJS format required by New Relic)
'use strict'

exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || 'Basileiás API'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY || 'your_license_key_here',
  
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'trace',
    filepath: './logs/newrelic_agent.log',
  },
  
  allow_all_headers: true,
  
  distributed_tracing: {
    enabled: true,
  },
  
  transaction_tracer: {
    transaction_threshold: 500,
    enabled: true,
    record_sql: process.env.NODE_ENV === 'production' ? 'obfuscated' : 'raw',
    explain_threshold: 500,
  },
  
  error_collector: {
    enabled: true,
    ignore_status_codes: [400, 401, 404],
    capture_attributes: true,
  },
  
  browser_monitoring: {
    enable: false,
  },
  
  application_logging: {
    enabled: true,
    forwarding: {
      enabled: true,
      max_samples_stored: 10000,
    },
    metrics: {
      enabled: true,
    },
    local_decorating: {
      enabled: false,
    },
  },
}
*/

/**
 * 4. License key should be set in .env file:
 *    NEW_RELIC_LICENSE_KEY=your_key_here
 *    NEW_RELIC_APP_NAME=Basileiás API
 * 
 * 5. To activate Student Pack:
 *    - Go to: https://newrelic.com/students
 *    - Connect GitHub account
 *    - Get license key from New Relic One
 * 
 * 6. Automatic instrumentation includes:
 *    - Express.js routes and middleware
 *    - MongoDB/Mongoose queries
 *    - HTTP/HTTPS requests (axios, fetch)
 *    - Errors and exceptions
 *    - Memory and CPU usage
 */
