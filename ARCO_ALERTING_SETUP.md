# ARCO Datadog & Sentry Alerting Setup Guide

**Status**: Phase 4.2 Implementation  
**Objective**: Monitor ARCO workflow for security, performance, and compliance violations  

---

## Overview

This guide covers setting up **production-grade monitoring** for ARCO operations using Datadog and Sentry. The setup includes:

- ✅ **Critical Alerts**: Hard-delete attempts, legal hold violations
- ✅ **Performance Alerts**: Slow queries, latency spikes
- ✅ **Operational Alerts**: Request failures, soft-delete backlog
- ✅ **Compliance Logging**: Full audit trail in Sentry

---

## Quick Start: Critical Alerts (Must Set Up First)

### 1. Hard-Delete Attempt Alert (CRITICAL)

**Why**: Hard-deletes should be 0 in production. Any hard-delete is a compliance violation.

**Setup in Datadog UI**:
1. Go to **Monitors → New Monitor → Metric**
2. **Metric Query**: `avg:basileia.arco.hard_delete.attempts{*} >= 1`
3. **Alert Condition**: Alert when >= 1 (any hard-delete)
4. **Notification**: `@pagerduty` + `@security-team`
5. **Message**:
   ```
   🚨 CRITICAL: Hard-delete attempt detected!
   
   Collection: {{tags.collection}}
   Document ID: {{tags.document_id}}
   Attempted by: {{tags.attempted_by}}
   Timestamp: {{timestamp}}
   
   This indicates potential security breach or compliance violation.
   Investigate immediately. Do not dismiss without approval.
   ```

**Terraform** (if using IaC):
```hcl
resource "datadog_monitor" "arco_hard_delete_attempt" {
  name            = "🚨 CRITICAL: ARCO Hard-Delete Attempt"
  type            = "metric alert"
  query           = "avg:basileia.arco.hard_delete.attempts{*} >= 1"
  priority        = 1  # CRITICAL
  notify_no_data  = true
  renotify_interval = 60  # Re-notify every 60 mins if still alerting

  thresholds = {
    critical = 1
  }

  notification_preset_name = "default_with_pagerduty"

  message = <<-EOT
    🚨 CRITICAL: Hard-delete attempt detected!
    Requested by: {{tags.attempted_by}}
    Collection: {{tags.collection}}
    @pagerduty @security-team
  EOT
}
```

---

### 2. Legal Hold Violation Alert (CRITICAL)

**Why**: Legal holds prevent modification of documents. Violations indicate tampering.

**Setup in Datadog UI**:
1. **Metric Query**: `avg:basileia.arco.legal_hold.violations{*} >= 1`
2. **Alert Condition**: Alert immediately
3. **Notification**: `@security-team` + `@compliance-officer`
4. **Message**:
   ```
   🚨 CRITICAL: Legal Hold Violation Attempt!
   
   Collection: {{tags.collection}}
   Attempted Field: {{tags.field}}
   Attempted by: {{tags.attempted_by}}
   
   Someone tried to modify a document under legal hold.
   This is a compliance violation. Escalate to Legal Dept.
   ```

---

## Performance Alerts (Set Up Second)

### 3. Slow ARCO Queries Alert

**Threshold**: Alert when P95 latency > 500ms (10x our baseline)

**Setup in Datadog UI**:
```
Metric Query: avg:basileia.arco.operation.latency_ms{*}
Thresholds:
  - Warning: >= 300ms
  - Critical: >= 500ms
Message:
  ARCO {{operation}} latency degraded ({{value}}ms)
  Check: Database load, query indices, network latency
```

**Expected Baseline**:
- P50: 5-15ms
- P95: 30-50ms
- P99: 50-100ms

If exceeding these, investigate:
- MongoDB index usage (run `db.collection.explain()`)
- Network latency (add APM spans)
- Database connection pool exhaustion

---

### 4. Operation Failure Rate Alert

**Threshold**: Alert when > 3% of operations fail

**Setup in Datadog UI**:
```
Metric Query: 
  avg:basileia.arco.operation.failure{*} / 
  (avg:basileia.arco.operation.success{*} + avg:basileia.arco.operation.failure{*})
  >= 0.03

Thresholds:
  - Warning: >= 0.02 (2%)
  - Critical: >= 0.05 (5%)
```

---

## Operational Alerts (Set Up Third)

### 5. Soft-Delete Backlog Alert

