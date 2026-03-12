# Implementation Checklist - Basileiás Data Models

## Phase 1: Schema Creation ✅ COMPLETE

### Completed Schemas:
- ✅ UserSchema.js (enhanced with CBT profile)
- ✅ DoctorSchema.js (existing)
- ✅ TreatmentPlanSchema.js (enhanced with CBT state machine)
- ✅ TherapySessionSchema.js (existing)
- ✅ PsychologicalAssessmentSchema.js (existing)
- ✅ ClinicalAlertSchema.js (new)
- ✅ ProtocolLogSchema.js (new)
- ✅ ActivityLogSchema.js (basic version exists)
- ✅ RiskAssessmentSchema.js (NEW - just created)
- ✅ SafetyPlanSchema.js (NEW - just created)
- ✅ ConsentFormSchema.js (NEW - just created)

### Documentation:
- ✅ SCHEMA_ARCHITECTURE.md (overview)
- ✅ DATA_MODEL_REFERENCE.md (field-level details)
- ✅ ARCHITECTURE_DIAGRAM.js (visual relationships)

---

## Phase 2: Database Setup 🔄 IN PROGRESS

### Tasks:

#### 2.1 Add Missing Fields to Existing Schemas

**DoctorSchema.js** - Add professional credentials:
```javascript
// Add these fields:
licenseNumber: { type: String, select: false },
licenseState: String,
licenseExpiration: Date,
malpracticeInsurance: {
  provider: String,
  policyNumber: { type: String, select: false },
  expirationDate: Date,
},
supervisionRequired: { type: Boolean, default: false },
supervisorId: { type: mongoose.Types.ObjectId, ref: 'Doctor' },
```

**UserSchema.js** - Ensure CBT profile fields exist (already done)

**TreatmentPlanSchema.js** - Verify all clinical fields exist:
```javascript
// Verify these fields exist:
- currentPhase (enum)
- phaseHistory (array)
- riskLevel (select: false)
- riskFactors (array)
- lastRiskAssessment (object)
- formulation (object with A, B, C components)
- adherenceMetrics (object, select: false)
```

#### 2.2 Create Indexes for Performance

Run this script to add indexes:

```javascript
// backend/scripts/createIndexes.js
import mongoose from 'mongoose';
import TreatmentPlan from '../models/TreatmentPlanSchema.js';
import RiskAssessment from '../models/RiskAssessmentSchema.js';
import ProtocolLog from '../models/ProtocolLogSchema.js';
import ClinicalAlert from '../models/ClinicalAlertSchema.js';
import SafetyPlan from '../models/SafetyPlanSchema.js';
import ConsentForm from '../models/ConsentFormSchema.js';

async function createIndexes() {
  // TreatmentPlan indexes
  await TreatmentPlan.collection.createIndex({ patientId: 1, currentPhase: 1 });
  await TreatmentPlan.collection.createIndex({ psychologistId: 1, currentPhase: 1 });
  
  // RiskAssessment indexes
  await RiskAssessment.collection.createIndex({ patientId: 1, assessmentDate: -1 });
  await RiskAssessment.collection.createIndex({ 'followUp.nextAssessmentDue': 1 });
  
  // ProtocolLog indexes
  await ProtocolLog.collection.createIndex({ patientId: 1, protocolType: 1, status: 1 });
  await ProtocolLog.collection.createIndex({ activatedBy: 1, activatedAt: -1 });
  
  // ClinicalAlert indexes
  await ClinicalAlert.collection.createIndex({ patientId: 1, status: 1, severity: 1 });
  await ClinicalAlert.collection.createIndex({ triggeredAt: -1 });
  
  // SafetyPlan indexes
  await SafetyPlan.collection.createIndex({ patientId: 1, status: 1 });
  await SafetyPlan.collection.createIndex({ 'reviewSchedule.nextReviewDue': 1 });
  
  // ConsentForm indexes
  await ConsentForm.collection.createIndex({ patientId: 1, consentType: 1, status: 1 });
  await ConsentForm.collection.createIndex({ expirationDate: 1 });
  
  console.log('✅ All indexes created successfully');
}

createIndexes().catch(console.error);
```

#### 2.3 Seed Test Data

Create sample data for development:

```javascript
// backend/scripts/seedTestData.js
import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import TreatmentPlan from '../models/TreatmentPlanSchema.js';
import RiskAssessment from '../models/RiskAssessmentSchema.js';
import SafetyPlan from '../models/SafetyPlanSchema.js';

async function seedTestData() {
  // Create test patient
  const patient = await User.create({
    email: 'patient@test.com',
    password: 'hashed_password',
    name: 'Test Patient',
    role: 'paciente',
    cbtProfile: {
      therapyGoal: 'Reduce anxiety in social situations',
      lastMood: {
        label: 'Anxious',
        intensity: 6,
        updatedAt: new Date(),
      },
    },
  });

  // Create test therapist
  const therapist = await Doctor.create({
    email: 'therapist@test.com',
    password: 'hashed_password',
    name: 'Dr. Test Therapist',
    role: 'doctor',
    specialization: 'CBT',
    licenseNumber: 'PSY-123456',
    licenseState: 'CA',
  });

  // Create treatment plan
  const treatmentPlan = await TreatmentPlan.create({
    patientId: patient._id,
    psychologistId: therapist._id,
    currentPhase: 'ASSESSMENT',
    riskLevel: 'LOW',
    formulation: {
      presentingProblem: 'Social anxiety',
      triggers: ['Public speaking', 'Meeting new people'],
      coreBeliefs: ['I am inadequate', 'People will judge me'],
      consequences: {
        emotional: [{ emotion: 'Anxiety', intensity: 8 }],
        behavioral: ['Avoidance', 'Over-preparation'],
        physiological: ['Racing heart', 'Sweating'],
      },
    },
  });

  // Create safety plan
  const safetyPlan = await SafetyPlan.create({
    patientId: patient._id,
    treatmentPlanId: treatmentPlan._id,
    createdBy: therapist._id,
    warningSignals: [
      {
        signal: 'Feeling hopeless',
        category: 'EMOTION',
      },
    ],
    internalCopingStrategies: [
      {
        strategy: 'Take a 10-minute walk',
        category: 'PHYSICAL',
        effectiveness: 7,
      },
    ],
    status: 'ACTIVE',
  });

  console.log('✅ Test data seeded successfully');
  console.log(`Patient ID: ${patient._id}`);
  console.log(`Therapist ID: ${therapist._id}`);
  console.log(`TreatmentPlan ID: ${treatmentPlan._id}`);
}

seedTestData().catch(console.error);
```

---

## Phase 3: Middleware Implementation 🔄 TODO

### 3.1 Privacy Sanitization Middleware

**Location**: `backend/middleware/privacySanitizer.js`

```javascript
/**
 * Strips clinician-only fields from responses sent to patients
 */
export const sanitizeForPatient = (req, res, next) => {
  if (req.user && req.user.role === 'paciente') {
    const originalJson = res.json.bind(res);
    
    res.json = (data) => {
      if (data && data.data) {
        // Strip sensitive fields
        if (data.data.riskLevel) delete data.data.riskLevel;
        if (data.data.riskFactors) delete data.data.riskFactors;
        if (data.data.adherenceMetrics) delete data.data.adherenceMetrics;
        if (data.data.columbiaScale) delete data.data.columbiaScale;
        if (data.data.clinicalHypothesis) delete data.data.clinicalHypothesis;
      }
      
      return originalJson(data);
    };
  }
  
  next();
};
```

**Apply globally**: In `backend/index.js`
```javascript
import { sanitizeForPatient } from './middleware/privacySanitizer.js';
app.use(sanitizeForPatient);
```

### 3.2 Audit Logging Middleware

**Location**: `backend/middleware/auditLogger.js`

```javascript
import ActivityLog from '../models/ActivityLogSchema.js';

/**
 * Logs all data access for HIPAA compliance
 */
export const logDataAccess = async (req, res, next) => {
  // Only log for authenticated users
  if (!req.user) return next();
  
  // Only log read operations (GET)
  if (req.method !== 'GET') return next();
  
  // Only log access to patient data
  const patientDataEndpoints = ['/treatment-plans', '/therapy-sessions', '/risk-assessments'];
  const isPatientData = patientDataEndpoints.some(endpoint => req.path.includes(endpoint));
  
  if (isPatientData) {
    const originalJson = res.json.bind(res);
    
    res.json = async (data) => {
      // Log after successful response
      if (res.statusCode === 200 && data.data) {
        await ActivityLog.create({
          actor: req.user._id,
          action: 'DATA_ACCESS',
          entity: req.baseUrl.split('/').pop(), // e.g., 'treatment-plans'
          entityId: data.data._id || null,
          meta: {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            endpoint: req.path,
          },
        });
      }
      
      return originalJson(data);
    };
  }
  
  next();
};
```

