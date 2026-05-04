// backend/models/PsychologicalClinicalHistorySchema.js
import mongoose from 'mongoose';
import { encryptClinicalData, decryptClinicalData } from '../utils/clinicalCrypto.js';
import { applyClinicalLifecycle, sanitizeClinicalText } from '../utils/clinicalLifecyclePlugin.js';

// Historia clínica psicológica integral (enfoque TCC, práctica clínica colombiana)
const psychologicalClinicalHistorySchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'PsychologicalPatient', required: true },
  psychologist: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },

  // Identificación y motivo de consulta
  intake: {
    referralSource: { type: String, trim: true, maxlength: 180, set: sanitizeClinicalText },
    chiefComplaint: { type: String, required: true, trim: true, minlength: 10, maxlength: 500, set: sanitizeClinicalText },
    onsetDate: {
      type: Date,
      validate: {
        validator: (value) => !value || value <= new Date(),
        message: 'Onset date cannot be in the future',
      },
    },
    onsetDescription: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText }, // inicio y curso del problema actual
    currentSeverity: { type: String, enum: ['minimal', 'mild', 'moderate', 'severe', 'extremely-severe'] },
  },

  // Historia del problema actual (TCC)
  currentProblemHistory: {
    triggers: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
    maintainingFactors: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
    cognitiveContent: { type: String, trim: true, maxlength: 3000, set: sanitizeClinicalText }, // pensamientos automáticos, creencias nucleares
    behavioralPatterns: { type: String, trim: true, maxlength: 3000, set: sanitizeClinicalText }, // evitación, conductas de seguridad
    emotionalSymptoms: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
    physiologicalSymptoms: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
  },

  // Antecedentes personales
  personalHistory: {
    developmental: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
    medical: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
    psychiatric: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
    psychological: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
    academic: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
    occupational: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
    legal: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
  },

  // Antecedentes familiares y red de apoyo
  familyAndSupport: {
    familyHistory: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
    livingSituation: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
    supportNetwork: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
    significantRelationships: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
  },

  // Consumo de sustancias
  substanceUse: {
    alcohol: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
    tobacco: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
    otherDrugs: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
    comments: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
  },

  // Evaluación del riesgo y plan de seguridad
  risk: {
    suicidalIdeation: { type: Boolean, default: false },
    selfHarm: { type: Boolean, default: false },
    homicideRisk: { type: Boolean, default: false },
    domesticViolence: { type: Boolean, default: false },
    accessToLethalMeans: { type: Boolean, default: false },
    safetyPlan: { type: String, trim: true, maxlength: 4000, set: sanitizeClinicalText },
  },

  // Examen del estado mental
  mentalStatusExam: {
    appearance: { type: String, trim: true, maxlength: 1200, set: sanitizeClinicalText },
    behavior: { type: String, trim: true, maxlength: 1200, set: sanitizeClinicalText },
    speech: { type: String, trim: true, maxlength: 1200, set: sanitizeClinicalText },
    mood: { type: String, trim: true, maxlength: 1200, set: sanitizeClinicalText },
    affect: { type: String, trim: true, maxlength: 1200, set: sanitizeClinicalText },
    thoughtProcess: { type: String, trim: true, maxlength: 1200, set: sanitizeClinicalText },
    thoughtContent: { type: String, trim: true, maxlength: 1200, set: sanitizeClinicalText },
    perception: { type: String, trim: true, maxlength: 1200, set: sanitizeClinicalText },
    cognition: { type: String, trim: true, maxlength: 1200, set: sanitizeClinicalText },
    insight: { type: String, trim: true, maxlength: 1200, set: sanitizeClinicalText },
    judgment: { type: String, trim: true, maxlength: 1200, set: sanitizeClinicalText },
  },

  // Diagnóstico (CIE-11 / DSM-5)
  diagnosis: {
    codes: [
      {
        code: { type: String, trim: true, maxlength: 30, set: sanitizeClinicalText },
        description: { type: String, trim: true, maxlength: 250, set: sanitizeClinicalText },
        system: { type: String, enum: ['ICD-11', 'DSM-5', 'DSM-5-TR', 'Other'], default: 'DSM-5' },
        type: { type: String, enum: ['primary', 'secondary', 'differential'] },
        dateAssigned: {
          type: Date,
          default: Date.now,
          validate: {
            validator: (value) => !value || value <= new Date(),
            message: 'Diagnosis date cannot be in the future',
          },
        },
      },
    ],
    clinicalFormulation: { type: String, trim: true, maxlength: 4000, set: sanitizeClinicalText }, // conceptualización del caso (modelo TCC / 5 áreas)
  },

  // Objetivos y plan
  goalsAndPlan: {
    treatmentGoals: { type: String, trim: true, maxlength: 4000, set: sanitizeClinicalText }, // objetivos SMART resumidos
    cbtTechniquesPlanned: { type: String, trim: true, maxlength: 4000, set: sanitizeClinicalText },
    frequency: { type: String, enum: ['weekly', 'biweekly', 'monthly', 'custom'], default: 'weekly' },
  },

  // Consentimiento informado (texto breve de constancia)
  consent: {
    obtained: { type: Boolean, default: false },
    date: {
      type: Date,
      validate: {
        validator: (value) => !value || value <= new Date(),
        message: 'Consent date cannot be in the future',
      },
    },
    notes: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
    // Campos detallados para cumplimiento legal (Colombia - Telepsicología)
    statement: { type: String, trim: true, maxlength: 4000, set: sanitizeClinicalText },
    informedConsent: { type: Boolean, default: false }, // Aceptación general
    confidentialityExplained: { type: Boolean, default: false },
    limitationsDiscussed: { type: Boolean, default: false },
    crisisProtocol: { type: Boolean, default: false }, // Protocolo de crisis
    privacyRecording: { type: Boolean, default: false }, // Privacidad y grabación
    dataCustody: { type: Boolean, default: false }, // Custodia de datos
  },

  attachments: [
    { url: String, name: String, type: String }
  ],
}, { timestamps: true });

