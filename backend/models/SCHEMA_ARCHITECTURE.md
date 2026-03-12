# Basileia Data Architecture

## Overview
This document describes the complete data model architecture for Basileia, a clinical-grade telepsychology platform specializing in CBT.

## Design Principles

### 1. Separation of Concerns
- **Patient-Facing Data**: Fields that patients can see (therapy goals, homework, session dates)
- **Clinician-Only Data**: Risk assessments, clinical hypotheses, diagnostic codes
- **Audit Data**: Immutable logs for legal compliance

### 2. Immutability Requirements
- Protocol logs: Immutable after completion (amendments logged separately)
- Risk assessments: Never deleted, only superseded with history tracking
- Clinical notes: Locked after signature, amendments require justification

### 3. Privacy & Legal Compliance
- Risk levels: `select: false` by default (never exposed to patient queries)
- PHI encryption: Sensitive fields encrypted at rest
- Access tracking: All data access logged with timestamp, user, purpose
- HIPAA compliance: 7-year retention, audit trails, breach protocols

### 4. Data Integrity
- Timestamps: All clinical decisions timestamped
- Signatures: Critical documents digitally signed with SHA-256
- Versioning: Schema versions tracked for protocol compliance
- Referential integrity: Cascade delete protections on patient data

---

## Entity Relationship Diagram

```
User (Patient)
  ├── TreatmentPlan [1:1]
  │   ├── CBTFormulation [1:1 embedded]
  │   ├── TherapySession [1:N]
  │   ├── ClinicalAlert [1:N]
  │   ├── ProtocolLog [1:N]
  │   ├── RiskAssessment [1:N]
  │   └── ProgressMetric [1:N timeseries]
  │
  ├── PsychologicalAssessment [1:N]
  ├── SafetyPlan [1:1]
  ├── ConsentForm [1:N]
  └── ActivityLog [1:N]

Doctor (Therapist)
  ├── ClinicalCredential [1:N]
  ├── SupervisionLog [1:N]
  ├── QualityMetric [1:1 aggregated]
  └── ActivityLog [1:N]

ProtocolLog [Immutable after completion]
  ├── ProtocolStep [1:N embedded]
  ├── DecisionTrace [1:1 embedded]
  └── LegalDocumentation [1:1 embedded]

ClinicalAlert
  ├── ProtocolLog [0:1] (if protocol activated)
  └── AlertResolution [1:1]

AuditLog [System-wide, immutable]
  └── All entity changes tracked
```

---

## Core Schemas

### 1. Enhanced User (Patient) Schema
**Purpose**: Patient demographic and account data
**Access**: Patient (own data), Clinician (full access), System (full)
**Retention**: 7 years post-treatment

**Key Enhancements**:
- CBT profile separated for patient dashboard
- Risk data completely hidden from patient
- Consent tracking for legal compliance
- Emergency contact information

### 2. Enhanced Doctor (Therapist) Schema
**Purpose**: Clinician credentials and professional data
**Access**: Clinician (own data), Supervisor (full), System (full)
**Retention**: Permanent (professional record)

**Key Enhancements**:
- License verification tracking
- Supervision requirements
- Specialization tags for matching
- Quality metrics (outcome data)

### 3. TreatmentPlan (Master Clinical Record)
**Purpose**: The "chart" - complete treatment lifecycle
**Access**: Clinician only (risk data select: false)
**Retention**: 7 years minimum

**Key Enhancements**:
- CBT phase state machine
- Risk stratification (NEVER exposed to patient)
- Adherence metrics
- Phase progression history

### 4. CBTFormulation (Embedded in TreatmentPlan)
**Purpose**: Case conceptualization per CBT model
**Access**: Clinician only (embedded in TreatmentPlan)
**Retention**: Tied to TreatmentPlan

**Structure**:
- Presenting problem
- Triggers (A in ABC)
- Core beliefs (B in ABC)
- Consequences (C in ABC)
- Maintenance cycle
- Treatment targets

### 5. TherapySession (Enhanced)
**Purpose**: Session-by-session documentation
**Access**: Clinician (full), Patient (sanitized summary)
**Retention**: 7 years

**Key Enhancements**:
- SOAP note structure
- Risk assessment per session
- Homework tracking
- ABC thought records
- Session signature (locks note)

### 6. RiskAssessment (NEW)
**Purpose**: Formal suicide/harm risk evaluation
**Access**: Clinician only (never exposed to patient)
**Retention**: Permanent (never deleted)

**Structure**:
- Columbia-Suicide Severity Rating Scale (C-SSRS)
- Risk factor inventory
- Protective factor inventory
- Clinical judgment + rationale
- Signature + timestamp