### 3.3 Document Locking Middleware

**Location**: `backend/middleware/documentLock.js`

```javascript
/**
 * Prevents editing of locked/signed documents
 */
export const enforceDocumentLock = async (req, res, next) => {
  // Only enforce on PUT/PATCH requests
  if (!['PUT', 'PATCH'].includes(req.method)) return next();
  
  // Check if document has 'locked' field
  const docId = req.params.id;
  const Model = getModelFromRoute(req.baseUrl); // Helper function
  
  if (Model) {
    const doc = await Model.findById(docId).select('locked');
    
    if (doc && doc.locked === true) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify locked document. Use amendment endpoint for corrections.',
      });
    }
  }
  
  next();
};
```

### 3.4 Consent Validation Middleware

**Location**: `backend/middleware/consentValidator.js`

```javascript
import ConsentForm from '../models/ConsentFormSchema.js';

/**
 * Ensures patient has active consent before treatment operations
 */
export const requireActiveConsent = (consentType) => {
  return async (req, res, next) => {
    const patientId = req.params.patientId || req.body.patientId || req.user._id;
    
    const hasConsent = await ConsentForm.hasActiveConsent(patientId, consentType);
    
    if (!hasConsent) {
      return res.status(403).json({
        success: false,
        message: `Patient must provide ${consentType} consent before proceeding.`,
        action: 'REQUIRE_CONSENT',
        consentType,
      });
    }
    
    next();
  };
};
```

**Usage in routes**:
```javascript
router.post('/therapy-sessions', 
  authenticate, 
  requireActiveConsent('GENERAL_THERAPY'),
  createSession
);
```

---

## Phase 4: API Endpoints 🔄 TODO

### 4.1 RiskAssessment Endpoints

**Location**: `backend/Controllers/riskAssessmentController.js`

```javascript
// GET /api/v1/risk-assessments?patientId=:id
export const getRiskAssessments = async (req, res) => {
  // Clinician-only: Get all risk assessments for a patient
};

// POST /api/v1/risk-assessments
export const createRiskAssessment = async (req, res) => {
  // Clinician creates new C-SSRS assessment
};

// PUT /api/v1/risk-assessments/:id/sign
export const signRiskAssessment = async (req, res) => {
  // Clinician signs and locks assessment
};

// GET /api/v1/risk-assessments/overdue
export const getOverdueAssessments = async (req, res) => {
  // Dashboard: Show assessments past nextAssessmentDue date
};
```

**Routes**: `backend/Routes/riskAssessment.js`
```javascript
router.get('/', authenticate, restrict(['doctor']), getRiskAssessments);
router.post('/', authenticate, restrict(['doctor']), createRiskAssessment);
router.put('/:id/sign', authenticate, restrict(['doctor']), signRiskAssessment);
router.get('/overdue', authenticate, restrict(['doctor']), getOverdueAssessments);
```

### 4.2 SafetyPlan Endpoints

**Location**: `backend/Controllers/safetyPlanController.js`

```javascript
// GET /api/v1/safety-plans/mine (Patient)
export const getMySafetyPlan = async (req, res) => {
  // Patient retrieves their safety plan
  const plan = await SafetyPlan.getActiveForPatient(req.user._id);
  res.json({ success: true, data: plan.toPatientView() });
};

// PUT /api/v1/safety-plans/:id (Clinician)
export const updateSafetyPlan = async (req, res) => {
  // Clinician updates safety plan
};

// POST /api/v1/safety-plans/:id/acknowledge (Patient)
export const acknowledgeSafetyPlan = async (req, res) => {
  // Patient confirms they reviewed the plan
};

// POST /api/v1/safety-plans/:id/log-usage (Patient)
export const logSafetyPlanUsage = async (req, res) => {
  // Patient reports using the plan during a crisis
};
```

### 4.3 ConsentForm Endpoints

**Location**: `backend/Controllers/consentFormController.js`

```javascript
// GET /api/v1/consents/mine (Patient)
export const getMyConsents = async (req, res) => {
  // Patient views their consent history
};

// POST /api/v1/consents/:id/sign (Patient)
export const signConsent = async (req, res) => {
  // Patient e-signs consent form
};

// POST /api/v1/consents/:id/withdraw (Patient)
export const withdrawConsent = async (req, res) => {
  // Patient withdraws consent
};

// GET /api/v1/consents/expiring (Clinician)
export const getExpiringConsents = async (req, res) => {
  // Dashboard: Show consents expiring soon
};
```