**Why**: Many soft-deleted records can slow down queries over time.

**Setup in Datadog UI**:
```
Metric Query: avg:basileia.arco.soft_delete.cascade_records{*}
Thresholds:
  - Warning: >= 5000
  - Critical: >= 10000
Message:
  Soft-deleted record backlog is growing.
  Consider running: db.MedicalRecord.deleteMany({ isDeleted: true, deletedAt: { $lt: Date.now() - 30days } })
```

---

## Sentry Setup (Breadcrumb Logging)

Every ARCO operation is logged to Sentry for post-incident analysis.

### Step 1: Initialize Sentry in `backend/index.js`

```javascript
import Sentry from '@sentry/node';
import { recordSentryBreadcrumb } from './config/arcoMonitoring.js';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'production',
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Mongo({ describeOperations: true }),
  ],
});
```

### Step 2: Log ARCO Operations

In `backend/Controllers/clinical/arcoController.js`:

```javascript
import { recordSentryBreadcrumb } from '../../config/arcoMonitoring.js';

// After each operation:
recordSentryBreadcrumb({
  operation: 'export_bundle_build',
  requestId: arcoRequest._id,
  requestType: 'ACCESS',
  outcome: 'success',
  metadata: {
    bundleSize: bundle.size,
    recordCount: bundle.recordCount,
    executionTime: Date.now() - startTime,
  },
});
```

### Step 3: Access Sentry Dashboard

- Go to **Sentry.io → Basileia → Issues**
- Filter by tag: `compliance:arco`
- View breadcrumb trail for any request

---

## Index Validation (Database Optimization)

### Verify Indices Exist

Run this in MongoDB:

```javascript
// ARCO Request indices
db.arco_requests.getIndexes()
// Should show:
//   { requester: 1, createdAt: -1 }
//   { subject: 1, status: 1 }
//   { status: 1, createdAt: -1 }

// Clinical data indices (soft-delete support)
db.medical_records.getIndexes()
// Should show:
//   { patient: 1, isDeleted: 1 }

db.psychological_patients.getIndexes()
// Should show:
//   { patient: 1, isDeleted: 1 }
```

### Create Missing Indices (Production Script)

Save as `backend/scripts/create-arco-indices.js`:

```javascript
import mongoose from 'mongoose';
import ARCORequest from '../models/ARCORequestSchema.js';
import MedicalRecord from '../models/MedicalRecordSchema.js';
import PsychologicalPatient from '../models/PsychologicalPatientSchema.js';
import PsychologicalClinicalHistory from '../models/PsychologicalClinicalHistorySchema.js';
import TreatmentPlan from '../models/TreatmentPlanSchema.js';

async function createARCOIndices() {
  try {
    console.log('📍 Creating ARCO-specific indices...');

    // ARCO Request indices
    await ARCORequest.collection.createIndex({ requester: 1, createdAt: -1 });
    await ARCORequest.collection.createIndex({ subject: 1, status: 1 });
    await ARCORequest.collection.createIndex({ status: 1, createdAt: -1 });
    console.log('  ✅ ARCO Request indices created');

    // Clinical data indices (patient + isDeleted for soft-delete filtering)
    await MedicalRecord.collection.createIndex({ patient: 1, isDeleted: 1 });
    await MedicalRecord.collection.createIndex({ doctor: 1, isDeleted: 1 });
    console.log('  ✅ MedicalRecord indices created');

    await PsychologicalPatient.collection.createIndex({ patient: 1, isDeleted: 1 });
    await PsychologicalPatient.collection.createIndex({ psychologist: 1, isDeleted: 1 });
    console.log('  ✅ PsychologicalPatient indices created');

    await PsychologicalClinicalHistory.collection.createIndex({ patient: 1, isDeleted: 1 });
    console.log('  ✅ PsychologicalClinicalHistory indices created');

    await TreatmentPlan.collection.createIndex({ patient: 1, isDeleted: 1 });
    console.log('  ✅ TreatmentPlan indices created');

    console.log('✅ All ARCO indices created successfully');
  } catch (error) {
    console.error('❌ Index creation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[2] === '--create-indices') {
  await mongoose.connect(process.env.MONGODB_URI);
  await createARCOIndices();
  await mongoose.disconnect();
}
```

**Run in production**:
```bash
node backend/scripts/create-arco-indices.js --create-indices
```

