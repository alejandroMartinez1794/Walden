/**
 * ARCO Monitoring & Alerting Configuration
 * 
 * Sets up Datadog and Sentry monitoring for ARCO workflow operations.
 * Includes:
 * - Soft-delete cascade metrics
 * - Query performance tracking
 * - Hard-delete attempt detection (should be 0)
 * - Legal hold violation detection
 * - ARCO request lifecycle tracking
 */

import StatsD from 'node-dogstatsd';
import { CacheConfig } from 'datadog-api-client';
import Sentry from '@sentry/node';

const datadog = StatsD.StatsD || StatsD.default;

// ===== DATADOG INITIALIZATION =====
export const initializeDatadogMonitoring = () => {
  const ddClient = new datadog({
    host: process.env.DATADOG_AGENT_HOST || 'localhost',
    port: process.env.DATADOG_AGENT_PORT || 8125,
    prefix: 'basileia.arco.',
  });

  console.log('✅ Datadog StatsD client initialized');
  return ddClient;
};

// ===== CUSTOM METRICS =====

/**
 * Record ARCO operation metric
 * Tracks: operation type, success/failure, latency, request type
 */
export const recordDatadogMetric = (ddClient, {
  operation,
  outcome,
  durationMs,
  requestType,
  userId,
  tags = {},
}) => {
  if (!ddClient) return;

  const baseTags = [
    `operation:${operation}`,
    `outcome:${outcome}`,
    `request_type:${requestType}`,
    ...Object.entries(tags).map(([k, v]) => `${k}:${v}`),
  ];

  // Metric 1: Operation latency (histogram)
  ddClient.histogram('operation.latency_ms', durationMs, baseTags);

  // Metric 2: Operation count (counter)
  ddClient.increment('operation.count', 1, baseTags);

  // Metric 3: Success/failure rate
  if (outcome === 'success') {
    ddClient.increment('operation.success', 1, baseTags);
  } else {
    ddClient.increment('operation.failure', 1, baseTags);
  }

  // Metric 4: Request type distribution
  ddClient.increment(`request_type.${requestType.toLowerCase()}`, 1);
};

/**
 * Track soft-delete cascade operations
 * Monitors: records deleted, cascade depth, duration
 */
export const recordSoftDeleteMetric = (ddClient, {
  recordCount,
  entityTypes,
  durationMs,
  userId,
  requestId,
}) => {
  if (!ddClient) return;

  const tags = [
    `entity_count:${entityTypes.length}`,
    `request_id:${requestId}`,
  ];

  ddClient.histogram('soft_delete.cascade_records', recordCount, tags);
  ddClient.histogram('soft_delete.cascade_duration_ms', durationMs, tags);
  ddClient.increment('soft_delete.cascade_operations', 1, tags);
};

/**
 * Track rectification operations
 * Monitors: records updated, fields modified, merge conflicts
 */
export const recordRectificationMetric = (ddClient, {
  recordsApplied,
  recordsSkipped,
  durationMs,
  entityTypes,
  requestId,
}) => {
  if (!ddClient) return;

  const tags = [`request_id:${requestId}`];

  ddClient.histogram('rectification.applied_count', recordsApplied, tags);
  ddClient.histogram('rectification.skipped_count', recordsSkipped, tags);
  ddClient.histogram('rectification.duration_ms', durationMs, tags);
  ddClient.increment('rectification.operations', 1, tags);

  // Track which entity types were modified
  entityTypes.forEach(type => {
    ddClient.increment(`rectification.entity_type.${type}`, 1);
  });
};

/**
 * Track export bundle generation
 * Monitors: bundle size, section counts, data sensitivity
 */
export const recordExportBundleMetric = (ddClient, {
  bundleSize,
  sections,
  durationMs,
  requestId,
  fieldsFiltered,
}) => {
  if (!ddClient) return;

  const tags = [
    `request_id:${requestId}`,
    `sections:${Object.keys(sections).length}`,
  ];

  ddClient.histogram('export_bundle.size_bytes', bundleSize, tags);
  ddClient.histogram('export_bundle.generation_ms', durationMs, tags);
  ddClient.increment('export_bundle.generated', 1, tags);

  // Track section distributions
  Object.entries(sections).forEach(([section, data]) => {
    const recordCount = Array.isArray(data) ? data.length : Object.keys(data).length;
    ddClient.gauge(`export_bundle.section.${section}.count`, recordCount);
  });

  if (fieldsFiltered > 0) {
    ddClient.gauge('export_bundle.fields_filtered', fieldsFiltered, tags);
  }
};

/**
 * CRITICAL: Track hard-delete attempts (should be 0 in production)
 * This is a safety net — any hard-delete should trigger urgent alerts
 */
export const recordHardDeleteAttempt = (ddClient, {
  collectionName,
  documentId,
  attemptedBy,
  timestamp,
}) => {
  if (!ddClient) return;

  const tags = [
    `collection:${collectionName}`,
    `attempted_by:${attemptedBy}`,
  ];

  // Increment hard-delete attempt counter (CRITICAL ALERT should fire on any increase)
  ddClient.increment('hard_delete.attempts', 1, tags);

  // Record as event for investigation
  ddClient.event({
    title: '🚨 CRITICAL: Hard-Delete Attempt Detected',
    text: `Hard-delete attempt on ${collectionName} (ID: ${documentId}) by ${attemptedBy}`,
    alert_type: 'error',
    tags: [...tags, 'severity:critical'],
    timestamp: Math.floor(timestamp.getTime() / 1000),
  });

  // Also send to Sentry for logging
  Sentry.captureEvent({
    message: 'Hard-delete attempt detected',
    level: 'error',
    extra: {
      collectionName,
      documentId,
      attemptedBy,
      timestamp,
    },
    tags: {
      compliance: 'arco',
      severity: 'critical',
    },
  });
};