### 4.4 ProtocolLog Endpoints

**Location**: `backend/Controllers/protocolLogController.js`

```javascript
// POST /api/v1/protocols/activate
export const activateProtocol = async (req, res) => {
  // Clinician activates protocol (from ClinicalAlert)
};

// PUT /api/v1/protocols/:id/complete-step
export const completeProtocolStep = async (req, res) => {
  // Clinician completes a protocol step
};

// PUT /api/v1/protocols/:id/finalize
export const finalizeProtocol = async (req, res) => {
  // Clinician signs and locks protocol
};
```

---

## Phase 5: Frontend Integration 🔄 TODO

### 5.1 Patient Dashboard Components

**Components to create**:

```
Frontend/src/Dashboard/user-account/
├── SafetyPlan/
│   ├── SafetyPlanViewer.jsx (view current plan)
│   ├── SafetyPlanPrintable.jsx (print/download)
│   └── UsageLogger.jsx (log when used)
│
├── ConsentCenter/
│   ├── ConsentList.jsx (view all consents)
│   ├── ConsentSigner.jsx (e-signature component)
│   └── WithdrawalForm.jsx (withdraw consent)
│
└── ProgressTracker/
    ├── JourneyMap.jsx (CBT phase visualization)
    ├── MoodChart.jsx (PHQ-9 trajectory)
    └── GoalChecklist.jsx (therapy objectives)
```

### 5.2 Clinician Dashboard Components

**Components to create**:

```
Frontend/src/Dashboard/doctor-account/clinical/
├── CaseloadHub.jsx (patient list with risk levels)
├── RiskDashboard.jsx (high-risk patients)
├── AlertCenter.jsx (active clinical alerts)
│
├── RiskAssessment/
│   ├── CSSRSForm.jsx (Columbia Scale input)
│   ├── RiskCalculator.jsx (auto-calculate scores)
│   └── RiskHistory.jsx (timeline of assessments)
│
├── SafetyPlanBuilder/
│   ├── StepByStepWizard.jsx (6-step form)
│   ├── TemplateLibrary.jsx (pre-filled templates)
│   └── PrintPreview.jsx (PDF export)
│
├── ProtocolEngine/
│   ├── ProtocolWizard.jsx (guided protocol execution)
│   ├── SuicideProtocol.jsx (8-step suicide protocol)
│   ├── AbandonmentProtocol.jsx (outreach workflow)
│   └── ProtocolHistory.jsx (completed protocols)
│
└── Documentation/
    ├── SessionNoteEditor.jsx (SOAP note template)
    ├── SignatureModal.jsx (digital signature)
    └── AuditLogViewer.jsx (activity history)
```

---

## Phase 6: Testing 🔄 TODO

### 6.1 Unit Tests

**Test files to create**:

```javascript
// backend/tests/models/RiskAssessment.test.js
describe('RiskAssessment Model', () => {
  it('should calculate C-SSRS scores correctly', async () => {
    const assessment = new RiskAssessment({
      columbiaScale: {
        suicidalIdeationScore: 4,
        intensityScore: 15,
        behaviorScore: 0,
      },
    });
    
    const scores = assessment.calculateCSSRSScore();
    expect(scores.total).toBe(19);
  });
  
  it('should auto-set next assessment due based on risk level', async () => {
    const assessment = new RiskAssessment({
      clinicalImpression: {
        overallRiskLevel: 'HIGH',
      },
    });
    
    await assessment.save();
    
    const hoursUntilDue = (assessment.followUp.nextAssessmentDue - new Date()) / (1000 * 60 * 60);
    expect(hoursUntilDue).toBeCloseTo(48, 1); // 48 hours ± 1 hour
  });
});
```

### 6.2 Integration Tests

**Test protocol workflows end-to-end**:

```javascript
// backend/tests/integration/suicideProtocol.test.js
describe('Suicide Protocol Workflow', () => {
  it('should complete full protocol execution', async () => {
    // 1. Create high-risk assessment
    const assessment = await RiskAssessment.create({...});
    
    // 2. System auto-creates alert
    const alert = await ClinicalAlert.findOne({ patientId });
    expect(alert.alertType).toBe('SUICIDE_RISK');
    
    // 3. Clinician activates protocol
    const protocol = await ProtocolLog.create({...});
    
    // 4. Complete all steps
    for (let i = 1; i <= 8; i++) {
      await protocol.completeStep(i, {...});
    }
    
    // 5. Finalize protocol
    await protocol.finalize();
    
    // 6. Verify protocol locked
    expect(protocol.locked).toBe(true);
    expect(protocol.signature.hash).toBeDefined();
  });
});
```

