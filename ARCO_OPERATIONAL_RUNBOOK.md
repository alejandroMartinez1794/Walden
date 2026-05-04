# ARCO Operational Runbook

**Purpose**: Step-by-step procedures for handling ARCO requests, incidents, and compliance tasks  
**Audience**: Operations team, compliance officers, incident responders  
**Updated**: May 4, 2026  

---

## Table of Contents

1. [Daily Operations](#daily-operations)
2. [Request Processing](#request-processing)
3. [Incident Response](#incident-response)
4. [Compliance & Audits](#compliance--audits)
5. [Troubleshooting](#troubleshooting)

---

## Daily Operations

### Morning Checklist (Daily)

```bash
# 1. Check ARCO metrics dashboard
Datadog → Dashboards → ARCO Workflow Status

# Expected metrics:
# - Operation latency P95: < 50ms
# - Success rate: > 98%
# - Hard-delete attempts: 0
# - Legal hold violations: 0

# 2. Verify all endpoints are healthy
curl https://api.basileia.com/api/v1/clinical/arco/metrics \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Check database indices
mongosh "mongodb://prod-mongo.example.com/basileia" \
  --eval "db.arco_requests.getIndexes()"

# 4. Review any overnight alerts
PagerDuty → Incidents → Last 24 hours

# If any incidents: Jump to Incident Response section
```

### Weekly Compliance Report

**Every Friday**: Generate compliance report for legal team

```bash
# Export audit logs for past 7 days
mongosh "mongodb://prod-mongo.example.com/basileia" << 'EOF'
db.clinical_audit_logs.find({
  "timestamp": { $gte: ISODate("2026-04-27T00:00:00Z") },
  "operation": { $in: ["soft_delete", "rectification", "access_export"] }
}).pretty()
EOF

# Create summary CSV
node backend/scripts/generate-compliance-report.js \
  --start-date "2026-04-27" \
  --end-date "2026-05-04" \
  --output "compliance_report_week_18.csv"

# Share with compliance@basileia.com
```

---

## Request Processing

### New ACCESS Request (Patient Wants Their Data)

**Trigger**: Patient submits access request via frontend  
**Timeline**: 30-day response deadline (Colombian Data Protection Law)

#### Step 1: Acknowledge Request (Automatic)
```
✅ Automatic on submission
- Email sent to patient: "We received your request, reference: ARCOxxxx"
- Request status: PENDING_REVIEW
- Admin dashboard shows: New request waiting for approval
```

#### Step 2: Review & Approve (Admin)
**Checklist**:
- [ ] Verify request identity (check email matches account)
- [ ] Verify patient role = 'paciente'
- [ ] Check for legal holds (if any, escalate to Legal)
- [ ] Review requested fields (must be within data scope)

**Process**:
```bash
# Open admin portal
https://basileia-admin.example.com/arco/requests

# Find request in PENDING_REVIEW status
# Click: Review Request
# Check patient identity
# Select: APPROVE
# Comment: "Identity verified, request approved"
```

#### Step 3: Export Generation (Automatic)
```
On approval:
- ✅ Export bundle built (includes all medical records, psychological records, treatment plans)
- ✅ Records filtered by requested fields
- ✅ Sensitive data redacted (SSN, payment info)
- ✅ Status updated to: APPROVED → EXPORTED
- ✅ Email sent: "Your data export is ready, download here: [link]"
```

**If export fails** (goes to ERROR status):
1. Check Sentry: Dashboard → Issues → tag:arco.workflow
2. Common issues:
   - Database connection timeout → wait 5 min, retry
   - Missing indices → run `create-arco-indices.js --create-indices`
   - Large export > 100MB → split into multiple files (contact user)

#### Step 4: Follow-up (30 days max)
```
If patient hasn't downloaded after 14 days:
- Automated reminder email: "Your data export expires in 16 days"
- After 30 days: Export deleted, user must re-request
```

---

### New RECTIFICATION Request (Patient Wants to Correct Data)

**Trigger**: Patient submits rectification request (e.g., "Fix my birth date")  
**Timeline**: 45-day response deadline

#### Step 1: Review Request Details
```bash
# Check what patient is asking to change
# Example: "My diagnosis is wrong - should be 'Type 2 Diabetes', not 'Type 1'"
# Validate: Is the correction reasonable? (not deleting data, just correcting)
```

**Approval checklist**:
- [ ] Requested change is **correction**, not deletion
- [ ] Change doesn't violate data integrity (e.g., can't remove required fields)
- [ ] Change is clinically plausible (work with doctor if needed)
- [ ] Document reason for correction

#### Step 2: Approve & Apply Changes
```
Admin portal → Requests → [request] → Approve Rectification
- Specify which records to update
- Deep-merge strategy: Keep existing required fields, update only specified fields
- No doctor records are deleted, only updated
```

**What happens automatically**:
- ✅ All matching patient records updated across:
  - Medical records
  - Psychological patient records
  - Clinical histories
  - Treatment plans
- ✅ Original values preserved in audit log
- ✅ Email sent: "Your data correction has been processed"

**If rectification fails**:
1. Check logs: `Sentry → Issues → rectification_error`
2. Likely causes:
   - Validation failed (field type mismatch) → approve with adjusted correction
   - Document not found → patient account deleted? Escalate to Legal

---

### New CANCELLATION Request (Patient Wants Account Deleted)

**Trigger**: Patient requests complete data deletion (GDPR/Right to be Forgotten)  
**Timeline**: 45-day response deadline  
**⚠️ WARNING**: This is permanent. Requires patient confirmation.

#### Step 1: Verify Patient Intent
```bash
# Send verification email with unique link
# Link expires in 48 hours
# Patient must click link to confirm: "Yes, delete my account permanently"

# Check in admin portal for confirmation status
Admin Portal → CANCELLATION Requests → [request] → Verify Status
```

#### Step 2: Final Review (Compliance)
**Before approving, check**:
- [ ] No active legal holds on patient records
- [ ] No ongoing litigation involving this patient
- [ ] Patient's medical information is not required for ongoing treatment
- [ ] Legal team has reviewed (escalate if necessary)

#### Step 3: Execute Soft-Delete Cascade
```
Admin portal → Click: EXECUTE CANCELLATION
- All patient records marked as isDeleted = true
- Original documents preserved (not physically deleted)
- Audit trail immutable in ClinicalAuditLog
- Email sent: "Your account and data have been deleted"
```

**What gets deleted**:
- ✅ Medical records
- ✅ Psychological records
- ✅ Treatment plans
- ✅ Clinical histories
- ✅ Appointment bookings
- ✅ User profile
- ❌ Audit logs (permanent, cannot delete)

**Cannot be undone** - patient would need to re-register as new user.

---

### New OPPOSITION Request (Patient Objects to Processing)

**Trigger**: Patient files formal objection to data processing (GDPR right)  
**Status**: Blocks further processing until resolved

#### Step 1: Receive & Log Opposition
```
System auto-logs: Legal opposition received on [date]
Patient reason: "I object to psychological record sharing"
Status: OPPOSITION_FILED
```

#### Step 2: Escalate to Legal
```bash
# Create ticket in legal tracking system
Title: "ARCO Opposition - Patient [name], Request [ID]"
Content:
  - Patient objection reason
  - Which records are affected
  - Current consent status
  - Deadline: Legal must respond within 14 days
```

#### Step 3: Legal Resolution
**Legal team decides**:
- ✅ Opposition valid → block processing, mark as APPROVED (opposition accepted)
- ❌ Opposition invalid → dismiss, mark as REJECTED

```
Admin portal → Update request status:
[APPROVED/REJECTED] 
Comment: "Legal review completed, opposition [accepted/rejected]"
```

---

## Incident Response

### Alert: Hard-Delete Attempt Detected

**Severity**: 🚨 **CRITICAL** — Stop everything  
**Response Time**: < 5 minutes

#### Immediate Actions
```
1. ⏸️ PAUSE: Do not dismiss alert
2. 📢 NOTIFY: Slack #security-incidents
   Message: "🚨 CRITICAL: Hard-delete attempt on {{collection}}"
3. 🔍 INVESTIGATE: Who triggered this?
   - Datadog → Events → Find hard-delete event
   - Check: Sentry breadcrumb for user + IP
   - Check: AWS CloudTrail for API calls
4. 🛑 CONTAIN: If security breach suspected:
   - Revoke attacker's API keys
   - Disable user account
   - Enable MFA for all admin accounts
```

#### Investigation Checklist
```bash
# Get full context from Sentry
curl "https://sentry.io/api/0/organizations/basileia/issues/" \
  -H "Authorization: Bearer $SENTRY_TOKEN" \
  -G -d "query=hard_delete"

# Check MongoDB audit log
mongosh "mongodb://prod-mongo.example.com/basileia" << 'EOF'
db.clinical_audit_logs.findOne({
  "operation": "hard_delete",
  "timestamp": { $gte: ISODate(new Date(Date.now() - 60000)) }
})
EOF

# Get user info
mongosh "mongodb://prod-mongo.example.com/basileia" << 'EOF'
db.users.findOne({ _id: ObjectId("{{userId_from_audit}}") })
EOF
```

#### Decision Tree
```
Is this legitimate (e.g., scheduled cleanup)?
├─ YES → 
│   └─ Have security team review + approve
│   └─ Whitelist user + operation
│   └─ Document in ticket
├─ NO → Potential compromise
    └─ Immediately: Revoke all attacker tokens
    └─ Reset password for affected user
    └─ Audit all their recent API calls
    └─ Create incident ticket, involve security team
    └─ Notify user: "Suspicious activity detected on your account"
```

**Escalation**: If compromise suspected, trigger incident response:
- Page on-call security engineer
- Freeze production changes
- Begin forensic analysis

---

### Alert: Legal Hold Violation Attempt

**Severity**: 🚨 **CRITICAL** — Compliance violation  
**Response Time**: < 2 hours (notify Legal dept immediately)

#### Immediate Actions
```
1. 📋 CAPTURE: Screenshot of alert + timestamp
2. 📞 CALL: Legal department (direct phone, not email)
   Script: "We detected an attempt to modify documents under legal hold.
            This is a compliance violation that needs immediate attention."
3. 📊 GATHER: Full context
   - Which document was targeted?
   - Who attempted the modification?
   - What field were they trying to change?
   - Full audit trail of the attempt
```

#### Investigation
```bash
# Find the violation in audit log
mongosh "mongodb://prod-mongo.example.com/basileia" << 'EOF'
db.clinical_audit_logs.find({
  "operation": "update",
  "legalHold": true,
  "timestamp": { $gte: ISODate(new Date(Date.now() - 7200000)) }
}).pretty()
EOF

# Check if modification actually succeeded
db.medical_records.findOne({ legalHold: true, _id: ObjectId("{{doc_id}}") })

# Get user who attempted it
db.users.findOne({ email: "{{actor_email}}" })
```

#### Legal Escalation
```
Create legal incident ticket with:
- Document ID and type
- User who attempted modification
- Field/value they tried to change
- Timestamp of attempt
- Whether modification was blocked (✅ should be blocked)
- Full audit trail attachment

Assignment: Legal Department
Priority: URGENT
Response SLA: Same business day
```

**If modification was NOT blocked** (system failure):
- 🛑 ESCALATE TO CHIEF INFORMATION OFFICER
- Emergency security review
- Potential data breach notification required

---

### Alert: Slow ARCO Queries (P95 > 500ms)

**Severity**: ⚠️ **HIGH** — Performance degradation  
**Response Time**: < 30 minutes investigation

#### Diagnosis
```bash
# 1. Check which operation is slow
Datadog → ARCO Dashboard → Filter by operation tag

# 2. Check database load
mongo_exporter metrics:
  - mongodb_mongod_opcounters_* (current operations)
  - mongodb_index_accesses (index usage)

# 3. Run explain() on slow query
mongosh "mongodb://prod-mongo.example.com/basileia" << 'EOF'
// Example: slow export query
db.medical_records.find({ 
  patient: ObjectId("{{patient_id}}"), 
  isDeleted: false 
}).explain("executionStats")

// Look for:
// - executionStages.stage === "COLLSCAN" (BAD, no index)
// - executionStats.executionStages.docsExamined >> docsReturned (inefficient)
EOF

# 4. Check if indices exist
db.medical_records.getIndexes()
```

#### Resolution Options

**If missing index**:
```bash
# Create index immediately (non-blocking in background)
node backend/scripts/create-arco-indices.js --create-indices

# Monitor index creation progress
db.medical_records.currentOp({ "msg": /index/ })
```

**If database overloaded**:
```
- Check: Is there a large batch operation running?
  mongosh → show current op → look for long-running queries
- Scale options:
  1. Increase MongoDB connection pool limit (requires app restart)
  2. Add read replica + route reads to secondary
  3. Implement query caching (Redis)
  4. Contact MongoDB support for capacity planning
```

**If network latency issue**:
```
- Check: Latency between app servers and DB
  ping prod-mongo.example.com
  traceroute prod-mongo.example.com
- Solutions:
  1. Verify database regional placement (should be same availability zone)
  2. Check for network congestion (contact infrastructure team)
  3. Enable connection pooling if not already
```

**Expected Baselines (post-optimization)**:
- Export (10K records): P95 < 50ms
- Rectification (5K records): P95 < 50ms
- Soft-delete filter (20K records): P95 < 30ms

---

### Alert: Operation Failure Rate High (> 5%)

**Severity**: ⚠️ **HIGH** — Requests failing  
**Response Time**: < 10 minutes diagnosis

#### Troubleshooting
```bash
# 1. Check error logs
tail -f logs/error.log | grep "arco\|ARCO" | head -20

# 2. Check specific error types
Sentry → Issues → Filter by tag:request_type:ACCESS/RECTIFICATION/etc.

# 3. Common failure patterns
# Pattern A: Validation errors (request data invalid)
# Pattern B: Database errors (connection, query timeout)
# Pattern C: Authorization errors (user permissions)

# 4. Get error rate by operation
Datadog → Metric: basileia.arco.operation.failure
         → Group by: operation, outcome
```

#### Common Causes & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `ValidationError: name required` | Schema mismatch | Verify schema version |
| `MongoNetworkError: connect ECONNREFUSED` | DB unavailable | Restart MongoDB/check connection |
| `CastError: Cast to ObjectId failed` | Invalid ID format | Check audit log for malformed IDs |
| `NotFoundError: User not found` | Patient deleted | Check if CANCELLATION in progress |
| `ForbiddenError: User not authorized` | Permission denied | Verify JWT token + role |

---

## Compliance & Audits

### Monthly Compliance Audit

**1st of every month**: Verify ARCO system integrity

```bash
#!/bin/bash
# Run compliance audit script
node backend/scripts/compliance-audit.js \
  --month "2026-05" \
  --output "compliance_audit_may_2026.json"

# Checklist:
# ✅ All ARCO requests have audit trail
# ✅ No hard-deletes found (should be 0)
# ✅ All soft-deletes properly marked
# ✅ No documents modified after soft-delete
# ✅ Legal holds respected (no modifications)
# ✅ Response times met (ACCESS < 30 days, RECTIFICATION < 45 days)
```

### Handling Legal Holds

**When Legal department files legal hold**:

```
1. Document the hold:
   mongosh >> db.medical_records.updateOne(
     { _id: ObjectId("{{doc_id}}") },
     { $set: { legalHold: true, legalHoldReason: "Active litigation", legalHoldDate: new Date() } }
   )

2. System automatically:
   - Blocks any modifications
   - Blocks soft-delete operations
   - Prevents data export
   - Logs all access attempts

3. Verify in audit:
   - Check ClinicalAuditLog for hold entry
   - Verify no changes after hold date

4. When hold lifted:
   mongosh >> db.medical_records.updateOne(
     { _id: ObjectId("{{doc_id}}") },
     { $set: { legalHold: false } }
   )
```

### Annual Data Retention Review

**Every January**: Review & purge soft-deleted records

```bash
# Find soft-deleted records older than 3 years
mongosh "mongodb://prod-mongo.example.com/basileia" << 'EOF'
db.medical_records.countDocuments({
  isDeleted: true,
  deletedAt: { $lt: ISODate("2023-01-04") }  // > 3 years old
})

// Output should show count of eligible records for purge
EOF

# Get approval from Legal before purging
# Email Legal: "Ready to permanently delete X soft-deleted records from 2023"

# Once approved:
node backend/scripts/purge-old-softdeleted.js \
  --before-date "2023-01-04" \
  --dry-run  # First run in dry-run mode
  
node backend/scripts/purge-old-softdeleted.js \
  --before-date "2023-01-04" \
  --confirm  # Actually delete
```

---

## Troubleshooting

### Export Bundle Stuck in PENDING Status

**Symptoms**: Patient waiting for export, status not changing

```bash
# Check if export job is actually running
Sentry → Issues → tag:operation:export_bundle_build → Recent errors

# Check database
mongosh << 'EOF'
db.arco_requests.findOne({
  status: "APPROVED",
  fulfillment: { $eq: {} }  // No fulfillment data
})
EOF

# Likely causes:
# 1. Export process crashed → Check logs, restart export
# 2. Database slow → Check database load
# 3. Large data set → May take > 1 minute, be patient
```

**Fix**:
```
# Retry export manually
POST /api/v1/clinical/arco/requests/{{requestId}}/execute-export
Authorization: Bearer {{adminToken}}

# Response should return bundle within 2 minutes
```

### Patient Can't Access /my-requests Endpoint

**Symptoms**: 401 or 403 error when patient tries to view their requests

```bash
# Check 1: Is JWT token valid?
# - Patient should have 'token' in localStorage
# - Token should be non-expired

# Check 2: Verify patient role
db.users.findOne({ email: "{{patient_email}}" })
// Should show: role: "paciente"

# Check 3: Check middleware
# GET /api/v1/clinical/arco/my-requests
# Should be: authenticate → verify patient role
```

**Common fixes**:
- [ ] Patient needs to re-login (token expired)
- [ ] Patient's role was changed to "doctor" (revert)
- [ ] Patient account not verified (check email verification)

### Metrics Endpoint Slow/Timing Out

**Symptoms**: `/api/v1/clinical/arco/metrics` takes > 5 seconds

```bash
# Metrics should be instant (< 1ms) since in-memory
# If slow, likely system memory issue

# Check Node.js memory usage
ps aux | grep "node backend" | grep -v grep
// Look at VSZ/RSS columns

# If memory high (> 2GB), restart app
pm2 restart basileia

# If still slow, check:
# - Datadog Agent consuming CPU?
# - MongoDB driver connection pool leak?
```

---

## Contact & Escalation

### On-Call Contacts

| Role | Contact | Phone | Notes |
|------|---------|-------|-------|
| Backend Engineer | @backend-team | Slack | For code/API issues |
| Database Admin | @dba-team | Slack | For MongoDB issues |
| Security | @security-team | Slack | For data breach/attacks |
| Legal | legal@basileia.com | +1-555-0100 | For compliance questions |
| Compliance Officer | compliance@basileia.com | +1-555-0200 | For audit/reporting |

### Escalation Path
```
1st: Try to resolve using this runbook (< 30 min)
2nd: Escalate to on-call engineer
3rd: If data security involved → Security team
4th: If compliance involved → Legal team
```

---

**Last Updated**: May 4, 2026  
**Next Review**: August 4, 2026  
**Document Owner**: Operations Team / Compliance Officer