/**
 * Track legal hold violations
 * Monitors: attempts to modify documents marked with legalHold=true
 */
export const recordLegalHoldViolation = (ddClient, {
  collectionName,
  documentId,
  attemptedBy,
  attemptedField,
  timestamp,
}) => {
  if (!ddClient) return;

  const tags = [
    `collection:${collectionName}`,
    `field:${attemptedField}`,
    `attempted_by:${attemptedBy}`,
  ];

  ddClient.increment('legal_hold.violations', 1, tags);

  // Send to Sentry
  Sentry.captureException(new Error('Legal hold violation attempted'), {
    level: 'error',
    extra: {
      collectionName,
      documentId,
      attemptedBy,
      attemptedField,
      timestamp,
    },
    tags: {
      compliance: 'legal_hold',
      severity: 'high',
    },
  });
};

/**
 * Track ARCO request lifecycle
 * Monitors: request creation, approval, rejection, execution
 */
export const recordARCORequestMetric = (ddClient, {
  requestId,
  requestType,
  event, // 'created', 'approved', 'rejected', 'executed'
  subjectUserId,
  reviewer,
  executionTime,
}) => {
  if (!ddClient) return;

  const tags = [
    `request_type:${requestType}`,
    `event:${event}`,
    `request_id:${requestId}`,
  ];

  ddClient.increment('arco_request.lifecycle', 1, tags);

  if (executionTime) {
    ddClient.histogram('arco_request.execution_time_ms', executionTime, tags);
  }

  // Track workflow completion time
  if (event === 'executed') {
    ddClient.increment('arco_request.completed', 1, [`request_type:${requestType}`]);
  }
};

// ===== RECOMMENDED DATADOG MONITORS =====

/**
 * These monitors should be created in Datadog UI or via Terraform.
 * This is the configuration reference for the ops team.
 */
export const RECOMMENDED_MONITORS = {
  hardDeleteAttempts: {
    name: '🚨 CRITICAL: ARCO Hard-Delete Attempt',
    type: 'metric alert',
    query: 'avg:basileia.arco.hard_delete.attempts{*} >= 1',
    thresholds: {
      critical: 1,
    },
    message: '@pagerduty Hard-delete attempt detected on {{host}}. This indicates a potential security breach. Investigate immediately.',
    priority: 'CRITICAL',
  },

  slowARCOQueries: {
    name: '⚠️ ARCO Operation Latency Spike',
    type: 'metric alert',
    query: 'avg:basileia.arco.operation.latency_ms{operation:*} >= 500',
    thresholds: {
      warning: 300,
      critical: 500,
    },
    message: 'ARCO {{operation}} latency is degraded ({{value}}ms). Check database load and query performance.',
    priority: 'HIGH',
  },

  softDeleteBacklog: {
    name: '⚠️ Soft-Delete Backlog Growing',
    type: 'metric alert',
    query: 'avg:basileia.arco.soft_delete.cascade_records{*} >= 10000',
    thresholds: {
      warning: 5000,
      critical: 10000,
    },
    message: 'Soft-deleted record count is accumulating. Consider a cleanup job.',
    priority: 'MEDIUM',
  },

  legalHoldViolations: {
    name: '🚨 Legal Hold Violation Attempt',
    type: 'metric alert',
    query: 'avg:basileia.arco.legal_hold.violations{*} >= 1',
    thresholds: {
      critical: 1,
    },
    message: '@security Legal hold violation detected on {{collection}} by {{attempted_by}}. Immediate investigation required.',
    priority: 'CRITICAL',
  },

  arcoRequestFailures: {
    name: '⚠️ ARCO Request Processing Failures',
    type: 'metric alert',
    query: 'avg:basileia.arco.operation.failure{request_type:*} >= 5',
    thresholds: {
      warning: 3,
      critical: 5,
    },
    message: 'ARCO {{request_type}} requests are failing. Check controller logs.',
    priority: 'HIGH',
  },
};

// ===== SENTRY BREADCRUMBS FOR ARCO OPERATIONS =====

export const recordSentryBreadcrumb = ({
  operation,
  requestId,
  requestType,
  outcome,
  metadata,
}) => {
  Sentry.addBreadcrumb({
    category: 'arco.workflow',
    level: outcome === 'failure' ? 'error' : 'info',
    message: `ARCO ${operation} (${requestType}) - ${outcome}`,
    data: {
      requestId,
      ...metadata,
    },
    timestamp: Date.now() / 1000,
  });
};

// ===== EXPORT FOR INTEGRATION =====

export default {
  initializeDatadogMonitoring,
  recordDatadogMetric,
  recordSoftDeleteMetric,
  recordRectificationMetric,
  recordExportBundleMetric,
  recordHardDeleteAttempt,
  recordLegalHoldViolation,
  recordARCORequestMetric,
  recordSentryBreadcrumb,
  RECOMMENDED_MONITORS,
};
