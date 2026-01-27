/**
 * New Relic Configuration (CommonJS format required)
 * 
 * This file is auto-loaded by the New Relic agent
 * DO NOT import this file directly - it's used automatically
 */

'use strict'

exports.config = {
  /**
   * Application name in New Relic dashboard
   */
  app_name: [process.env.NEW_RELIC_APP_NAME || 'Psiconepsis API'],
  
  /**
   * License key from New Relic account
   * Get it from: https://one.newrelic.com/ → Account settings → License keys
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY || 'your_license_key_here',
  
  /**
   * Logging configuration
   */
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'trace',
    filepath: './logs/newrelic_agent.log',
  },
  
  /**
   * Capture all request headers
   */
  allow_all_headers: true,
  
  /**
   * Distributed tracing (tracks requests across services)
   */
  distributed_tracing: {
    enabled: true,
  },
  
  /**
   * Transaction tracer (monitors slow endpoints)
   */
  transaction_tracer: {
    transaction_threshold: 500, // ms
    enabled: true,
    record_sql: process.env.NODE_ENV === 'production' ? 'obfuscated' : 'raw',
    explain_threshold: 500, // ms
  },
  
  /**
   * Error collector
   */
  error_collector: {
    enabled: true,
    ignore_status_codes: [400, 401, 404], // Don't report these as errors
    capture_attributes: true,
  },
  
  /**
   * Browser monitoring (disabled for API-only backend)
   */
  browser_monitoring: {
    enable: false,
  },
  
  /**
   * Application logging (forwards logs to New Relic)
   */
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
  
  /**
   * Custom instrumentation settings
   */
  instrumentation: {
    '@prisma/client': {
      enabled: false, // Not using Prisma
    },
  },
}
