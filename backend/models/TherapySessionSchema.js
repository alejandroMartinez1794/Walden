import { encryptClinicalData, decryptClinicalData } from '../utils/clinicalCrypto.js';
// backend/models/TherapySessionSchema.js
import mongoose from 'mongoose';

const ENCRYPTED_VALUE_PATTERN = /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i;

const processPhiString = (value, processor) => {
  if (typeof value !== 'string' || !value) return value;
  if (processor === encryptClinicalData && ENCRYPTED_VALUE_PATTERN.test(value)) return value;
  if (processor === decryptClinicalData && !ENCRYPTED_VALUE_PATTERN.test(value)) return value;
  return processor(value);
};

const processPhiFields = (target, processor) => {
  if (!target) return;
  const process = (parent, key) => {
    if (parent && typeof parent[key] === 'string') parent[key] = processPhiString(parent[key], processor);
  };
  ['subjective', 'objective', 'assessment', 'plan'].forEach((key) => process(target.soapNotes, key));
  if (Array.isArray(target.automaticThoughts)) {
    target.automaticThoughts.forEach((thought) => {
      ['situation', 'automaticThought', 'emotion', 'rationalResponse'].forEach((key) => process(thought, key));
    });
  }
  if (Array.isArray(target.behavioralAssignments)) {
    target.behavioralAssignments.forEach((assignment) => process(assignment, 'task'));
  }
  process(target, 'notes');
  process(target, 'crisisNotes');
};

const therapySessionSchema = new mongoose.Schema({
  // Relaciones
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PsychologicalPatient', 
    required: true 
  },
  psychologist: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: true 
  },

  // Información de la sesión
  sessionNumber: { type: Number, required: true },
  sessionDate: { type: Date, required: true },
  duration: { type: Number, default: 50 }, // minutos
  modality: { 
    type: String, 
    enum: ['in-person', 'online', 'phone'], 
    default: 'in-person' 
  },

  // Notas SOAP (Subjetivo, Objetivo, Análisis, Plan)
  soapNotes: {
    subjective: {
      type: String,
      description: 'Cómo se presenta el paciente, qué reporta (síntomas, eventos recientes)'
    },
    objective: {
      type: String,
      description: 'Observaciones del terapeuta (apariencia, conducta, afecto)'
    },
    assessment: {
      type: String,
      description: 'Análisis clínico e interpretación (hipótesis, progreso)'
    },
    plan: {
      type: String,
      description: 'Plan de intervención, tareas asignadas, próximos pasos'
    },
  },

  // Registro de pensamientos automáticos (TCC)
  automaticThoughts: [{
    situation: String, // Situación que activó el pensamiento
    automaticThought: String, // Pensamiento automático negativo
    emotion: String, // Emoción experimentada
    intensity: { type: Number, min: 0, max: 10 }, // Intensidad emocional
    cognitiveDistortion: String, // Tipo de distorsión (catastrofismo, lectura mental, etc.)
    rationalResponse: String, // Pensamiento alternativo racional
    outcomeIntensity: { type: Number, min: 0, max: 10 }, // Nueva intensidad tras reestructuración
  }],

  // Tareas conductuales asignadas
  behavioralAssignments: [{
    task: String,
    completed: { type: Boolean, default: false },
  }],

  // Escalas breves aplicadas en sesión (opcional)
  sessionRatings: {
    anxietyLevel: { type: Number, min: 0, max: 10 }, // Escala subjetiva 0-10
    moodLevel: { type: Number, min: 0, max: 10 }, // 0=muy deprimido, 10=excelente
  },

  // Observaciones adicionales
  notes: String,

  // Indicador de sesión crítica (ideación suicida, crisis)
  criticalSession: { type: Boolean, default: false },
  crisisNotes: String,

}, { timestamps: true });

// TherapySession contains psychotherapy notes and crisis narratives. Encrypt narrative PHI at rest.
therapySessionSchema.pre('save', function (next) {
  processPhiFields(this, encryptClinicalData);
  next();
});

therapySessionSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() || {};
  if (update.$set) processPhiFields(update.$set, encryptClinicalData);
  next();
});

therapySessionSchema.post(['find', 'findOne', 'findOneAndUpdate'], function (docs) {
  if (!docs) return;
  const docList = Array.isArray(docs) ? docs : [docs];
  docList.forEach((doc) => processPhiFields(doc, decryptClinicalData));
});

export default mongoose.models.TherapySession || 
  mongoose.model('TherapySession', therapySessionSchema);