psychologicalClinicalHistorySchema.index({ patient: 1, psychologist: 1, isDeleted: 1 }, { unique: true });
psychologicalClinicalHistorySchema.index({ psychologist: 1, isDeleted: 1, updatedAt: -1 });
psychologicalClinicalHistorySchema.index({ patient: 1, isDeleted: 1, updatedAt: -1 });

// ==========================================
// SEGURIDAD CLÍNICA: ENCRIPTACIÓN DE CAMPOS
// ==========================================

const ENCRYPTED_FIELDS = [
  'intake.chiefComplaint',
  'intake.onsetDescription',
  'currentProblemHistory.triggers',
  'currentProblemHistory.maintainingFactors',
  'currentProblemHistory.cognitiveContent',
  'currentProblemHistory.behavioralPatterns',
  'currentProblemHistory.emotionalSymptoms',
  'currentProblemHistory.physiologicalSymptoms',
  'personalHistory.developmental',
  'personalHistory.medical',
  'personalHistory.psychiatric',
  'personalHistory.psychological',
  'personalHistory.academic',
  'personalHistory.occupational',
  'personalHistory.legal',
  'familyAndSupport.familyHistory',
  'familyAndSupport.livingSituation',
  'familyAndSupport.supportNetwork',
  'familyAndSupport.significantRelationships',
  'substanceUse.alcohol',
  'substanceUse.tobacco',
  'substanceUse.otherDrugs',
  'substanceUse.comments',
  'risk.safetyPlan',
  'mentalStatusExam.appearance',
  'mentalStatusExam.behavior',
  'mentalStatusExam.speech',
  'mentalStatusExam.mood',
  'mentalStatusExam.affect',
  'mentalStatusExam.thoughtProcess',
  'mentalStatusExam.thoughtContent',
  'mentalStatusExam.perception',
  'mentalStatusExam.cognition',
  'mentalStatusExam.insight',
  'mentalStatusExam.judgment',
  'diagnosis.clinicalFormulation',
  'goalsAndPlan.treatmentGoals',
  'goalsAndPlan.cbtTechniquesPlanned',
  'consent.notes',
  'consent.statement'
];

// Helper para procesar campos anidados de forma segura
const processFields = (obj, fields, processor) => {
  if (!obj) return;
  
  fields.forEach(field => {
    const parts = field.split('.');
    let current = obj;
    
    // Navegar hasta el objeto contenedor
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) return;
      current = current[parts[i]];
    }
    
    const last = parts[parts.length - 1];
    const value = current[last];

    if (value && typeof value === 'string') {
      try {
        // Lógica para evitar doble encriptación o errores en desencriptación
        const isEncryptedFormat = value.includes(':') && value.length > 32;
        
        if (processor.name === 'encryptClinicalData') {
          // Si ya parece encriptado, no re-encriptar (prevención básica)
          if (!isEncryptedFormat) {
            current[last] = processor(value);
          }
        } else if (processor.name === 'decryptClinicalData') {
          // Solo intentar desencriptar si tiene formato válido
          if (isEncryptedFormat) {
            current[last] = processor(value);
          }
        }
      } catch (e) {
        // Silenciar errores de criptografía para no romper el flujo, mantener valor original
        // console.warn(`[ClinicalCrypto] Error processing field ${field}:`, e.message);
      }
    }
  });
};

// Middleware: Encriptar antes de guardar (save)
psychologicalClinicalHistorySchema.pre('save', function(next) {
  if (this.isModified()) {
     processFields(this, ENCRYPTED_FIELDS, encryptClinicalData);
  }
  next();
});

// Middleware: Encriptar antes de findOneAndUpdate
psychologicalClinicalHistorySchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.$set) {
      processFields(update.$set, ENCRYPTED_FIELDS, encryptClinicalData);
  }
  next();
});

// Middleware: Desencriptar después de obtener (find, findOne, findOneAndUpdate)
psychologicalClinicalHistorySchema.post(['find', 'findOne', 'findOneAndUpdate'], function(docs) {
  if (!docs) return;
  const docList = Array.isArray(docs) ? docs : [docs];
  docList.forEach(doc => {
      processFields(doc, ENCRYPTED_FIELDS, decryptClinicalData);
  });
});

applyClinicalLifecycle(psychologicalClinicalHistorySchema, {
  entityName: 'PsychologicalClinicalHistory',
  retentionYears: 10,
});

export default mongoose.models.PsychologicalClinicalHistory ||
  mongoose.model('PsychologicalClinicalHistory', psychologicalClinicalHistorySchema);