### 7. ProtocolLog (Immutable Audit Trail)
**Purpose**: Legal documentation of crisis response
**Access**: Clinician, Supervisor, Legal (court-ordered)
**Retention**: Permanent

**Immutability**: Once completed and signed, cannot be edited (only amended)

### 8. ClinicalAlert (Risk Detection)
**Purpose**: Flag clinical risks for clinician review
**Access**: Clinician only
**Retention**: Permanent (historical tracking)

**Types**: Suicide risk, non-adherence, abandonment, crisis, deterioration

### 9. SafetyPlan (NEW)
**Purpose**: Crisis intervention plan for patient
**Access**: Patient (read), Clinician (full)
**Retention**: Current version + history

**Structure**:
- Warning signs (patient-specific)
- Internal coping strategies
- Social contacts for distraction
- Family/friends who can help
- Crisis hotline numbers
- Means restriction plan

### 10. ActivityLog (Comprehensive Audit)
**Purpose**: Every system action tracked
**Access**: System admin, Legal (court-ordered)
**Retention**: 10 years

**Logs**:
- Data access (who viewed what patient data)
- Protocol activations
- Risk level changes
- Phase progressions
- Data exports
- Failed login attempts

---

## Field-Level Privacy Rules

### NEVER Expose to Patient

```javascript
// In all queries from patient-facing endpoints:
.select('-riskLevel -riskFactors -columbiaScore -clinicalHypothesis -diagnosticCode')

// Fields with select: false by default:
- TreatmentPlan.riskLevel
- TreatmentPlan.riskFactors
- TreatmentPlan.lastRiskAssessment.columbiaScore
- ClinicalAlert (entire collection)
- ProtocolLog (entire collection)
- RiskAssessment (entire collection)
- ActivityLog (entire collection)
- Doctor.twoFactorSecret
- User.passwordHash
```

### Patient Can View (Sanitized)

```javascript
// Safe for patient dashboard:
- therapyGoals
- nextSessionDate
- homework assignments
- mood tracking data
- ABC thought records (their own)
- safetyPlan (public fields only)
- sessionSummary (clinician-written summary, not full SOAP notes)
```

### Clinician Full Access

```javascript
// Clinicians see everything related to their patients:
- All TreatmentPlan fields (including risk data)
- All TherapySession SOAP notes
- All RiskAssessment history
- All ClinicalAlert logs
- All ProtocolLog records
- Patient emergency contacts
```

---

## Immutability Implementation

### Document Locking
```javascript
// After signature, document becomes immutable
{
  status: 'SIGNED',
  signedAt: ISODate,
  signedBy: ObjectId,
  hash: 'SHA256...',
  editable: false  // Enforced at middleware level
}

// Any change requires amendment
{
  amendments: [
    {
      amendedAt: ISODate,
      amendedBy: ObjectId,
      reason: 'Correcting typo in medication name',
      changes: {
        field: 'medications[0].name',
        oldValue: 'Sertaline',
        newValue: 'Sertraline'
      },
      amendmentHash: 'SHA256...'
    }
  ]
}
```

### Soft Deletes
```javascript
// Never hard-delete clinical data
{
  deleted: true,
  deletedAt: ISODate,
  deletedBy: ObjectId,
  deletionReason: 'Patient requested data removal',
  retentionUntil: ISODate // 7 years from deletion
}

// Queries automatically exclude deleted unless:
.find({ deleted: { $ne: true } })  // Standard query
.find({})  // Admin/Legal query (sees everything)
```

---

## Next Steps

The following enhanced schemas have been implemented:
1. ✅ TreatmentPlanSchema.js (with CBT state machine)
2. ✅ ClinicalAlertSchema.js (risk detection)
3. ✅ ProtocolLogSchema.js (immutable audit trail)
4. ✅ TherapySessionSchema.js (SOAP notes)
5. ✅ PsychologicalAssessmentSchema.js (standardized tests)
6. ✅ ActivityLogSchema.js (system audit)

**Remaining schemas to create**:
1. RiskAssessmentSchema.js (formal C-SSRS evaluations)
2. SafetyPlanSchema.js (patient crisis plan)
3. CBTFormulationSchema.js (embedded in TreatmentPlan, but can be separate)
4. ConsentFormSchema.js (legal consent tracking)
5. ClinicalCredentialSchema.js (therapist licensing)
6. QualityMetricSchema.js (outcome tracking)

**Middleware needed**:
1. Document locking middleware (prevent edits after signature)
2. Audit logging middleware (log all data access)
3. Privacy sanitization middleware (strip clinician-only fields)
4. Encryption middleware (PHI at rest)

**Validation rules needed**:
1. C-SSRS score validation (0-5 ranges)
2. Phase progression validation (can only advance with justification)
3. Protocol step completion validation (required fields per step)
4. Risk level change validation (requires reassessment within 14 days)
