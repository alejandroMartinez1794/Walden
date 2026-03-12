# Basileia - Ethical Governance & Clinical Safety Evaluation

## Executive Summary

**Evaluation Date**: January 20, 2026  
**Evaluator Role**: Clinical Ethics & Telepsychology Governance  
**System**: Basileia (Virtual CBT Telepsychology Platform)  
**Standards Applied**: APA Telepsychology Guidelines, HIPAA, State Licensing Laws, Professional Ethics Codes

**Overall Assessment**: ⚠️ **CONDITIONALLY COMPLIANT** - System architecture demonstrates strong ethical foundations with appropriate safeguards, but requires explicit implementation of critical fail-safes before clinical deployment.

---

## Part 1: Ethical Compliance Assessment

### 1.1 APA Telepsychology Guidelines Compliance

#### ✅ **COMPLIANT Areas**:

**Informed Consent (APA Standard 3.10)**
- ✅ ConsentFormSchema includes TELEHEALTH-specific consent
- ✅ Disclosure of technology risks documented
- ✅ Alternative in-person options acknowledged
- ✅ Emergency backup procedures defined
- ✅ Electronic signature legally binding (ESIGN Act)

**Confidentiality & Privacy (APA Standard 4.01)**
- ✅ Three-tier access control (Patient/Clinician/System)
- ✅ Risk data `select: false` (never exposed to patients)
- ✅ Activity logging for HIPAA compliance
- ✅ Encryption planned for PHI at rest

**Professional Competence (APA Standard 2.01)**
- ✅ Doctor schema includes licensing verification
- ✅ Specialization tracking (CBT-specific)
- ✅ Supervision requirements for early-career clinicians

**Record Keeping (APA Standard 6.01)**
- ✅ 7-year retention policy
- ✅ Immutable session notes after signature
- ✅ Audit trail for all clinical decisions
- ✅ Protocol execution logs (court-defensible)

#### ⚠️ **NEEDS ENHANCEMENT**:

**Crisis Management (APA Telepsych Guideline 8)**
```
ISSUE: Virtual sessions create unique crisis challenges
CURRENT: Suicide protocol documented
MISSING: 
- Real-time location verification for 911 dispatch
- Local emergency contact database by jurisdiction
- Technology failure during active crisis protocol
```

**Recommendation**:
```javascript
// Add to SafetyPlanSchema
emergencyContext: {
  currentLocation: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    verifiedAt: Date, // Must be verified at start of EACH virtual session
  },
  localEmergencyServices: {
    phone: String, // May not be 911 in all countries
    nearestHospitalER: {
      name: String,
      address: String,
      phone: String,
      distance: Number, // miles from patient location
    },
  },
  jurisdictionCrisisResources: [
    {
      name: String, // "Los Angeles County Crisis Line"
      phone: String,
      availability: String,
    },
  ],
}
```

**Interjurisdictional Practice (APA Telepsych Guideline 5)**
```
ISSUE: Therapists may see patients across state lines
CURRENT: Doctor.licenseState field exists
MISSING:
- Multi-state license tracking
- Jurisdiction-specific consent requirements
- Cross-state crisis protocol differences
```

**Recommendation**:
```javascript
// Add to DoctorSchema
licenses: [
  {
    state: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    licenseType: String, // "Full", "Telehealth-only", "PSYPACT"
    issueDate: Date,
    expirationDate: Date,
    status: { type: String, enum: ["ACTIVE", "EXPIRED", "SUSPENDED"] },
    verifiedAt: Date, // Last verification with state board
  },
],
// Block sessions if patient in state where therapist not licensed
canPracticein: [String], // ["CA", "NY", "TX"] or ["PSYPACT"] (all participating states)
```

---

### 1.2 Informed Consent - Depth Evaluation

#### ✅ **STRONG Consent Framework**:

The ConsentFormSchema demonstrates **best-practice** informed consent:

1. **Granular Consent Types**: 11 distinct consent forms (therapy, telehealth, crisis contact, etc.)
2. **Disclosure Tracking**: Each disclosure acknowledged individually
3. **Withdrawal Rights**: Patient can withdraw consent anytime with documented reason
4. **Minor Protections**: Guardian signature required for <18 years old

#### ⚠️ **GAPS to Address**:

**Gap 1: Telehealth Consent - Technology Failure Scenarios**

Current disclosure acknowledges "technology risks" but lacks specificity:

```javascript
// ENHANCE: ConsentFormSchema.specificConsents.telehealthDetails
telehealthDetails: {
  platformsUsed: ["Zoom", "Doxy.me"], // ✅ Good
  technologyRequirements: String, // ✅ Good
  privacyRisksAcknowledged: Boolean, // ✅ Good
  
  // ADD THESE:
  technologyFailureScenarios: [
    {
      scenario: "VIDEO_DISCONNECTION_DURING_CRISIS",
      contingencyPlan: "Therapist will immediately call patient's phone. If no answer within 2 minutes, will contact emergency contact listed in safety plan.",
      patientAcknowledged: Boolean,
    },
    {
      scenario: "PLATFORM_OUTAGE",
      contingencyPlan: "Session will continue via phone. If phone unavailable, session rescheduled within 24h.",
      patientAcknowledged: Boolean,
    },
    {
      scenario: "PATIENT_ENVIRONMENT_NOT_PRIVATE",
      contingencyPlan: "Patient responsible for ensuring private space. If privacy compromised mid-session, patient will notify therapist immediately.",
      patientAcknowledged: Boolean,
    },
  ],
  
  patientResponsibilities: {
    ensurePrivateSpace: Boolean, // Patient confirms private location
    testTechnologyBefore: Boolean, // Patient will test video/audio before each session
    haveBackupPhone: Boolean, // Patient has working phone as backup
    shareLocationIfCrisis: Boolean, // Patient consents to share location during crisis
  },
}
```

**Ethical Rationale**: 
- Standard of care for telepsychology requires **explicit** discussion of technology failure scenarios
- Patient autonomy requires understanding what happens when technology fails
- Liability protection: Clinician documents that patient was informed

**Gap 2: Limits of Confidentiality - Tarasoff Clarity**

Current disclosure includes "CONFIDENTIALITY_LIMITS" but needs explicit Tarasoff language:

```javascript
// ENHANCE: ConsentFormSchema.disclosures
{
  disclosureType: "CONFIDENTIALITY_LIMITS",
  disclosureText: `
    Your information is confidential EXCEPT in these situations:
    
    1. IMMINENT HARM TO SELF: If I believe you are at imminent risk of harming yourself, 
       I am required by law to take steps to protect you, which may include:
       - Contacting your emergency contact
       - Calling 911 or local emergency services
       - Involuntary hospitalization if necessary
    
    2. IMMINENT HARM TO OTHERS (Tarasoff Duty): If you make a credible threat to harm 
       a specific, identifiable person, I am required by law to:
       - Warn the intended victim
       - Notify law enforcement
       - Take reasonable steps to prevent harm
    
    3. CHILD/ELDER ABUSE: I am a mandated reporter. If I suspect abuse or neglect of 
       a child, elderly person, or dependent adult, I must report to authorities.
    
    4. COURT ORDER: If a judge orders release of your records, I must comply.
    
    5. HEALTH INSURANCE: If you use insurance, your diagnosis and treatment dates 
       will be shared with your insurance company.
    
    By signing, you acknowledge that you understand these limits and that I will 
    prioritize safety over confidentiality in emergencies.
  `,
  acknowledged: Boolean, // Patient must check this box
  
  // ADD THESE CONFIRMATION QUESTIONS (teach-back method):
  comprehensionCheck: [
    {
      question: "In your own words, when would I need to break confidentiality to protect you?",
      patientResponse: String, // Free text - clinician reviews
    },
    {
      question: "What would happen if you told me you planned to harm someone?",
      patientResponse: String,
    },
  ],
}
```

**Ethical Rationale**:
- Legal requirement (Tarasoff v. Regents of University of California)
- Ethical duty: Patient cannot provide informed consent without understanding limits
- Risk management: Explicit documentation that patient was informed

---

### 1.3 Confidentiality & Boundaries - Telepsychology-Specific

#### ✅ **STRONG Privacy Architecture**:

1. **Data Segregation**: Patient NEVER sees risk assessments, protocols, clinician notes
2. **Audit Trails**: ActivityLog tracks all data access (who, what, when, where)
3. **Role-Based Access**: Middleware enforces patient vs. clinician queries

#### 🔴 **CRITICAL GAPS**:

**Red Flag #1: Virtual Session Recording**

```
ISSUE: System does not address session recording policies
RISK: 
- Patient could record session without consent (illegal in 2-party consent states)
- Clinician recording without patient consent (ethics violation)
- Recordings create discoverable evidence (legal liability)
- Breach if recordings stolen/hacked
```

**REQUIRED Addition**:
```javascript
// Add to ConsentFormSchema
{
  consentType: "RECORDING",
  recordingPolicy: {
    clinicianRecords: {
      type: String,
      enum: ["NEVER", "SUPERVISION_ONLY", "RESEARCH_WITH_CONSENT"],
      default: "NEVER",
    },
    clinicianNotification: {
      type: String,
      required: true,
      // "I will never record our sessions" OR
      // "I may record sessions for supervision purposes only with your explicit consent"
    },
    patientRecording: {
      allowed: { type: Boolean, default: false },
      consentRequired: { type: Boolean, default: true },
      policy: String, // "You may not record our sessions under any circumstances"
    },
    platformAutoRecording: {
      disclosed: Boolean, // Zoom/Doxy may have recording features
      disabledConfirmed: Boolean, // Clinician confirms recording disabled in platform settings
    },
  },
}
```

**Design Rule**: 
```
RULE: System MUST require RECORDING consent before first telehealth session
ENFORCEMENT: Middleware blocks session creation without active RECORDING consent
```

**Red Flag #2: Patient Environment Privacy**

```
ISSUE: Clinician cannot verify patient is in private space during virtual sessions
RISK:
- Third parties overhearing session content (HIPAA violation)
- Patient coerced by abuser present off-camera
- Children present during disclosure of sensitive content
```

**REQUIRED Addition**:
```javascript
// Add to TherapySessionSchema
virtualSessionContext: {
  patientLocation: {
    type: String,
    enum: ["HOME_PRIVATE_ROOM", "HOME_SHARED_SPACE", "VEHICLE", "PUBLIC_SPACE", "OTHER"],
    required: true, // Ask at start of EVERY virtual session
  },
  privacyConfirmed: {
    type: Boolean,
    required: true,
    // Patient confirms: "I am alone and can speak freely"
  },
  othersPresent: {
    present: Boolean,
    names: [String], // If family member present with patient consent
    relationship: [String],
  },
  privacyConcerns: {
    identified: Boolean, // Clinician notes concern (e.g., patient seems guarded)
    action: String, // "Offered to reschedule for more private time"
  },
}
```

**Design Rule**:
```
RULE: Clinician MUST verify patient privacy at start of EACH virtual session
ENFORCEMENT: Session note cannot be signed without virtualSessionContext.privacyConfirmed = true
FAIL-SAFE: If privacy cannot be confirmed, clinician must document in session note
```

---

## Part 2: Telepsychology Limits - What System CANNOT Do

### 2.1 Clinical Situations Requiring In-Person Care

#### 🚫 **ABSOLUTE CONTRAINDICATIONS for Virtual-Only Treatment**:

```javascript
// Add to TreatmentPlanSchema
teletherapyContraindications: [
  {
    condition: {
      type: String,
      enum: [
        "ACUTE_PSYCHOSIS", // Hallucinations, delusions requiring immediate stabilization
        "ACUTE_MANIA", // Bipolar mania with high-risk behavior
        "ACTIVE_EATING_DISORDER_MEDICAL_INSTABILITY", // Low weight, cardiac issues
        "SEVERE_DISSOCIATION", // Cannot maintain connection to reality in session
        "COGNITIVE_IMPAIRMENT_SEVERE", // Cannot navigate technology or retain safety plan
        "SUBSTANCE_INTOXICATION_CURRENT", // Patient impaired during session
        "IMMINENT_VIOLENCE_RISK", // Homicidal ideation with plan
        "PHYSICAL_EXAM_REQUIRED", // Neurological symptoms requiring assessment
      ],
    },
    identified: Boolean,
    identifiedAt: Date,
    clinicianRationale: String, // Why virtual therapy inappropriate
    referralAction: {
      type: String,
      enum: [
        "TRANSITION_TO_IN_PERSON", // Same therapist, switch modality
        "REFER_TO_HIGHER_LEVEL_OF_CARE", // IOP, PHP, Inpatient
        "REFER_TO_SPECIALIST", // Psychiatrist, Neurologist
        "EMERGENCY_HOSPITALIZATION", // Immediate danger
      ],
    },
    referralProtocolActivated: Boolean, // Links to ProtocolLog
  },
]
```