---

## Integration with Existing Monitoring

### APM Instrumentation (Datadog APM)

Add to `backend/config/datadog.js`:

```javascript
import tracer from 'dd-trace';

tracer.init({
  service: 'basileia-arco',
  env: process.env.NODE_ENV || 'production',
  version: process.env.APP_VERSION,
  enableProfiling: true,
});

// Trace ARCO operations
tracer.wrap('arco.operation', (span) => {
  span.setTag('operation_type', operationType);
  span.setTag('user_id', userId);
});
```

### Request Context Propagation

All ARCO requests automatically include:
- `X-ARCO-Request-ID`: Unique request identifier
- `X-Trace-ID`: Distributed trace ID (Datadog)
- `X-Span-ID`: Span ID for correlation

---

## Alert Runbook (When Alert Fires)

### If Hard-Delete Attempt Alert Fires

1. **Immediate**: Check Sentry for full stack trace
2. **Investigate**: Who attempted the delete? (logs)
3. **Check**: Is this a legitimate cleanup or a compromise?
4. **Action**:
   - If legitimate: Add user to allowlist (need security review)
   - If compromise: Trigger incident response, audit all recent changes
5. **Document**: Create incident ticket

### If Legal Hold Violation Alert Fires

1. **Immediate**: Escalate to Legal Department
2. **Check**: Which document? Which field?
3. **Preserve**: Don't modify anything, capture full audit trail
4. **Report**: Create compliance violation report
5. **Action**: Determine if this was accidental or malicious

### If Slow Query Alert Fires

1. **Check**: Current database load (MongoDB metrics)
2. **Analyze**: Which operation is slow? (check tags)
3. **Debug**: Run `explain()` on the slow query
4. **Scale**: Add read replicas if needed
5. **Monitor**: Track if this is new baseline or temporary spike

---

## Testing Alerts in Staging

### Simulate Hard-Delete Alert

```javascript
// backend/config/arcoMonitoring.js
recordHardDeleteAttempt(ddClient, {
  collectionName: 'MedicalRecord',
  documentId: '507f1f77bcf86cd799439011',
  attemptedBy: 'test-user@test.com',
  timestamp: new Date(),
});
```

Run: `npm run test:alerts` (this would trigger a test alert)

### Verify Datadog Receives Metrics

```bash
# SSH to Datadog Agent container
docker exec -it datadog-agent bash
# Check metric output
grep "basileia.arco" /var/log/datadog/agent.log
```

---

## Reference: All ARCO Metrics

| Metric | Type | Tags | Notes |
|--------|------|------|-------|
| `basileia.arco.operation.latency_ms` | Histogram | operation, outcome, request_type | P95, P99 tracked |
| `basileia.arco.operation.count` | Counter | operation, outcome | Total operations |
| `basileia.arco.operation.success` | Counter | operation | Successful operations |
| `basileia.arco.operation.failure` | Counter | operation | Failed operations |
| `basileia.arco.soft_delete.cascade_records` | Histogram | request_id | Records soft-deleted |
| `basileia.arco.rectification.applied_count` | Histogram | request_id | Records updated |
| `basileia.arco.rectification.skipped_count` | Histogram | request_id | Validation failures |
| `basileia.arco.export_bundle.size_bytes` | Histogram | request_id | Bundle size |
| `basileia.arco.export_bundle.generation_ms` | Histogram | request_id | Build time |
| `basileia.arco.hard_delete.attempts` | Counter | collection | **CRITICAL: Should be 0** |
| `basileia.arco.legal_hold.violations` | Counter | collection, field | Violation attempts |
| `basileia.arco.arco_request.lifecycle` | Counter | event, request_type | Request lifecycle |

---

## Deployment Checklist

- [ ] Datadog StatsD client initialized in `backend/index.js`
- [ ] Sentry initialized with ARCO breadcrumb integration
- [ ] All 5 critical monitors created in Datadog
- [ ] Alert notification channels verified (PagerDuty, Slack, Email)
- [ ] Indices created: `create-arco-indices.js --create-indices`
- [ ] APM tracing enabled for ARCO endpoints
- [ ] Staging alerts tested
- [ ] Runbooks documented and shared with ops team
- [ ] On-call engineer trained on alert response

---

**Phase 4.2 Status**: ✅ Alerting configuration complete  
**Next Phase**: Phase 4.3 - Documentation & Runbooks
