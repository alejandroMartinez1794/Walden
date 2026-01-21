// backend/models/TreatmentPlanSchema.js
import mongoose from 'mongoose';

/**
 * TreatmentPlan Schema - The Master Clinical Record (ENHANCED CBT VERSION)
 * 
 * This schema represents the entire CBT treatment journey for a patient.
 * It implements the clinical state machine and tracks progression through therapy phases.
 * 
 * Clinical Phases (CBT Lifecycle):
 * - INTAKE: Initial screening, consent, eligibility
 * - ASSESSMENT: 2-3 sessions of data collection (PHQ-9, GAD-7, clinical interview)
 * - FORMULATION: Collaborative CBT case conceptualization
 * - INTERVENTION: Core CBT work (8-16 sessions)
 * - CONSOLIDATION: Relapse prevention, maintenance
 * - FOLLOW_UP: Post-discharge monitoring (1mo, 3mo, 6mo)
 * 
 * Risk Levels (NEVER exposed to patient frontend):
 * - LOW: Standard monitoring
 * - MODERATE: Enhanced monitoring, weekly check-ins
 * - HIGH: Crisis protocol standby, safety plan active
 * - IMMINENT: Immediate protocol activation required
 */

const treatmentPlanSchema = new mongoose.Schema({
  // Relaciones (backwards compatible with existing code)
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PsychologicalPatient', 
    required: true,
    index: true
  },
  // Alias for new clinical architecture
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  psychologist: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: true,
    index: true
  },
  // Alias for new clinical architecture
  psychologistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  },

  // ============= NEW: CLINICAL STATE MACHINE =============
  currentPhase: {
    type: String,
    enum: [
      'INTAKE',
      'ASSESSMENT',
      'FORMULATION',
      'INTERVENTION',
      'CONSOLIDATION',
      'FOLLOW_UP',
    ],
    default: 'INTAKE',
    index: true,
  },
  phaseHistory: [
    {
      phase: String,
      enteredAt: { type: Date, default: Date.now },
      exitedAt: Date,
      clinicianNotes: String,
    },
  ],

  // ============= NEW: RISK ASSESSMENT (CRITICAL) =============
  riskLevel: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH', 'IMMINENT'],
    default: 'LOW',
    select: false, // Prevent accidental exposure in queries
  },
  riskFactors: [
    {
      factor: String,
      severity: { type: String, enum: ['LOW', 'MODERATE', 'HIGH'] },
      identifiedAt: { type: Date, default: Date.now },
      mitigationPlan: String,
    },
  ],
  lastRiskAssessment: {
    date: Date,
    assessedBy: { type: mongoose.Types.ObjectId, ref: 'Doctor' },
    columbiaScore: Number,
    interventionRequired: Boolean,
  },

  // ============= NEW: BASELINE AND PROGRESS METRICS =============
  baselineMetrics: {
    phq9: { type: Number, min: 0, max: 27 },
    gad7: { type: Number, min: 0, max: 21 },
    whodas: { type: Number, min: 0, max: 100 },
    assessmentDate: Date,
  },
  currentMetrics: {
    phq9: Number,
    gad7: Number,
    lastUpdated: Date,
  },

  // ============= NEW: TREATMENT STATUS =============
  status: {
    type: String,
    enum: [
      'ACTIVE',
      'ON_HOLD',
      'COMPLETED',
      'DISCHARGED',
      'REFERRED_OUT',
      'ABANDONED',
    ],
    default: 'ACTIVE',
    index: true,
  },
  statusReason: String,

  // ============= NEW: ADHERENCE TRACKING =============
  adherenceMetrics: {
    totalSessionsScheduled: { type: Number, default: 0 },
    totalSessionsAttended: { type: Number, default: 0 },
    totalSessionsCancelled: { type: Number, default: 0 },
    totalSessionsNoShow: { type: Number, default: 0 },
    homeworkCompletionRate: { type: Number, min: 0, max: 100 },
    lastAttendedSession: Date,
  },

  // ============= EXISTING FIELDS (PRESERVED) =============
  // Marco teórico y enfoque terapéutico
  theoreticalOrientation: {
    type: String,
    enum: ['CBT', 'DBT', 'ACT', 'Psychodynamic', 'Humanistic', 'Integrative', 'Other'],
    default: 'CBT', // Por defecto TCC
  },

  // Diagnósticos tratados en este plan
  targetDiagnoses: [String],

  // Objetivos terapéuticos (criterios SMART)
  goals: [{
    description: { type: String, required: true },
    specific: String, // ¿Qué específicamente quiere lograr?
    measurable: String, // ¿Cómo se medirá el progreso?
    achievable: Boolean,
    timeframe: String, // Ej: "3 meses", "6 sesiones"
    status: { 
      type: String, 
      enum: ['not-started', 'in-progress', 'achieved', 'revised'], 
      default: 'not-started' 
    },
    progress: Number, // Porcentaje 0-100
  }],

  // Técnicas y estrategias TCC a utilizar
  interventionTechniques: [{
    technique: {
      type: String,
      enum: [
        'cognitive-restructuring',
        'behavioral-activation',
        'exposure-therapy',
        'relaxation-training',
        'mindfulness',
        'problem-solving',
        'social-skills-training',
        'assertiveness-training',
        'thought-stopping',
        'activity-scheduling',
        'graded-task-assignment',
        'other'
      ],
    },
    description: String,
    targetSymptom: String,
  }],

  // Frecuencia y duración del tratamiento
  sessionFrequency: {
    type: String,
    default: 'weekly', // 'weekly', 'biweekly', 'monthly'
  },
  estimatedDuration: String, // Ej: "12-16 sesiones", "3-6 meses"
  
  // Criterios de alta
  dischargeCriteria: [{
    criterion: String,
    met: { type: Boolean, default: false },
  }],

  // Seguimiento del progreso
  progressReviews: [{
    date: Date,
    summary: String,
    adjustments: String, // Ajustes al plan
  }],

  // Obstáculos y plan de contingencia
  potentialBarriers: String,
  contingencyPlan: String,

  // Estado del plan
  status: {
    type: String,
    enum: ['active', 'completed', 'revised', 'discontinued'],
    default: 'active',
  },

  // Fechas
  startDate: { type: Date, default: Date.now },
  endDate: Date,

}, { timestamps: true });

export default mongoose.models.TreatmentPlan || 
  mongoose.model('TreatmentPlan', treatmentPlanSchema);