**Design Rule #1**:
```
RULE: System MUST NOT allow protocol to continue virtual-only when contraindication identified
ENFORCEMENT: 
- If teletherapyContraindication added → System auto-creates ClinicalAlert
- Alert severity: CRITICAL
- Recommended action: "Activate Referral Protocol"
- Patient dashboard shows: "Your therapist needs to discuss treatment adjustments"
  (NOT "Your therapist thinks you're too sick for therapy" - non-stigmatizing language)
```

**Design Rule #2**:
```
RULE: System MUST document WHY virtual therapy appropriate for THIS patient
ENFORCEMENT:
- At intake (INTAKE phase), clinician must complete:
  TreatmentPlan.teletherapySuitability: {
    assessed: true,
    contraindicationsRuledOut: true, // Clinician confirms no acute psychosis, mania, etc.
    justification: "Patient presents with moderate depression and anxiety; cognitively intact; 
                    stable housing; reliable internet; appropriate for virtual CBT",
  }
- Cannot progress to ASSESSMENT phase without this documentation
```

### 2.2 Technology Failure During Crisis - Fail-Safe Protocols

#### 🔴 **CRITICAL Risk Scenario**: Video disconnects during suicide crisis disclosure

**Current System**: 
- ProtocolLog has "SUICIDE_PROTOCOL" steps
- SafetyPlan has emergency contacts

**MISSING FAIL-SAFE**:

```javascript
// Add to ProtocolLogSchema
technologyFailure: {
  occurred: Boolean,
  occurredAt: Date,
  failureType: {
    type: String,
    enum: [
      "VIDEO_DISCONNECTION",
      "AUDIO_FAILURE",
      "PLATFORM_OUTAGE",
      "PATIENT_LOST_INTERNET",
      "PATIENT_DEVICE_DIED",
      "PATIENT_ENDED_SESSION_ABRUPTLY",
    ],
  },
  protocolStep: Number, // Which step was in progress when failure occurred
  immediateAction: {
    type: String,
    enum: [
      "CALLED_PATIENT_PHONE_IMMEDIATELY",
      "TEXTED_PATIENT_CHECK_IN",
      "CONTACTED_EMERGENCY_CONTACT",
      "CALLED_911_WELFARE_CHECK",
      "DOCUMENTED_AND_MONITORED",
    ],
    required: true,
  },
  patientReconnected: Boolean,
  reconnectionTime: Number, // Minutes until reconnection
  protocolCompletion: {
    type: String,
    enum: [
      "COMPLETED_VIA_PHONE", // Continued protocol over phone
      "COMPLETED_IN_PERSON_EMERGENCY", // Patient came to office
      "COMPLETED_AFTER_RECONNECTION", // Video restored
      "ESCALATED_TO_EMERGENCY_SERVICES", // Could not reach patient, called 911
      "SUSPENDED_PATIENT_STABLE", // Patient contacted later, was safe
    ],
  },
  legalDocumentation: {
    attemptsMade: [
      {
        timestamp: Date,
        action: String, // "Called patient cell phone 555-1234"
        outcome: String, // "Voicemail - left message"
      },
    ],
    finalOutcome: String, // "Patient safe, protocol completed via phone 15 minutes later"
  },
}
```

**Design Rule #3**:
```
RULE: If technology fails during active SUICIDE_PROTOCOL or CRISIS_PROTOCOL → IMMEDIATE escalation
ENFORCEMENT:
- System detects session disconnect (heartbeat check every 30 seconds)
- If disconnect during protocol.status === "IN_PROGRESS" AND protocol.protocolType IN ["SUICIDE_PROTOCOL", "CRISIS_PROTOCOL"]
  → Auto-sends SMS to clinician: "URGENT: Session with [Patient] disconnected during crisis protocol. Contact immediately."
- Clinician has 2 minutes to log action taken (call patient, contact emergency contact)
- If no action logged in 5 minutes → Supervisor auto-notified
```

**Design Rule #4**:
```
RULE: Patient emergency contact MUST have phone number verified
ENFORCEMENT:
- SafetyPlan.supportContacts[0].phone → System sends verification SMS before plan activation
- SMS: "You are listed as an emergency contact for [Patient] in therapy. Reply YES to confirm this number is correct."
- If no reply within 24h → Clinician notified to reverify contact
```

---

## Part 3: Risk Management - Suicide & Crisis Safety

### 3.1 Risk Assessment Frequency - Clinical Standards

#### ✅ **STRONG**: Auto-calculated follow-up deadlines

Current system:
- IMMINENT risk → Reassess in 24h
- HIGH risk → Reassess in 48h
- MODERATE → Reassess in 1 week
- LOW → Reassess in 2 weeks

#### ⚠️ **ENHANCEMENT NEEDED**: Overdue assessment enforcement

**Current**: `nextAssessmentDue` field exists
**MISSING**: What happens if deadline passes?