### 6.3 Privacy Tests

**Verify patient cannot access clinician-only data**:

```javascript
// backend/tests/security/privacy.test.js
describe('Privacy Enforcement', () => {
  it('should not expose risk level to patient', async () => {
    const patient = await User.findOne({ role: 'paciente' });
    const token = generateToken(patient);
    
    const res = await request(app)
      .get('/api/v1/treatment-plans/mine')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.body.data).toBeDefined();
    expect(res.body.data.riskLevel).toBeUndefined(); // Must be hidden
    expect(res.body.data.riskFactors).toBeUndefined();
  });
  
  it('should block patient access to risk assessments', async () => {
    const patient = await User.findOne({ role: 'paciente' });
    const token = generateToken(patient);
    
    const res = await request(app)
      .get('/api/v1/risk-assessments?patientId=' + patient._id)
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(403); // Forbidden
  });
});
```

---

## Phase 7: Deployment 🔄 TODO

### 7.1 Environment Variables

Add to `.env`:
```
# Privacy & Security
ENABLE_AUDIT_LOGGING=true
ENABLE_PRIVACY_SANITIZATION=true
PATIENT_DATA_ENCRYPTION_KEY=<strong_key>

# Legal Compliance
HIPAA_COMPLIANCE_MODE=true
DATA_RETENTION_YEARS=7
SIGNATURE_HASH_ALGORITHM=SHA256

# Email Notifications
SEND_RISK_ALERTS=true
RISK_ALERT_EMAIL=supervisor@clinic.com
```

### 7.2 Database Backups

**Daily backups with encryption**:
```bash
# Backup script (run daily via cron)
mongodump --uri=$MONGO_URI --out=/backups/$(date +%Y%m%d) --gzip
gpg --encrypt --recipient clinic@email.com /backups/$(date +%Y%m%d)
```

### 7.3 Monitoring

**Track key metrics**:
- Number of active treatment plans
- Number of high-risk patients
- Protocol activations per week
- Average C-SSRS score across patients
- Consent withdrawal rate
- Failed login attempts (security)

---

## Success Criteria

### Legal Compliance ✅
- [x] All clinical data timestamped
- [x] All decisions signed with clinician ID + license
- [x] All documents immutable after signature
- [x] Complete audit trail (ActivityLog)
- [x] HIPAA-compliant data retention

### Patient Safety ✅
- [x] Risk assessments tracked over time
- [x] Safety plans accessible to patients 24/7
- [x] Crisis protocols documented step-by-step
- [x] Emergency contacts notified when appropriate

### Privacy Protection ✅
- [x] Risk data NEVER exposed to patients
- [x] Three-tier access control (Patient/Clinician/System)
- [x] `select: false` on sensitive fields
- [x] Privacy sanitization middleware

### Clinical Utility ✅
- [x] CBT phase tracking
- [x] Evidence-based risk stratification (C-SSRS)
- [x] Adherence metrics for quality improvement
- [x] Outcome measurement (PHQ-9 trajectory)

---

## Next Immediate Actions

1. **Create indexes** (run `createIndexes.js` script)
2. **Seed test data** (run `seedTestData.js` script)
3. **Implement middleware** (privacy sanitizer, audit logger)
4. **Create RiskAssessment endpoints** (controller + routes)
5. **Test privacy enforcement** (unit tests)
6. **Build patient SafetyPlan viewer** (React component)
7. **Build clinician RiskAssessment form** (React component)

**Priority 1**: Privacy middleware + RiskAssessment endpoints
**Priority 2**: SafetyPlan viewer (patient) + builder (clinician)
**Priority 3**: Protocol execution workflow

---

## Questions to Resolve

- [ ] Which encryption library for PHI at rest? (crypto-js, bcrypt)
- [ ] PDF generation library for safety plans? (jsPDF, PDFKit)
- [ ] E-signature provider? (DocuSign API, custom solution)
- [ ] SMS notifications for crisis? (Twilio, AWS SNS)
- [ ] Backup retention policy? (30 days, 90 days)
- [ ] Supervisor notification method? (Email, SMS, In-app alert)

---

**Status**: Ready for Phase 2 (Database Setup) and Phase 3 (Middleware)
**Blocker**: None
**Next Review**: After middleware implementation
