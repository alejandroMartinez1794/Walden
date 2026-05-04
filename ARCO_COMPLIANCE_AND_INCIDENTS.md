# ARCO Compliance & Incident Response Guide

**Purpose**: Legal, compliance, and incident response procedures for ARCO data subject rights  
**Jurisdiction**: Colombia (LPDP 1581/2012), EU (GDPR), and international standards  
**Audience**: Legal department, compliance officers, incident responders, C-suite  

---

## Table of Contents

1. [ARCO Rights Overview](#arco-rights-overview)
2. [Legal Compliance Framework](#legal-compliance-framework)
3. [Incident Classification & Response](#incident-classification--response)
4. [Data Breach Notification](#data-breach-notification)
5. [Audit & Documentation](#audit--documentation)
6. [Third-Party Sharing](#third-party-sharing)

---

## ARCO Rights Overview

### The Four Data Subject Rights

Basileia implements full ARCO compliance per Colombian data protection law and GDPR equivalents.

#### 1. **ACCESS (Acceso)**
**Right**: Patient requests copy of their personal data  
**Regulatory Deadline**: 30 calendar days (LPDP 1581/2012 Art. 12)

| Step | Timeline | Action |
|------|----------|--------|
| Patient Requests | Day 0 | Patient submits via app or mail |
| Basileia Acknowledges | Day 1 | Auto-email: "Request received" |
| Data Controller Reviews | Day 2-5 | Verify identity, check for holds |
| Export Generated | Day 5-10 | Bundle all patient data, filter fields |
| Patient Notified | Day 10 | Email: "Download your data here" |
| Deadline | Day 30 | **Must complete by this date** |

**Data Included in Export**:
- ✅ Medical records
- ✅ Psychological assessments & session notes
- ✅ Treatment plans
- ✅ Appointment history
- ✅ Prescription records
- ❌ Notes from other doctors (withhold per privacy rules)
- ❌ Internal compliance/investigation files

**Legal Risk if Not Fulfilled**:
- Fine: COP 50M-200M (Colombian authority)
- Fine: €10-50k (if EU patients affected)
- Reputation damage
- Patient can file with superintendent

---

#### 2. **RECTIFICATION (Rectificación)**
**Right**: Patient corrects inaccurate/incomplete data  
**Regulatory Deadline**: 45 calendar days (LPDP 1581/2012 Art. 13)

| Step | Timeline | Action |
|------|----------|--------|
| Patient Files Rectification | Day 0 | "My diagnosis is wrong" |
| Basileia Reviews | Day 2-7 | Validate correction is accurate |
| Consult Treating Provider | Day 5-10 | Doctor confirms if needed |
| Apply Correction | Day 10-30 | Update all matching records |
| Patient Notified | Day 30 | Email: "Correction applied" |
| Deadline | Day 45 | **Must complete by this date** |

**Cannot Rectify** ❌:
- Deleting data (that's CANCELLATION)
- Removing required fields (e.g., date of diagnosis)
- Changing historical records (create amendment instead)

**Examples**:
✅ **Valid**: "Birth date is 1985-03-15, not 1985-03-14" → Correct it
✅ **Valid**: "Diagnosis says 'Depression' should be 'Anxiety Disorder'" → Correct it
✅ **Valid**: "Add missing insurance provider information" → Add it
❌ **Invalid**: "Delete all records of psychiatric care" → Must use CANCELLATION
❌ **Invalid**: "Remove my name from all prescriptions" → Creates legal liability

---

#### 3. **CANCELLATION (Cancelación / Right to be Forgotten)**
**Right**: Patient requests complete data deletion  
**Regulatory Deadline**: 45 calendar days (GDPR Art. 17, LPDP 1581/2012 Art. 14)

| Step | Timeline | Action |
|------|----------|--------|
| Patient Requests Cancellation | Day 0 | "Delete my account" |
| Basileia Sends Confirmation Email | Day 1 | Link expires in 48h |
| Patient Verifies | Day 1-2 | Clicks confirmation link |
| Legal Reviews | Day 3-7 | Check for holds, litigation, treatment |
| Approve/Deny | Day 7-10 | Decision made |
| If Approved: Execute Cascade Delete | Day 10-30 | Mark all records isDeleted=true |
| Patient Notified | Day 30 | Email: "Account deleted" |
| **PERMANENT** | Day 45 | Cannot be undone |

**Legal Exceptions** (When NOT to delete):
- ❌ Active medical treatment ongoing
- ❌ Legal hold / court order in effect
- ❌ Tax/accounting retention requirements (5 years in Colombia)
- ❌ Medical liability insurance retention (5+ years)
- ❌ Active investigation/complaint

**If Legal Hold Active**:
```
❌ BLOCKED: Cannot execute CANCELLATION
→ Send to patient: "Your data is subject to legal hold until [date]. 
   We cannot delete until the hold is lifted."
→ Notify Legal: "Patient requesting cancellation, data under hold"
```

---

#### 4. **OPPOSITION (Oposición)**
**Right**: Patient objects to data processing (for specific purposes)  
**Regulatory Deadline**: Not specified, but treat as urgent  

| Step | Timeline | Action |
|------|----------|--------|
| Patient Files Opposition | Day 0 | "I object to sharing my data with insurance" |
| Basileia Logs Opposition | Day 1 | Creates OPPOSITION request |
| Legal Reviews | Day 3-14 | Determine if opposition valid |
| Decision Made | Day 14 | Approved or Rejected |
| Processing Paused | Until Decision | Block disputed data sharing |
| Patient Notified | Day 14 | Email: Decision + reasoning |

**Examples**:
✅ **Valid Opposition**: "I don't consent to sharing psychiatric records with insurance" → Blocked from sharing
❌ **Invalid Opposition**: "I object to having medical records" → Cannot object to core treatment records
⚠️ **Partial Opposition**: "Don't share with insurance, but share with treating doctor" → Approve partial

---

## Legal Compliance Framework

### Colombian Data Protection Law (LPDP 1581/2012)

**Key Articles for ARCO**:

| Article | Requirement | Basileia Implementation |
|---------|-------------|------------------------|
| Art. 2(c) | Personal Data Definition | Basileia Schema includes: name, DOB, medical history, etc. |
| Art. 5 | Lawfulness of Processing | Consent stored, purpose specified in privacy policy |
| Art. 6 | Rights of Data Subjects | ARCO endpoints fully implemented |
| Art. 8 | Sensitive Data Protection | Encrypted at rest, access logs audited |
| Art. 12 | Access (Acceso) | Deadline: 30 days → Implementation: 10 days avg |
| Art. 13 | Rectification | Deadline: 45 days → Implementation: 20 days avg |
| Art. 14 | Cancellation | Deadline: 45 days → Implementation: soft-delete in 5 days |
| Art. 15 | Data Portability | Included in ACCESS export |
| Art. 18 | Data Preservation | Legal holds enforced, audit trail immutable |

**Superintendent Authority** (Supervisory Authority):
- Entity: Superintendencia de Industria y Comercio (SIC)
- Can audit Basileia's ARCO compliance
- Can impose fines: COP 50M-200M
- Can order corrective actions

**Audit Prep Checklist**:
- [ ] ARCO dashboard shows all requests with timestamps
- [ ] Each request has documented decision + reasoning
- [ ] Response times tracked (target: < 30 days)
- [ ] No request processing > 45 days (regulatory maximum)
- [ ] Audit trail immutable (ClinicalAuditLog cannot be edited)
- [ ] No data accessed after soft-delete

---

### GDPR Equivalents (EU Patients)

**Equivalent GDPR Articles**:

| GDPR | Basileia Implementation |
|------|--------------------------|
| Art. 12-14 | Access/Rectification/Erasure → ARCO endpoints |
| Art. 17 | Right to be Forgotten → CANCELLATION |
| Art. 18 | Right to restrict processing → Legal hold |
| Art. 20 | Data Portability → ACCESS export format |
| Art. 21 | Right to object → OPPOSITION |
| Art. 33 | Breach notification → Incident response plan (see below) |

**Note**: If any EU patients use Basileia, GDPR compliance required:
- Data Processing Agreement (DPA) in place
- Standard Contractual Clauses (SCC) if data transferred
- Data Protection Impact Assessment (DPIA) documented

---

## Incident Classification & Response

### Incident Types

#### Type 1: Hard-Delete Attempt (Severity: CRITICAL)

**Definition**: Someone tried to physically delete clinical data (not soft-delete)

**Regulatory Impact**:
- 🚨 **Violation of LPDP Art. 18** (Data Preservation)
- 🚨 **Violation of GDPR Art. 5(1)(e)** (Integrity & Confidentiality)
- 🚨 **Potential evidence tampering** if related to litigation

**Automatic Response** (System):
- ❌ Attempt BLOCKED (soft-delete only allowed)
- 📢 Alert fired immediately: `hard_delete.attempts` counter incremented
- 📝 Logged to ClinicalAuditLog (immutable)
- 📧 Sentry event created with full stack trace

**Manual Response** (Legal/Ops):
1. **Immediate** (< 5 minutes):
   - Page security team + legal
   - Freeze production changes
   - Screenshot alert + audit logs
   
2. **Investigation** (< 1 hour):
   - Who attempted this? (user + IP address)
   - When? (exact timestamp)
   - Which records? (count + types)
   - Why? (was there a legitimate business reason?)

3. **Determination** (< 24 hours):
   - **If legitimate** (authorized cleanup):
     - Document in ticket
     - Whitelist user + operation
     - Review access controls
   - **If compromise**:
     - Revoke attacker's credentials
     - Force password reset for affected users
     - Audit all recent API calls
     - **NOTIFY**: Patients whose data was accessed

4. **Escalation**:
   - Contact: Chief Information Security Officer
   - Notify: Data Protection Officer (if appointed)
   - May trigger mandatory incident disclosure

---

#### Type 2: Unauthorized Access (Severity: HIGH)

**Definition**: Someone accessed patient data without authorization

**Examples**:
- Doctor A viewed Patient B's psychiatric records (not their patient)
- Ops team exported a competitor's health data
- Hacker got API key and downloaded patient database

**Regulatory Impact**:
- 🚨 **GDPR Art. 33** (Breach notification) if > 20 records
- 🚨 **LPDP Art. 12(c)** (Patient right to know)
- 🚨 **Potential criminal liability** (fraud, espionage)

**Response**:
```
1. Identify scope
   - How many patients affected?
   - What data accessed?
   - How long was access active?

2. Contain
   - Revoke attacker's access immediately
   - Force re-auth for all users
   - Block potentially compromised API keys

3. Notify Patients (if > 20 affected or sensitive)
   - Email: "Your data may have been accessed without authorization"
   - Include: What data, what we're doing, customer support contact
   - Must send within 30 days (GDPR) or as soon as practical

4. Report to Authorities
   - If GDPR: Report to local supervisory authority
   - If Colombia: Report to SIC within 15 days
   - Include: Scope, impact, remediation
```

---

#### Type 3: Legal Hold Violation (Severity: CRITICAL)

**Definition**: Someone tried to modify/delete data under legal hold

**Regulatory Impact**:
- 🚨 **Spoliation** (destruction of evidence)
- 🚨 **Criminal liability** (obstruction of justice)
- 🚨 **Court sanctions** (adverse inference, case dismissal)
- 💰 **Damages** in litigation

**Automatic Response** (System):
- ❌ Attempt BLOCKED (system prevents modification)
- 📝 Logged: `legal_hold.violations` counter incremented
- 📧 Sentry event with full details
- 📋 Audit trail immutable

**Manual Response** (Legal):
1. **Immediate** (< 1 hour):
   - Contact: Legal counsel representing Basileia
   - Notify: Opposing counsel (if applicable)
   - Call: Person who attempted violation
   
2. **Investigation**:
   - Who attempted this?
   - What field were they changing?
   - Did system block it? (✅ expected)
   - Is there evidence they might have succeeded elsewhere?

3. **Escalation**:
   - If intentional: Potential criminal referral
   - If accidental: User training required
   - File report with court if ongoing litigation

---

#### Type 4: Soft-Delete Backlog (Severity: MEDIUM)

**Definition**: Too many soft-deleted records accumulating (slowing queries)

**Regulatory Impact**:
- ⚠️ No direct regulatory violation
- ⚠️ But: Service degradation, poor UX, inefficient storage

**Response**:
```
Monthly Check:
- Count: How many soft-deleted records exist?
- Age: What's the average deletion age?
- Impact: Is query performance degraded?

Annual Purge (if approved):
- Get Legal approval before purging old records
- Purge records > 3 years old (beyond retention requirements)
- Document purge date + count in compliance records
```

---

### Incident Disclosure Decision Tree

```
Does the incident involve unauthorized access to personal data?

├─ NO
│   └─ Compliance notification not required
│   └─ Document internally, share with ops team
│
├─ YES
    ├─ How many records affected?
    │
    ├─ ≤ 20 records OR not sensitive data
    │   └─ No mandatory disclosure (but consider good faith notification)
    │   └─ Notify affected patients if trust issue
    │
    └─ > 20 records OR contains sensitive health data
        ├─ GDPR applies? (any EU residents)
        │   └─ ✅ MUST notify supervisory authority within 72 hours
        │   └─ ✅ MUST notify patients without undue delay
        │
        └─ LPDP applies? (Colombian residents)
            └─ ✅ MUST notify SIC within 15 days
            └─ ✅ MUST notify patients within 30 days
```

**Example Notification**:
```
Subject: Security Notice - Your Healthcare Data

Dear [Patient Name],

We discovered that [brief description of incident] on [date].
We have taken the following actions:

1. Contained the incident immediately
2. Secured the vulnerability
3. Reviewed what information was accessed:
   - Medical records: [specific types]
   - Appointment history
   - Prescription information

What we recommend you do:
1. Contact your treating physician if you have concerns
2. Monitor your credit if financial information was exposed
3. Call us at [support number] with questions

What we're doing:
- Completing full forensic analysis
- Implementing additional security measures
- Reporting to authorities as required

We take your privacy seriously and apologize for this incident.

Sincerely,
Basileia Privacy Team
```

---

## Data Breach Notification

### Notification Procedure

**Step 1: Verify Breach Occurred**
```
Confirm:
□ Data accessed without authorization? (not just misconfiguration)
□ Data involves personal data? (not just system logs)
□ Data is not already publicly available? (no notification needed if it is)
□ Patient privacy harmed? (not hypothetical risk)
```

**Step 2: Calculate Scope**
```
Count:
- Total unique patients affected
- Types of data exposed (medical records, contacts, financial, etc.)
- Sensitivity assessment (on scale 1-10)
- Duration of exposure (days/hours)
```

**Step 3: Jurisdiction Check**
```
If patients in EU:
├─ GDPR Notification Rule: Within 72 hours to DPA
└─ Patient notification: Without undue delay

If patients in Colombia:
├─ LPDP Notification Rule: Within 15 days to SIC
└─ Patient notification: Within 30 days

If patients in other countries:
└─ Check local regulations (some require notification, some don't)
```

**Step 4: Prepare Notification Content**
```
Include:
□ Nature of the breach (what happened)
□ Data categories affected (medical records, contacts, etc.)
□ Estimated number of affected individuals
□ Likely consequences (medical decisions affected? fraud risk?)
□ Measures taken (containment, investigation)
□ What affected individual should do
□ Contact point (privacy team email + phone)
□ Date of discovery + current status
```

**Step 5: Send Notifications**
```
Timeline:
- If urgent (ongoing access): Notify immediately via phone + email
- If contained: Send within 72 hours (GDPR) or 15 days (LPDP)
- Never wait beyond 30 days

Channels:
- Registered email from patient account
- Paper letter if no email
- Public notice if > 500 affected (via news, website)
- Regulatory submission (DPA or SIC)
```

**Step 6: Document Everything**
```
Create incident file containing:
□ Initial discovery report
□ Scope calculation worksheet
□ Notification approvals (signed by Legal + Privacy Officer)
□ Sent notifications (copies)
□ Patient responses (if any)
□ Remediation actions completed
□ Post-incident audit results
```

---

## Audit & Documentation

### ARCO Request Documentation

**Every ARCO request must have**:

```
ARCORequest Document Structure:
{
  _id: ObjectId("..."),
  requester: {
    userId: ObjectId("..."),
    email: "patient@example.com",
    name: "Patient Name"
  },
  subject: {
    userId: ObjectId("..."),  // usually same as requester
    email: "..."
  },
  requestType: "ACCESS" | "RECTIFICATION" | "CANCELLATION" | "OPPOSITION",
  
  // Data requested
  requestedFields: ["diagnosis", "treatment", ...],  // ACCESS only
  requestedChanges: { diagnosis: "new diagnosis" },  // RECTIFICATION only
  
  // Workflow
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "EXECUTED",
  review: {
    reviewer: { userId, email, timestamp },
    decision: "APPROVED" | "REJECTED",
    reasoning: "Identity verified, request within scope",
    legalHoldCheck: "No holds found",
    consentVerified: true
  },
  
  // Fulfillment
  fulfillment: {
    executedAt: ISODate("..."),
    executedBy: "admin@example.com",
    exportBundle: { ... },  // ACCESS responses
    rectificationResults: { ... },  // RECTIFICATION responses
  },
  
  createdAt: ISODate("2026-05-04T..."),
  expiresAt: ISODate("2026-06-03T..."),  // Auto-delete export after 30 days
}
```

**Audit Trail**:
```
ClinicalAuditLog contains:
- Every operation on request
- Every data access during fulfillment
- Every field viewed/exported
- Immutable (cannot be modified)
- Accessible to legal team via admin portal
```

### Compliance Report Generation

**Monthly Report** (for Legal/Compliance review):

```bash
# Run compliance report
node backend/scripts/generate-compliance-report.js \
  --month "2026-05" \
  --output "compliance_report_may_2026.json"

# Report includes:
# ✅ All ARCO requests (count by type)
# ✅ Response time metrics (P50, P95, P99)
# ✅ Any requests exceeding SLA (should be none)
# ✅ Rejections + reasoning
# ✅ Hard-delete attempts (should be 0)
# ✅ Legal hold changes
# ✅ Data access audit summary

# Output format: JSON + CSV + PDF summary
```

### Legal Hold Procedures

**When court order received**:

```
1. Entry
   Document the hold:
   - Case number
   - Court order date
   - Scope (which patients/records)
   - Duration (until when)
   - Responsible attorney

2. System Action
   mongosh >> db.medical_records.updateMany(
     { patient: ObjectId("...") },
     { $set: { legalHold: true, legalHoldCase: "2026-1234" } }
   )

3. Access Restrictions
   System automatically:
   - ✅ Allows data ACCESS (patient can view)
   - ❌ Blocks RECTIFICATION (no modifications)
   - ❌ Blocks CANCELLATION (no deletion)
   - ❌ Blocks OPPOSITION processing
   - ✅ Logs all access attempts

4. Removal
   When hold lifted, update:
   db.medical_records.updateMany(
     { legalHoldCase: "2026-1234" },
     { $set: { legalHold: false }, $unset: { legalHoldCase: 1 } }
   )

5. Verification
   Audit log should show:
   - Hold entry date
   - All access during hold period
   - Hold removal date
   - No modifications during hold (✅ expected)
```

---

## Third-Party Sharing

### When Sharing Patient Data with Third Parties

**NEVER share without**:

```
1. Written Consent
   - Patient must affirmatively consent
   - Must specify which third party
   - Must specify which data
   - Cannot be blanket/default consent

2. Data Processor Agreement (DPA)
   - With the third party receiving data
   - Includes data security requirements
   - Includes ARCO compliance obligations
   - Includes breach notification clause

3. Legal Review
   - Privacy officer reviews before sharing
   - Determines legal basis (consent, contract, etc.)
   - Documents decision + reasoning

4. Patient Notification (LPDP)
   - Inform patient which third parties access data
   - Inform patients of their rights (can still request deletion)
   - Provide contact for third party complaints
```

### Common Scenarios

**Scenario 1: Sharing with Insurance Company**
```
✅ Allowed if:
- Written patient consent
- DPA in place with insurance company
- Limited to needed claims data (not full medical history)
- Patient notified

❌ Not allowed if:
- Just assumed patient consent
- No DPA
- Sharing everything (psychiatric notes, etc.)
- Patient not informed
```

**Scenario 2: Sharing with Another Doctor**
```
✅ Allowed if:
- Patient sees that doctor (treatment relationship)
- DPA in place (or hospital agreement covers)
- Patient notified or implicitly consented
- Limited to clinically relevant data

❌ Not allowed if:
- Patient never went to that doctor
- No DPA
- Sharing everything including unrelated records
```

**Scenario 3: Research (De-identified)**
```
✅ Allowed if:
- Data is truly de-identified (cannot re-identify)
- Research protocol approved by ethics board
- Patient notified of research use

❌ Not allowed if:
- De-identification is weak (e.g., just removing name)
- No ethics approval
- Patient didn't consent to research
```

---

## Escalation & Contacts

### Quick Reference

| Issue | Contact | Timeline | Action |
|-------|---------|----------|--------|
| ARCO request > 30 days | Compliance Officer | Immediate | Expedite approval |
| Legal hold question | Basileia Legal | 1-2 hours | Review + advise |
| Suspected breach | Chief Security Officer | Immediate | Investigate |
| Regulatory authority request | Privacy Officer | 24 hours | Prepare response |
| Patient complaint | Compliance Officer | 48 hours | Acknowledge + investigate |

### Regulatory Contacts

**Colombia (SIC)**:
- Superintendent: superintendencia@sic.gov.co
- Address: Bogotá, Colombia
- Hotline: 1-800-[number]
- Response time: 15-30 days

**EU (EDPB)**:
- Contact: Local data protection authority (country-specific)
- EU Coordination: edpb@europa.eu

**Patient Complaint Escalation**:
```
If patient complains to regulator:
1. Regulator sends notice to Basileia (10-15 days)
2. Basileia has 15-30 days to respond
3. Regulator investigates (30-90 days)
4. Decision issued (can appeal)

Prevention:
- Respond to patient inquiries within 7 days
- Resolve disputes quickly
- Document all actions taken
```

---

**Document Status**: Final  
**Last Reviewed**: May 4, 2026  
**Next Review Date**: August 4, 2026  
**Owner**: Legal Department / Compliance Officer  
**Classification**: Internal Confidential