```javascript
// Add to ClinicalDecisionEngine.js
async function checkOverdueRiskAssessments() {
  const overdue = await RiskAssessment.find({
    'followUp.nextAssessmentDue': { $lt: new Date() },
    supersededBy: null, // Not yet replaced by newer assessment
  }).populate('patientId psychologistId');

  for (const assessment of overdue) {
    const hoursPastDue = (new Date() - assessment.followUp.nextAssessmentDue) / (1000 * 60 * 60);
    
    // Escalation logic
    if (assessment.clinicalImpression.overallRiskLevel === 'IMMINENT' && hoursPastDue > 24) {
      // CRITICAL: IMMINENT risk, no reassessment for 24+ hours
      await ClinicalAlert.create({
        patientId: assessment.patientId,
        alertType: 'PROTOCOL_VIOLATION',
        severity: 'CRITICAL',
        title: 'OVERDUE RISK REASSESSMENT - IMMINENT RISK PATIENT',
        description: `Patient at IMMINENT suicide risk has not been reassessed in ${Math.floor(hoursPastDue)} hours. 
                      Last assessment: ${assessment.assessmentDate}. 
                      Required reassessment: ${assessment.followUp.nextAssessmentDue}.`,
        recommendedActions: [
          'Contact patient immediately',
          'Conduct emergency risk assessment',
          'Document reason for delay',
          'Notify supervisor',
        ],
      });
      
      // Auto-notify supervisor
      await sendSupervisorAlert(assessment.assessedBy, {
        priority: 'CRITICAL',
        message: `Overdue risk reassessment for high-risk patient ${assessment.patientId}`,
      });
    }
    
    else if (assessment.clinicalImpression.overallRiskLevel === 'HIGH' && hoursPastDue > 48) {
      // HIGH risk, no reassessment for 48+ hours
      await ClinicalAlert.create({
        patientId: assessment.patientId,
        alertType: 'PROTOCOL_VIOLATION',
        severity: 'WARNING',
        title: 'Overdue Risk Reassessment - High Risk Patient',
        // ... similar to above
      });
    }
    
    // ... etc for MODERATE and LOW
  }
}

// Run this check every hour via cron job
```

**Design Rule #5**:
```
RULE: System MUST flag overdue risk reassessments as PROTOCOL_VIOLATION
RATIONALE: Standard of care requires timely risk monitoring
ENFORCEMENT: 
- Cron job runs hourly
- Creates ClinicalAlert for clinician
- If IMMINENT or HIGH risk overdue → Supervisor auto-notified
FAIL-SAFE: Cannot sign protocol as complete if risk reassessment overdue
```

### 3.2 Hospitalization Recommendations - Liability Protection

#### 🔴 **HIGH LIABILITY RISK**: Clinician declines hospitalization for high-risk patient

**Current System**:
- ProtocolLog.steps includes "Hospitalization Evaluation"
- Clinician can choose YES or NO
- Justification required if NO

**MISSING SAFEGUARD**: Second opinion requirement

```javascript
// Add to ProtocolLogSchema SUICIDE_PROTOCOL Step 2 (Hospitalization Evaluation)
hospitalizationDecision: {
  recommendation: {
    type: String,
    enum: ["VOLUNTARY_RECOMMENDED", "INVOLUNTARY_RECOMMENDED", "NOT_RECOMMENDED"],
    required: true,
  },
  clinicianJustification: {
    type: String,
    required: true,
    minlength: 100, // Force detailed reasoning
  },
  
  // NEW: Risk-based consultation requirements
  consultationRequired: {
    type: Boolean,
    default: function() {
      // Auto-true if declining hospitalization for HIGH/IMMINENT risk
      return (this.recommendation === "NOT_RECOMMENDED") && 
             (this.riskLevel === "HIGH" || this.riskLevel === "IMMINENT");
    },
  },
  consultationCompleted: {
    consultedWith: {
      type: mongoose.Types.ObjectId,
      ref: 'Doctor', // Supervisor or psychiatrist
      required: function() { return this.consultationRequired; },
    },
    consultedAt: Date,
    consultantRecommendation: {
      type: String,
      enum: ["AGREED_WITH_OUTPATIENT", "RECOMMENDED_HOSPITALIZATION", "DEFERRED_TO_PRIMARY"],
    },
    consultantNotes: String,
  },
  
  // NEW: If consultation recommends hospitalization but clinician still declines
  consultationDisagreement: {
    disagreed: Boolean,
    clinicianFinalRationale: String, // Must explain why overriding consultant
    supervisorNotified: Boolean, // Auto-escalate disagreements
    patientInformed: Boolean, // Patient told that consultant recommended hospitalization
  },
  
  // Patient's response to recommendation
  patientResponse: {
    agreedToHospitalization: Boolean,
    refusedHospitalization: Boolean,
    refusalReason: String,
    refusalDocumented: String, // Verbatim patient statement
    alternativeSafetyPlan: String, // If patient refuses, what is backup plan?
  },
}
```

**Design Rule #6**:
```
RULE: Declining hospitalization for HIGH/IMMINENT risk REQUIRES consultation
RATIONALE: 
- Standard of care (APA Practice Guidelines)
- Liability protection (demonstrates consultation with colleagues)
- Clinical safety (catches potential blind spots)
ENFORCEMENT:
- If recommendation === "NOT_RECOMMENDED" AND riskLevel IN ["HIGH", "IMMINENT"]
  → consultationRequired auto-set to TRUE
- Protocol step cannot be marked complete until consultationCompleted fields populated
- If consultant disagrees → Supervisor auto-notified
```

**Design Rule #7**:
```
RULE: Patient refusal of hospitalization MUST be documented verbatim
RATIONALE: Legal protection if adverse outcome occurs
ENFORCEMENT:
- If patientResponse.refusedHospitalization === true
  → refusalDocumented field required (min 50 chars)
- System prompts: "Document patient's exact words refusing hospitalization"
- alternativeSafetyPlan required (what will keep patient safe instead?)
```

---

## Part 4: Professional Accountability - Clinician Responsibility Boundaries

### 4.1 What Clinician MUST Do (Cannot Delegate to System)

#### 🧠 **HUMAN-ONLY Clinical Decisions**:

```
╔══════════════════════════════════════════════════════════════╗
║              CLINICIAN RESPONSIBILITY MATRIX                  ║
╠══════════════════════════════════════════════════════════════╣
║ Decision Type          │ System Role      │ Clinician Role   ║
╠════════════════════════╪══════════════════╪══════════════════╣
║ Risk Assessment        │ Suggests based   │ MAKES FINAL      ║
║ (Suicide)              │ on C-SSRS score  │ DETERMINATION    ║
║                        │                  │ (gut feeling     ║
║                        │                  │  matters)        ║
╠════════════════════════╪══════════════════╪══════════════════╣
║ Hospitalization        │ Flags high risk  │ DECIDES          ║
║ Decision               │                  │ YES/NO           ║
║                        │                  │ (System NEVER    ║
║                        │                  │  auto-admits)    ║
╠════════════════════════╪══════════════════╪══════════════════╣
║ Protocol Activation    │ Suggests when    │ ACTIVATES        ║
║                        │ thresholds met   │ (with            ║
║                        │                  │  justification)  ║
╠════════════════════════╪══════════════════╪══════════════════╣
║ Phase Progression      │ Checks criteria  │ APPROVES         ║
║ (CBT Phases)           │ met              │ (clinical        ║
║                        │                  │  judgment)       ║
╠════════════════════════╪══════════════════╪══════════════════╣
║ Diagnosis              │ CANNOT suggest   │ DETERMINES       ║
║                        │                  │ (DSM-5 code)     ║
╠════════════════════════╪══════════════════╪══════════════════╣
║ Tarasoff Duty          │ Flags threat     │ DECIDES if       ║
║ (Duty to Warn)         │ keywords         │ credible &       ║
║                        │                  │ ACTS (warn/      ║
║                        │                  │  notify police)  ║
╠════════════════════════╪══════════════════╪══════════════════╣
║ Confidentiality        │ CANNOT decide    │ BREAKS ONLY      ║
║ Breach                 │                  │ when legally     ║
║                        │                  │ required         ║
╠════════════════════════╪══════════════════╪══════════════════╣
║ Treatment Planning     │ Suggests         │ DESIGNS          ║
║                        │ evidence-based   │ individualized   ║
║                        │ techniques       │ plan             ║
╚════════════════════════╧══════════════════╧══════════════════╝
```

**Design Rule #8**:
```
RULE: System displays recommendations as "Suggested Action" NOT "Required Action"
UI LANGUAGE:
✅ CORRECT: "Based on risk factors, you may want to consider activating the suicide protocol."
❌ WRONG:   "Suicide protocol must be activated."
❌ WRONG:   "System has activated suicide protocol." (No! Only clinician activates)

RATIONALE: 
- Preserves clinical autonomy
- Avoids malpractice liability for system developer
- Clinician remains solely responsible for treatment decisions
```

**Design Rule #9**:
```
RULE: Every system recommendation MUST include "Override" option with justification
IMPLEMENTATION:
- When system suggests protocol activation → [Activate] [Dismiss]
- If clinician clicks [Dismiss] → Modal: "Why are you not activating this protocol?"
  → Free text required (min 100 chars)
  → Logged to ActivityLog (clinician overrode system recommendation)
- Acceptable reasons: "Clinical judgment: Patient's risk lower than score suggests due to strong support system"
```

### 4.2 Documentation Requirements - What Clinician MUST Record

#### 📋 **Legally Required Documentation**:

```javascript
// Enforce via pre-save middleware on TherapySessionSchema
TherapySessionSchema.pre('save', function(next) {
  if (this.signature && this.signature.signedAt) {
    // Session note being signed → Enforce mandatory fields
    
    // 1. Risk assessment REQUIRED every session
    if (!this.riskAssessment || !this.riskAssessment.evaluated) {
      throw new Error('Cannot sign session note without risk assessment. Standard of care requires suicide risk screening every session.');
    }
    
    // 2. SOAP notes REQUIRED (cannot be empty)
    if (!this.soapNotes.subjective || this.soapNotes.subjective.length < 50) {
      throw new Error('SOAP Subjective section too brief. Minimum 50 characters required.');
    }
    if (!this.soapNotes.assessment || this.soapNotes.assessment.length < 50) {
      throw new Error('SOAP Assessment section too brief. Clinical interpretation required.');
    }
    
    // 3. If criticalSession flagged → Crisis notes REQUIRED
    if (this.criticalSession && (!this.crisisNotes || this.crisisNotes.length < 100)) {
      throw new Error('Critical session flagged but crisis notes insufficient. Detailed documentation required for legal protection.');
    }
    
    // 4. Homework review REQUIRED (if homework was assigned)
    const priorSession = await TherapySession.findOne({
      patientId: this.patientId,
      sessionNumber: this.sessionNumber - 1
    });
    
    if (priorSession && priorSession.behavioralAssignments.length > 0) {
      if (!this.homeworkReview || !this.homeworkReview.reviewed) {
        throw new Error('Previous session assigned homework but no review documented this session.');
      }
    }
  }
  
  next();
});
```

**Design Rule #10**:
```
RULE: Session note signature BLOCKED if mandatory documentation missing
RATIONALE:
- Legal protection: Incomplete notes = malpractice vulnerability
- Standard of care: Risk assessment every session (APA guidelines)
- Quality assurance: Ensures clinician reflection (Assessment section)
ENFORCEMENT: Pre-save middleware throws error if required fields empty
```

---

## Part 5: Patient Protection Mechanisms

### 5.1 Autonomy & Informed Consent - Ongoing Process

#### ⚠️ **ISSUE**: Consent is not one-time event

**Current System**: ConsentForm signed at intake
**MISSING**: Ongoing consent for emerging risks

```javascript
// Add to TreatmentPlanSchema
ongoingConsentEvents: [
  {
    event: {
      type: String,
      enum: [
        "RISK_LEVEL_INCREASED", // Risk escalated from LOW → MODERATE/HIGH
        "TREATMENT_APPROACH_CHANGED", // Switched from CBT to DBT
        "TELEHEALTH_TO_IN_PERSON", // Modality change
        "CONSULTATION_REQUESTED", // Therapist seeking supervision
        "RELEASE_OF_INFO_REQUESTED", // Coordinating with PCP
        "CRISIS_PROTOCOL_ACTIVATED", // Patient needs to know protocol in effect
      ],
    },
    occurredAt: Date,
    patientInformed: Boolean, // Did clinician discuss with patient?
    patientConsent: {
      type: String,
      enum: ["CONSENTED", "DECLINED", "DEFERRED_DECISION"],
    },
    documentedWhere: String, // "Session #12 SOAP notes"
    consentFormUpdated: Boolean, // If new consent form required
  },
]
```

**Design Rule #11**:
```
RULE: Major treatment changes REQUIRE re-consent conversation
TRIGGER EVENTS:
- Risk level increases 2+ levels (LOW → HIGH)
- Crisis protocol activated
- Clinician recommends hospitalization
- Treatment approach changes (e.g., adding medication referral)
ENFORCEMENT:
- System creates task: "Discuss [event] with patient and document consent"
- Cannot mark event as resolved without documentation
- Session note must reference consent conversation
```

