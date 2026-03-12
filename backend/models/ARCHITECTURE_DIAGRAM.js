/**
 * Basileiás Data Model Architecture - Visual Overview
 * 
 * This file provides a visual representation of the data relationships
 * and privacy boundaries in the system.
 * 
 * HOW TO READ THIS DIAGRAM:
 * - [Entity] = Collection/Schema
 * - -> = One-to-One relationship
 * - ->> = One-to-Many relationship
 * - (P) = Patient can view
 * - (C) = Clinician-only
 * - (S) = System/Legal-only
 * - 🔒 = Immutable after signature
 * - 🔐 = Always encrypted
 * - ⚠️ = High-risk data (never expose to patient)
 */

/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PATIENT TIER (Patient-Facing)                        │
│                         Patient CAN view these entities                      │
└─────────────────────────────────────────────────────────────────────────────┘

[User/Patient] (P)
├── email, name, phone, photo
├── role: "paciente"
├── [cbtProfile] (P) EMBEDDED
│   ├── therapyGoal
│   ├── lastMood
│   ├── abcRecord (latest thought record)
│   ├── microGoals (checkboxes)
│   ├── sessionPrompts
│   ├── behaviorExperiments
│   ├── copingToolkit
│   ├── safetyPlan (public fields only)
│   └── insights
│
├─>> [PsychologicalAssessment] (P - sanitized)
│    ├── testType (PHQ-9, GAD-7, etc.)
│    ├── testDate
│    ├── scores.total (patient sees score)
│    └── interpretation.severity ("Moderate Depression")
│
├─>> [ConsentForm] (P)
│    ├── consentType
│    ├── consentFormTitle
│    ├── status (ACTIVE, WITHDRAWN)
│    ├── signedAt
│    └── Can withdraw anytime
│
├─>> [SafetyPlan] (P - FULL ACCESS) ✅
│    ├── warningSignals
│    ├── internalCopingStrategies
│    ├── socialDistraction
│    ├── supportContacts
│    ├── professionalContacts
│    ├── reasonsForLiving
│    └── Patient can print/download
│
└─>> [TherapySession] (P - sanitized summary only)
     ├── sessionNumber
     ├── sessionDate
     ├── homework assignments
     └── No SOAP notes (clinician-only)

┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLINICIAN TIER (Clinical Data)                        │
│                    Clinician CAN view, Patient CANNOT view                   │
└─────────────────────────────────────────────────────────────────────────────┘

[TreatmentPlan] (C) ⚠️ MASTER CLINICAL RECORD
├── currentPhase (INTAKE → ASSESSMENT → FORMULATION → INTERVENTION...)
├── phaseHistory (audit trail)
│
├── [riskLevel] ⚠️ select: false (NEVER show to patient)
│   ├── LOW, MODERATE, HIGH, IMMINENT
│   └── Triggers protocols when thresholds crossed
│
├── riskFactors ⚠️ (prior attempts, substance use, etc.)
├── lastRiskAssessment ⚠️ (C-SSRS score, date, clinician)
│
├── [CBT Formulation] (C) EMBEDDED
│   ├── presentingProblem
│   ├── triggers (A in ABC model)
│   ├── coreBeliefs (B in ABC model)
│   ├── consequences (C in ABC model)
│   ├── maintenanceCycle
│   └── treatmentTargets
│
├── baselineMetrics (PHQ-9, GAD-7 at intake)
├── currentMetrics (latest scores)
├── progressTrajectory (timeseries)
│
├── objectives (therapy goals)
├── techniques (CBT interventions used)
├── adherenceMetrics ⚠️ (homework %, attendance %)
│
└── outcomeSummary (at termination)

