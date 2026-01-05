// backend/models/PsychologicalClinicalHistorySchema.js
import mongoose from 'mongoose';
import { encryptClinicalData, decryptClinicalData } from '../utils/clinicalCrypto.js';

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
    // Campos detallados para cumplimiento legal (Colombia - Telepsicología)
    statement: String,
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

psychologicalClinicalHistorySchema.index({ patient: 1, psychologist: 1 }, { unique: true });

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

export default mongoose.models.PsychologicalClinicalHistory ||
  mongoose.model('PsychologicalClinicalHistory', psychologicalClinicalHistorySchema);