### 5.2 Right to Refuse Treatment - Documentation

#### 🚫 **PATIENT RIGHTS**: Can refuse any intervention

**Current System**: No explicit right-to-refuse tracking
**MISSING**: Documentation when patient declines recommendation

```javascript
// Add to TherapySessionSchema
patientRefusals: [
  {
    refusedIntervention: {
      type: String,
      enum: [
        "HOSPITALIZATION",
        "MEDICATION_EVALUATION",
        "INCREASED_SESSION_FREQUENCY",
        "SAFETY_PLAN_IMPLEMENTATION",
        "EMERGENCY_CONTACT_NOTIFICATION",
        "SUBSTANCE_USE_ASSESSMENT",
        "COUPLES_THERAPY_REFERRAL",
        "HIGHER_LEVEL_OF_CARE",
      ],
    },
    clinicianRecommendation: String, // Why clinician suggested intervention
    patientReason: String, // Patient's stated reason for refusal
    patientQuote: String, // Verbatim: "I don't think I need to go to the hospital"
    clinicianResponse: {
      accepted: Boolean, // Did clinician accept refusal or try to persuade?
      persuasionAttempts: String, // "Discussed benefits of medication for 10 minutes"
      finalOutcome: {
        type: String,
        enum: [
          "PATIENT_CHANGED_MIND", // Agreed after discussion
          "PATIENT_MAINTAINED_REFUSAL", // Still declined
          "DEFERRED_TO_NEXT_SESSION", // Will revisit
          "EMERGENCY_OVERRIDE", // Involuntary hospitalization (rare)
        ],
      },
    },
    alternativePlan: String, // If patient refuses, what is Plan B?
    riskDocumented: Boolean, // Did clinician document risks of refusing?
    patientInformedRisks: String, // "Informed patient that refusing hospitalization increases suicide risk"
  },
]
```

**Design Rule #12**:
```
RULE: Patient refusal of recommended intervention MUST be documented
RATIONALE:
- Respects patient autonomy (ethical requirement)
- Legal protection (clinician not liable if patient refuses and was informed of risks)
- Clinical continuity (future therapist knows patient declined certain options)
ENFORCEMENT:
- If clinician recommends intervention → System prompts: "Did patient consent? [Yes] [No]"
- If [No] → patientRefusals form auto-opens
- Cannot complete session note without documenting refusal
```

### 5.3 Access to Own Records - Patient Rights

#### ✅ **STRONG**: Patient can view sanitized data

**Current Design**:
- Patient sees: therapy goals, homework, session summaries
- Patient does NOT see: SOAP notes, risk assessments, protocols

#### ⚠️ **LEGAL REQUIREMENT**: HIPAA Right of Access

```
HIPAA: Patients have right to access their medical records within 30 days of request
EXCEPTION: Process notes (psychotherapy notes) can be withheld
```

**MISSING IMPLEMENTATION**:

```javascript
// Add to UserSchema (Patient)
recordAccessRequests: [
  {
    requestedAt: Date,
    requestType: {
      type: String,
      enum: [
        "FULL_MEDICAL_RECORD", // All session notes, assessments, etc.
        "SPECIFIC_DATE_RANGE", // Sessions between X and Y
        "DIAGNOSIS_ONLY", // Just want to know diagnosis
        "TREATMENT_SUMMARY", // High-level summary for new provider
      ],
    },
    reason: String, // Patient states why they want records (optional)
    
    clinicianReview: {
      reviewedBy: { type: mongoose.Types.ObjectId, ref: 'Doctor' },
      reviewedAt: Date,
      
      processNotesExcluded: Boolean, // Therapist withholds process notes per HIPAA exception
      safetyRiskAssessment: {
        type: String,
        enum: [
          "NO_RISK", // Safe to release all records
          "POTENTIAL_HARM", // Releasing might harm patient (e.g., reading hopeless thoughts could trigger)
          "THIRD_PARTY_RISK", // Records contain info about third party
        ],
      },
      clinicianNotes: String, // Why releasing or why excluding certain info
    },
    
    recordsProvided: {
      providedAt: Date,
      format: { type: String, enum: ["PDF", "PAPER", "PORTAL_ACCESS"] },
      documentsIncluded: [String], // ["Session notes 1-10", "Treatment plan", "PHQ-9 scores"]
      documentsExcluded: [String], // ["Process notes", "Consultation notes with supervisor"]
      exclusionJustification: String, // Legal basis for exclusion
    },
    
    daysToCompletion: Number, // HIPAA requires ≤30 days
  },
]
```

**Design Rule #13**:
```
RULE: Patient record requests MUST be fulfilled within 30 days (HIPAA)
ENFORCEMENT:
- recordAccessRequests auto-creates task for clinician
- Dashboard shows: "Record request pending (X days remaining)"
- If 30 days elapsed → System sends reminder email
- If 35 days → Compliance alert (potential HIPAA violation)
```

---

## Part 6: Red Flags to Avoid - Design Anti-Patterns

### 6.1 🚫 **NEVER Implement These Features**:

#### ❌ **Red Flag #1: AI-Generated Clinical Recommendations**

```
FORBIDDEN: "AI suggests patient is at high risk of suicide"
WHY: 
- No AI model is FDA-approved for suicide risk prediction
- "Black box" AI decisions = not explainable = not court-defensible
- Liability: If AI wrong and patient harmed, who is responsible?
ALLOWED: Rule-based decision support (IF PHQ-9 #9 ≥ 2 THEN flag for review)
```

```javascript
// ❌ NEVER DO THIS:
async function predictSuicideRisk(patientData) {
  const prediction = await AIModel.predict(patientData); // NO!
  return { riskLevel: prediction.risk, confidence: prediction.confidence };
}

// ✅ CORRECT APPROACH:
async function flagRiskIndicators(patientData) {
  const flags = [];
  
  // Explicit, explainable rules only
  if (patientData.phq9Item9 >= 2) {
    flags.push({
      indicator: "PHQ-9 Item #9 (suicidal ideation) >= 2",
      source: "PHQ-9 Assessment",
      action: "Recommend formal suicide risk assessment (C-SSRS)",
    });
  }
  
  if (patientData.priorAttempts > 0) {
    flags.push({
      indicator: "History of prior suicide attempt",
      source: "Clinical history",
      action: "Enhanced monitoring, safety plan review",
    });
  }
  
  return { flags, clinicianReview: "REQUIRED" };
}
```