[TherapySession] (C) 🔒 After signature
├── sessionNumber, sessionDate
├── modality (in-person, online, phone)
│
├── [SOAP Notes] (C - FULL CLINICAL DOCUMENTATION)
│   ├── Subjective (patient's self-report)
│   ├── Objective (clinician observations)
│   ├── Assessment (clinical interpretation)
│   └── Plan (interventions, homework)
│
├── automaticThoughts (ABC thought records)
├── behavioralAssignments
├── sessionRatings (anxiety, mood 0-10)
│
├── criticalSession ⚠️ (flag for crisis)
├── crisisNotes ⚠️
│
└── signature 🔒 (locks note when signed)
    ├── clinicianId
    ├── clinicianName
    ├── licenseNumber
    ├── signedAt
    └── hash (SHA-256)

[RiskAssessment] (C) ⚠️ 🔒 MAXIMUM RESTRICTION
├── [Columbia-Suicide Severity Rating Scale (C-SSRS)]
│   ├── screening (wishToBeDead, suicidalThoughts, method, intent, plan)
│   ├── intensityOfIdeation (frequency, duration, controllability)
│   └── behavior (actualAttempt, interruptedAttempt, preparatory)
│
├── Calculated Scores:
│   ├── suicidalIdeationScore (0-5)
│   ├── intensityScore (0-25)
│   └── behaviorScore (0-5)
│
├── [riskFactors] (evidence-based)
│   ├── demographic (age, gender)
│   ├── clinical (prior attempts, diagnosis, substance use)
│   ├── psychosocial (recent loss, isolation, financial stress)
│   ├── access (lethal means, method)
│   └── warning (recent discharge, expressed intent, goodbyes)
│
├── [protectiveFactors]
│   ├── internal (reasons for living, coping skills)
│   ├── external (social support, family, employment)
│   └── clinical (alliance, adherence)
│
├── clinicalImpression ⚠️
│   ├── overallRiskLevel (LOW, MODERATE, HIGH, IMMINENT)
│   ├── riskLevelJustification (required free text)
│   └── clinicianConcernLevel (0-10)
│
├── interventionPlan
│   ├── immediateActions
│   ├── safetyPlanReviewed
│   ├── hospitalizationRecommended (VOLUNTARY, INVOLUNTARY, NO)
│   └── protocolActivation
│
├── followUp
│   ├── nextAssessmentDue (auto-calculated based on risk)
│   └── AUTO: IMMINENT=24h, HIGH=48h, MODERATE=1week, LOW=2weeks
│
└── signature 🔒 (immutable after signing)

[ClinicalAlert] (C) ⚠️ DASHBOARD NOTIFICATIONS
├── alertType
│   ├── SUICIDE_RISK
│   ├── NON_ADHERENCE
│   ├── ABANDONMENT_RISK
│   ├── CRISIS
│   └── CLINICAL_DETERIORATION
│
├── severity (INFO, WARNING, CRITICAL)
├── triggeredBy (SYSTEM_AUTO, CLINICIAN_MANUAL, PATIENT_SELF_REPORT)
├── triggeredAt
├── triggerDetails (what caused alert)
│
├── recommendedActions (suggested next steps)
│
├── protocolActivated (if clinician activated protocol)
└── resolution (when/how alert resolved)

[ProtocolLog] (C) 🔒 IMMUTABLE AUDIT TRAIL
├── protocolType
│   ├── SUICIDE_PROTOCOL (8 steps)
│   ├── CRISIS_PROTOCOL (6 steps)
│   ├── REFERRAL_PROTOCOL (7 steps)
│   ├── ABANDONMENT_PROTOCOL (7 steps)
│   └── NON_ADHERENCE_PROTOCOL (5 steps)
│
├── protocolVersion (e.g., "v2.1" - for legal tracking)
├── activatedAt
├── activatedBy (clinicianId)
├── activationReason (clinical justification)
│
├── [steps] (step-by-step execution)
│   ├── stepNumber, stepName
│   ├── completed (Boolean)
│   ├── completedAt, completedBy
│   ├── notes (what happened)
│   ├── evidence (call logs, emails, documents)
│   └── outcome (SUCCESS, PARTIAL, FAILED, NOT_APPLICABLE)
│
├── columbiaScale (for suicide protocols)
├── safetyPlan (for suicide protocols)
├── decisionTrace (for legal explainability)
│
└── signature 🔒 (protocol locked when complete)
    ├── hash (SHA-256)
    └── amendments (if corrections needed, tracked separately)

┌─────────────────────────────────────────────────────────────────────────────┐
│                       SYSTEM TIER (Legal/Audit Only)                         │
│                  Access: System Admin, Court Order ONLY                      │
└─────────────────────────────────────────────────────────────────────────────┘

[ActivityLog] (S) 🔐 COMPLETE SYSTEM AUDIT
├── actor (who performed action)
├── action (what was done)
│   ├── DATA_ACCESS (who viewed patient file)
│   ├── PROTOCOL_ACTIVATED
│   ├── RISK_LEVEL_CHANGED
│   ├── PHASE_PROGRESSED
│   ├── CONSENT_WITHDRAWN
│   ├── FAILED_LOGIN
│   └── DATA_EXPORTED
│
├── entity (what was affected)
├── entityId
├── timestamp
├── ipAddress
├── sessionId
│
└── Retention: 10 years (legal requirement)

┌─────────────────────────────────────────────────────────────────────────────┐
│                        DOCTOR/THERAPIST PROFILE                              │
└─────────────────────────────────────────────────────────────────────────────┘

[Doctor] (Public profile + private credentials)
├── PUBLIC (patient can see):
│   ├── name, photo, bio, about
│   ├── specialization (CBT, DBT, Trauma)
│   ├── qualifications, experiences
│   ├── ticketPrice
│   ├── timeSlots (availability)
│   ├── reviews, averageRating
│   └── isApproved (admin verification)
│
└── PRIVATE (clinician/system only):
    ├── email, password (hashed)
    ├── licenseNumber 🔐
    ├── licenseState
    ├── licenseExpiration
    ├── malpracticeInsurance
    ├── supervisionRequired
    ├── supervisorId
    └── twoFactorSecret (select: false)

┌─────────────────────────────────────────────────────────────────────────────┐
│                          RELATIONSHIP DIAGRAM                                │
└─────────────────────────────────────────────────────────────────────────────┘

User (Patient)
 │
 ├──[1:1]──> TreatmentPlan ⚠️
 │            │
 │            ├──[1:N]──> TherapySession 🔒
 │            │
 │            ├──[1:N]──> RiskAssessment ⚠️ 🔒
 │            │            └─> Triggers: ClinicalAlert ⚠️
 │            │                          └─> May activate: ProtocolLog 🔒
 │            │
 │            └──[1:N]──> ClinicalAlert ⚠️
 │
 ├──[1:1]──> SafetyPlan ✅ (patient can view)
 │            └─> Updated when RiskAssessment.riskLevel changes
 │
 ├──[1:N]──> PsychologicalAssessment (PHQ-9, GAD-7)
 │            └─> Auto-triggers ClinicalAlert if PHQ-9 #9 >= 2 (suicidal ideation)
 │
 ├──[1:N]──> ConsentForm ✅ (patient can view/sign/withdraw)
 │            └─> REQUIRED before TreatmentPlan can be created
 │
 └──[1:N]──> ActivityLog 🔐 (patient CANNOT view)

Doctor (Therapist)
 │
 ├──[1:N]──> TreatmentPlan (patients under care)
 ├──[1:N]──> TherapySession (sessions conducted)
 ├──[1:N]──> RiskAssessment (risk evaluations performed)
 ├──[1:N]──> ProtocolLog (protocols executed)
 └──[1:N]──> ActivityLog (clinician actions tracked)

┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW EXAMPLES                                 │
└─────────────────────────────────────────────────────────────────────────────┘

EXAMPLE 1: Suicide Risk Detection
─────────────────────────────────
1. Patient completes PHQ-9 → PsychologicalAssessment created
2. PHQ-9 Item #9 (suicidal ideation) = 3 (score >= 2)
3. System auto-creates ClinicalAlert (type: SUICIDE_RISK, severity: CRITICAL)
4. Alert appears on clinician dashboard
5. Clinician opens alert → Reviews patient file
6. Clinician conducts formal RiskAssessment (C-SSRS)
7. C-SSRS score = 4 (Intent + Plan) → Risk = HIGH
8. System recommends: "Activate Suicide Protocol"
9. Clinician clicks [Activate Protocol]
10. ProtocolLog created → Step 1: Formal risk assessment (already done)
11. Clinician proceeds through protocol steps:
    - Step 2: Hospitalization evaluation (Decision: NO, outpatient safety plan)
    - Step 3: Safety planning (create/update SafetyPlan)
    - Step 4: Emergency contact notification (with consent)
    - Step 5: Follow-up schedule (next session: 48h)
    - Step 6: Psychiatric consultation (request sent)
    - Step 7: Legal documentation (auto-generated)
    - Step 8: Protocol closure (sign & lock)
12. TreatmentPlan.riskLevel updated to HIGH
13. SafetyPlan updated with new strategies
14. All actions logged in ActivityLog

EXAMPLE 2: Patient Views Dashboard
───────────────────────────────────
1. Patient logs in → AuthContext sets role: "paciente"
2. Patient dashboard queries:
   - GET /api/v1/users/me → Returns User (sanitized)
   - GET /api/v1/treatment-plans/mine → Returns TreatmentPlan
     BUT: .select('-riskLevel -riskFactors -adherenceMetrics')
     Patient sees: currentPhase, objectives, techniques
     Patient DOES NOT see: riskLevel, adherenceMetrics
3. Patient clicks "My Safety Plan"
   - GET /api/v1/safety-plans/mine → Returns SafetyPlan (full access)
   - Patient can print/download
4. Patient clicks "Session History"
   - GET /api/v1/therapy-sessions/mine → Returns sessions (sanitized)
   - Patient sees: sessionNumber, date, homework assignments
   - Patient DOES NOT see: SOAP notes, criticalSession flag
5. ALL patient queries logged in ActivityLog:
   - actor: patientId
   - action: DATA_ACCESS
   - entity: "TreatmentPlan", "SafetyPlan", "TherapySession"
   - timestamp, ipAddress

EXAMPLE 3: Clinician Dashboard
───────────────────────────────
1. Clinician logs in → AuthContext sets role: "doctor"
2. Clinician dashboard queries:
   - GET /api/v1/clinical/caseload → Returns patients with alerts/risk levels
   - Shows: Name, Current Phase, Next Session, Risk Level, Active Alerts
3. Clinician clicks patient "J. Pérez"
   - GET /api/v1/treatment-plans/:id → Returns TreatmentPlan (FULL DATA)
     Includes: riskLevel, riskFactors, adherenceMetrics (clinician-only)
   - GET /api/v1/risk-assessments?patientId=:id → History of all risk assessments
   - GET /api/v1/clinical/alerts?patientId=:id → Active alerts
   - GET /api/v1/protocol-logs?patientId=:id → Protocol history
4. Clinician views FULL clinical data (nothing hidden)
5. All clinician queries logged in ActivityLog

┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRIVACY ENFORCEMENT                                  │
└─────────────────────────────────────────────────────────────────────────────┘

MIDDLEWARE: Privacy Sanitization
────────────────────────────────
// In backend/auth/verifyToken.js
if (req.user.role === 'paciente') {
  // Strip clinician-only fields from all queries
  originalFind = mongoose.Query.prototype.find;
  mongoose.Query.prototype.find = function(conditions) {
    this.select('-riskLevel -riskFactors -adherenceMetrics -columbiaScore');
    return originalFind.call(this, conditions);
  };
}

SCHEMA-LEVEL: select: false
───────────────────────────
// In TreatmentPlanSchema.js
riskLevel: {
  type: String,
  enum: ['LOW', 'MODERATE', 'HIGH', 'IMMINENT'],
  select: false, // NEVER returned in queries unless explicitly requested
}

// Clinician must explicitly request:
TreatmentPlan.findById(id).select('+riskLevel +riskFactors')

API-LEVEL: Route Protection
───────────────────────────
// In routes/clinical.js
router.get('/risk-assessments', authenticate, restrict(['doctor']), getRiskAssessments);
// Patient role CANNOT access this endpoint (403 Forbidden)

QUERY-LEVEL: Data Filtering
───────────────────────────
// In controllers/treatmentController.js
getTreatmentPlan = async (req, res) => {
  let query = TreatmentPlan.findById(req.params.id);
  
  if (req.user.role === 'paciente') {
    // Patient query: strip sensitive fields
    query = query.select('-riskLevel -riskFactors -adherenceMetrics');
  }
  
  const plan = await query;
  res.json({ success: true, data: plan });
};

┌─────────────────────────────────────────────────────────────────────────────┐
│                         IMMUTABILITY ENFORCEMENT                             │
└─────────────────────────────────────────────────────────────────────────────┘

SIGNATURE & LOCKING
──────────────────
1. Document created → status: "DRAFT"
2. Clinician completes document
3. Clinician clicks "Sign & Finalize"
4. System generates SHA-256 hash of document content
5. Document updated:
   - signature: { clinicianId, licenseNumber, timestamp, hash }
   - locked: true
6. Pre-save middleware enforces:
   if (this.locked && this.isModified() && !this.isModified('amendments')) {
     throw new Error('Cannot modify locked document');
   }

AMENDMENTS (if correction needed)
──────────────────────────────────
1. Clinician calls: document.amend(clinician, reason, field, newValue)
2. System logs amendment:
   - amendedAt, amendedBy, reason
   - changes: { field, oldValue, newValue }
   - amendmentHash (SHA-256)
3. Amendment added to amendments[] array
4. Original document unchanged (audit trail preserved)

LEGAL BENEFIT
─────────────
- Court can verify document integrity (hash comparison)
- Any tampering detected (hash mismatch)
- All corrections tracked (amendment trail)
- Clinician accountability (signature + license number)

*/

export const dataModelArchitecture = {
  version: "1.0.0",
  lastUpdated: "2026-01-20",
  totalSchemas: 10,
  privacyTiers: 3,
  immutableSchemas: ["RiskAssessment", "ProtocolLog", "TherapySession", "ConsentForm"],
  patientAccessible: ["User", "SafetyPlan", "ConsentForm", "PsychologicalAssessment (sanitized)"],
  clinicianOnly: [
    "TreatmentPlan (full)",
    "RiskAssessment",
    "ClinicalAlert",
    "ProtocolLog",
    "TherapySession (SOAP notes)",
  ],
  systemOnly: ["ActivityLog"],
  legalCompliance: ["HIPAA", "ESIGN_ACT", "UETA", "Tarasoff"],
};
