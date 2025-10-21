// backend/models/PsychologicalClinicalHistorySchema.js
import mongoose from 'mongoose';

// Historia clínica psicológica integral (enfoque TCC, práctica clínica colombiana)
const psychologicalClinicalHistorySchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'PsychologicalPatient', required: true },
  psychologist: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },

  // Identificación y motivo de consulta
  intake: {
    referralSource: String,
    chiefComplaint: { type: String, required: true },
    onsetDate: Date,
    onsetDescription: String, // inicio y curso del problema actual
    currentSeverity: { type: String, enum: ['minimal', 'mild', 'moderate', 'severe', 'extremely-severe'] },
  },

  // Historia del problema actual (TCC)
  currentProblemHistory: {
    triggers: String,
    maintainingFactors: String,
    cognitiveContent: String, // pensamientos automáticos, creencias nucleares
    behavioralPatterns: String, // evitación, conductas de seguridad
    emotionalSymptoms: String,
    physiologicalSymptoms: String,
  },

  // Antecedentes personales
  personalHistory: {
    developmental: String,
    medical: String,
    psychiatric: String,
    psychological: String,
    academic: String,
    occupational: String,
    legal: String,
  },

  // Antecedentes familiares y red de apoyo
  familyAndSupport: {
    familyHistory: String,
    livingSituation: String,
    supportNetwork: String,
    significantRelationships: String,
  },

  // Consumo de sustancias
  substanceUse: {
    alcohol: String,
    tobacco: String,
    otherDrugs: String,
    comments: String,
  },

  // Evaluación del riesgo y plan de seguridad
  risk: {
    suicidalIdeation: { type: Boolean, default: false },
    selfHarm: { type: Boolean, default: false },
    homicideRisk: { type: Boolean, default: false },
    domesticViolence: { type: Boolean, default: false },
    accessToLethalMeans: { type: Boolean, default: false },
    safetyPlan: String,
  },

  // Examen del estado mental
  mentalStatusExam: {
    appearance: String,
    behavior: String,
    speech: String,
    mood: String,
    affect: String,
    thoughtProcess: String,
    thoughtContent: String,
    perception: String,
    cognition: String,
    insight: String,
    judgment: String,
  },

  // Diagnóstico (CIE-11 / DSM-5)
  diagnosis: {
    codes: [
      {
        code: String,
        description: String,
        system: { type: String, enum: ['ICD-11', 'DSM-5', 'DSM-5-TR', 'Other'], default: 'DSM-5' },
        type: { type: String, enum: ['primary', 'secondary', 'differential'] },
        dateAssigned: { type: Date, default: Date.now },
      },
    ],
    clinicalFormulation: String, // conceptualización del caso (modelo TCC / 5 áreas)
  },

  // Objetivos y plan
  goalsAndPlan: {
    treatmentGoals: String, // objetivos SMART resumidos
    cbtTechniquesPlanned: String,
    frequency: { type: String, default: 'weekly' },
  },

  // Consentimiento informado (texto breve de constancia)
  consent: {
    obtained: { type: Boolean, default: false },
    date: Date,
    notes: String,
  },

  attachments: [
    { url: String, name: String, type: String }
  ],
}, { timestamps: true });

psychologicalClinicalHistorySchema.index({ patient: 1, psychologist: 1 }, { unique: true });

export default mongoose.models.PsychologicalClinicalHistory ||
  mongoose.model('PsychologicalClinicalHistory', psychologicalClinicalHistorySchema);