**Design Rule #14**:
```
RULE: NO machine learning in clinical decision-making
RATIONALE:
- Legal: AI decisions not defensible in court ("I don't know why the AI said that")
- Ethical: Patient deserves transparent reasoning
- Clinical: Undermines clinician judgment
ENFORCEMENT: Code review rejects any ML/AI imports in clinical modules
```

#### ❌ **Red Flag #2: Automated Crisis Interventions**

```
FORBIDDEN: System automatically calls 911 based on algorithm
WHY:
- False positives = patient traumatized by police showing up
- False negatives = patient at risk but system didn't detect
- Legal: System developer liable for outcome
ALLOWED: System ALERTS clinician who DECIDES whether to call 911
```

```javascript
// ❌ NEVER DO THIS:
if (riskScore > 80) {
  await call911(patient.location); // NO! Never auto-call
  await notifyEmergencyContact(patient.emergencyContact);
}

// ✅ CORRECT APPROACH:
if (riskScore > 80) {
  await ClinicalAlert.create({
    severity: "CRITICAL",
    title: "HIGH RISK SCORE - IMMEDIATE CLINICIAN REVIEW",
    description: "Risk indicators suggest imminent danger. Clinician must assess and determine if 911 call warranted.",
    recommendedActions: [
      "Contact patient immediately",
      "Conduct C-SSRS assessment",
      "Consider calling 911 if patient endorses plan + intent",
      "Document decision in protocol log",
    ],
  });
  
  await sendCliniciannAlert(patient.clinician, "URGENT: High-risk patient requires immediate assessment");
}
```

**Design Rule #15**:
```
RULE: System NEVER takes emergency action without human approval
EXCEPTIONS: None (even in "obvious" emergencies, clinician decides)
RATIONALE:
- Clinical: Context matters (patient may have said triggering phrase sarcastically)
- Legal: Clinician is licensed professional, system is not
- Ethical: Respects patient autonomy (doesn't want police called every time mentions "death")
```

#### ❌ **Red Flag #3: Coercive Treatment Prompts**

```
FORBIDDEN: "You must complete homework to continue therapy"
WHY:
- Ethical: Violates patient autonomy
- Clinical: Coercion damages therapeutic alliance
- Discriminatory: Penalizes patients with executive dysfunction
```

```javascript
// ❌ NEVER DO THIS:
if (homeworkCompletionRate < 0.4) {
  await TreatmentPlan.update({ status: "SUSPENDED" }); // NO!
  await sendPatientMessage("Your therapy is on hold until you complete assignments");
}

// ✅ CORRECT APPROACH:
if (homeworkCompletionRate < 0.4 && consecutiveWeeks >= 3) {
  await ClinicalAlert.create({
    alertType: "NON_ADHERENCE",
    severity: "WARNING",
    recommendedActions: [
      "Explore barriers to homework completion",
      "Consider simplifying assignments",
      "Assess if treatment approach appropriate",
      "Offer motivational interviewing",
    ],
  });
  
  // Clinician addresses in session (collaborative problem-solving)
  // Patient NEVER threatened or penalized
}
```

**Design Rule #16**:
```
RULE: System NEVER coerces patient behavior
FORBIDDEN LANGUAGE:
❌ "You must..."
❌ "Therapy will be terminated if..."
❌ "Your therapist will not see you unless..."
ALLOWED:
✅ "Your therapist noticed you had difficulty with homework and would like to discuss"
✅ "Consider trying..."
✅ "Some patients find it helpful to..."
```

#### ❌ **Red Flag #4: Stigmatizing Language**

```
FORBIDDEN: "Patient is non-compliant"
WHY: 
- Stigmatizing ("non-compliant" = patient's fault)
- Inaccurate (maybe homework was unclear, not patient's failure)
- Unethical (blames patient for system failure)
CORRECT: "Patient completed 1/3 assignments; explore barriers"
```

**Person-First Language Guidelines**:
```javascript
// System-generated messages MUST use person-first language

// ❌ WRONG:
"Suicidal patient requires hospitalization"
"Borderline patient engaging in splitting"
"Non-adherent patient missing sessions"

// ✅ CORRECT:
"Patient experiencing suicidal ideation"
"Patient with BPD diagnosis exhibiting..."
"Patient attending 50% of scheduled sessions"

// Code review rejects: "suicidal patient", "borderline patient", "non-compliant patient"
```

---

## Part 7: System Constraints - Hard Limits

### 7.1 Technical Safeguards - What System Must Prevent

```javascript
// Enforce these rules via middleware, schema validation, or database constraints

const SYSTEM_CONSTRAINTS = {
  
  // 1. Maximum session duration (prevent accidental all-day session logging)
  MAX_SESSION_DURATION: 120, // minutes (2 hours max)
  
  // 2. Minimum time between sessions (prevent data entry errors)
  MIN_SESSION_INTERVAL: 2, // hours (sessions must be ≥2 hours apart)
  
  // 3. Maximum patients per clinician (prevent burnout)
  MAX_ACTIVE_PATIENTS_PER_CLINICIAN: 50,
  
  // 4. Risk assessment expiration (cannot use old data for decisions)
  RISK_ASSESSMENT_VALIDITY: {
    IMMINENT: 24, // hours - expires after 24h
    HIGH: 72,
    MODERATE: 168, // 1 week
    LOW: 336, // 2 weeks
  },
  
  // 5. Protocol step timeout (cannot leave protocol incomplete indefinitely)
  PROTOCOL_STEP_TIMEOUT: {
    SUICIDE_PROTOCOL: 24, // hours - entire protocol must complete within 24h
    CRISIS_PROTOCOL: 4,
    REFERRAL_PROTOCOL: 168, // 1 week
  },
  
  // 6. Safety plan update requirement (must review when risk changes)
  SAFETY_PLAN_UPDATE_TRIGGERS: [
    "RISK_LEVEL_INCREASED",
    "HOSPITALIZATION_OCCURRED",
    "NEW_STRESSOR_IDENTIFIED",
    "SUPPORT_CONTACT_CHANGED",
  ],
  
  // 7. Consent form expiration
  CONSENT_EXPIRATION: {
    TELEHEALTH: 365, // days - annual renewal
    RELEASE_OF_INFORMATION: 365,
    RECORDING: 365,
    GENERAL_THERAPY: null, // Never expires (but must be reviewed annually)
  },
  
  // 8. Session note completion deadline
  SESSION_NOTE_DEADLINE: 48, // hours - clinician must sign note within 48h of session
  
  // 9. Supervisor consultation requirement
  SUPERVISOR_CONSULT_REQUIRED: {
    NEW_CLINICIAN_FIRST_X_CASES: 10, // First 10 patients require supervision
    HIGH_RISK_PATIENT: true, // All HIGH/IMMINENT risk require consult
    PROTOCOL_DISAGREEMENT: true, // If overriding system recommendation
    INVOLUNTARY_HOSPITALIZATION: true, // Always consult before involuntary
  },
  
  // 10. Patient data export restrictions
  DATA_EXPORT_LIMITATIONS: {
    MAX_PATIENTS_PER_EXPORT: 100, // Bulk export limited
    REQUIRES_JUSTIFICATION: true, // Must document reason for export
    LOGGED_TO_AUDIT: true, // All exports tracked
    SUPERVISOR_APPROVAL_IF_OVER: 10, // exports >10 patients need approval
  },
};
```

### 7.2 Enforcement Mechanisms

```javascript
// Example: Enforce session note deadline

// Cron job runs daily
async function enforceSessionNoteDeadline() {
  const overdueSessions = await TherapySession.find({
    sessionDate: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000) }, // >48h ago
    'signature.signedAt': null, // Not yet signed
  }).populate('psychologist');

  for (const session of overdueSessions) {
    const hoursPastDue = (new Date() - session.sessionDate) / (1000 * 60 * 60);
    
    if (hoursPastDue > 48 && hoursPastDue <= 72) {
      // 48-72h: Warning to clinician
      await sendEmail(session.psychologist.email, {
        subject: 'Session Note Overdue',
        body: `Session #${session.sessionNumber} with patient ${session.patientId} is overdue for documentation. 
               Session date: ${session.sessionDate}. Please complete note today.`,
      });
    }
    
    else if (hoursPastDue > 72) {
      // >72h: Supervisor notification + compliance alert
      await ClinicalAlert.create({
        alertType: 'COMPLIANCE_VIOLATION',
        severity: 'WARNING',
        title: 'Overdue Session Documentation',
        description: `Session note incomplete ${Math.floor(hoursPastDue)} hours after session. 
                      Standard of care requires documentation within 48 hours.`,
      });
      
      await notifySupervisor(session.psychologist.supervisorId, {
        issue: 'LATE_DOCUMENTATION',
        clinician: session.psychologist.name,
        patient: session.patientId,
      });
    }
  }
}
```

---

## Part 8: Final Recommendations

### 8.1 Pre-Deployment Checklist

Before launching Basileia, **MUST complete**:

#### Legal & Compliance:
- [ ] Malpractice insurance policy obtained (covering telepsychology)
- [ ] HIPAA Business Associate Agreements (BAAs) signed with all vendors (Zoom, AWS, etc.)
- [ ] Data breach response plan documented
- [ ] Informed consent forms reviewed by attorney (state-specific)
- [ ] Tarasoff duty protocol reviewed by legal counsel

#### Clinical Safety:
- [ ] Crisis protocol tested with mock scenarios
- [ ] Technology failure contingency plans tested
- [ ] Emergency contact verification system implemented
- [ ] Supervisor notification system tested
- [ ] Overdue risk assessment alerts tested

#### Technical Security:
- [ ] Penetration testing completed
- [ ] PHI encryption at rest verified
- [ ] Data backup/recovery tested
- [ ] Audit log integrity verified (immutable)
- [ ] Access control tested (patient cannot access clinician-only data)

#### Staff Training:
- [ ] All clinicians trained on telepsychology ethics
- [ ] All clinicians trained on crisis protocol execution
- [ ] All clinicians trained on documentation requirements
- [ ] Supervisors trained on alert response procedures

### 8.2 Ongoing Monitoring Requirements

**Monthly**:
- Review all CRITICAL alerts (were they addressed timely?)
- Audit overdue risk assessments (any patterns?)
- Review protocol execution times (delays?)

**Quarterly**:
- Malpractice claim review (any litigation trends?)
- Consent withdrawal analysis (why patients withdrawing?)
- Technology failure incidents (need better contingency?)

**Annually**:
- External audit of privacy practices (HIPAA compliance)
- Review of clinical outcomes (suicide attempts, hospitalizations)
- Update consent forms for legal/regulatory changes
- Staff continuing education on ethics

### 8.3 Ethical Design Principles - Summary

1. **Transparency**: Patient always knows what data is collected and how used
2. **Autonomy**: Patient can refuse any intervention without penalty
3. **Beneficence**: System prioritizes patient safety over convenience
4. **Non-Maleficence**: System prevents harm (coercion, stigma, privacy breaches)
5. **Justice**: System does not discriminate (accessibility for disabilities, languages)
6. **Fidelity**: Clinician-patient relationship paramount (system supports, doesn't replace)

---

## Conclusion

**Basileia demonstrates strong ethical foundations** with appropriate separation of concerns (patient vs. clinician data), legal compliance frameworks (HIPAA, informed consent), and clinical safety mechanisms (risk assessment, protocols).

**Critical gaps identified** require immediate attention before clinical deployment:
1. Real-time location verification for virtual crisis scenarios
2. Technology failure contingency protocols
3. Second opinion requirements for high-risk decisions
4. Patient refusal documentation
5. Overdue assessment escalation

**Final Verdict**: ⚠️ **NOT YET READY** for full clinical deployment.  
**Recommendation**: Complete Phase 2 safeguards (outlined above) + conduct pilot with 5-10 patients under close supervision before broader rollout.

**Estimated Time to Clinical Readiness**: 4-6 weeks (if addressing gaps systematically)

---

**Document Prepared By**: Clinical Ethics & Telepsychology Governance Review  
**Next Review**: After implementation of critical safeguards  
**Contact for Questions**: [Clinical Director / Ethics Committee]
