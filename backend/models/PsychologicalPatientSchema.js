// backend/models/PsychologicalPatientSchema.js
import mongoose from 'mongoose';
import { applyClinicalLifecycle, sanitizeClinicalText } from '../utils/clinicalLifecyclePlugin.js';

const psychologicalPatientSchema = new mongoose.Schema({
  // Datos demográficos básicos
  personalInfo: {
    fullName: { type: String, required: true, trim: true, minlength: 3, maxlength: 180, set: sanitizeClinicalText },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
    phone: { type: String, trim: true, maxlength: 30, set: sanitizeClinicalText },
    email: { type: String, trim: true, maxlength: 254, set: sanitizeClinicalText },
    address: { type: String, trim: true, maxlength: 500, set: sanitizeClinicalText },
    emergencyContact: {
      name: { type: String, trim: true, maxlength: 180, set: sanitizeClinicalText },
      relationship: { type: String, trim: true, maxlength: 120, set: sanitizeClinicalText },
      phone: { type: String, trim: true, maxlength: 30, set: sanitizeClinicalText },
    },
  },

  // Información clínica
  clinicalInfo: {
    referralSource: { type: String, trim: true, maxlength: 180, set: sanitizeClinicalText }, // ¿Quién lo refirió? (médico, familiar, etc.)
    chiefComplaint: { type: String, trim: true, maxlength: 1000, set: sanitizeClinicalText }, // Motivo principal de consulta
    
    // Diagnósticos según DSM-5 o CIE-11
    diagnoses: [{
      code: { type: String, trim: true, maxlength: 30, set: sanitizeClinicalText }, // Ej: F41.1 (Trastorno de ansiedad generalizada)
      description: { type: String, trim: true, maxlength: 250, set: sanitizeClinicalText },
      type: { type: String, enum: ['primary', 'secondary', 'differential'] },
      dateAssigned: { type: Date, default: Date.now },
    }],

    // Historial psiquiátrico previo
    previousTreatments: [{
      type: { type: String, enum: ['psychotherapy', 'medication', 'hospitalization', 'other'] },
      description: { type: String, trim: true, maxlength: 1000, set: sanitizeClinicalText },
      dateRange: { type: String, trim: true, maxlength: 120, set: sanitizeClinicalText },
      outcome: { type: String, trim: true, maxlength: 1000, set: sanitizeClinicalText },
    }],

    // Medicación actual
    currentMedication: [{
      name: { type: String, trim: true, maxlength: 180, set: sanitizeClinicalText },
      dosage: { type: String, trim: true, maxlength: 120, set: sanitizeClinicalText },
      prescribedBy: { type: String, trim: true, maxlength: 180, set: sanitizeClinicalText },
      startDate: Date,
    }],

    // Factores de riesgo
    riskFactors: {
      suicidalIdeation: { type: Boolean, default: false },
      selfHarmHistory: { type: Boolean, default: false },
      substanceAbuse: { type: Boolean, default: false },
      traumaHistory: { type: Boolean, default: false },
      notes: { type: String, trim: true, maxlength: 2000, set: sanitizeClinicalText },
    },
  },

  // Relación con el psicólogo/terapeuta
  psychologist: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: true 
  },

  // Relación opcional con usuario registrado
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  // Estado del caso
  status: { 
    type: String, 
    enum: ['active', 'discharged', 'on-hold', 'referred'],
    default: 'active' 
  },

  // Fechas importantes
  firstSessionDate: Date,
  lastSessionDate: Date,

}, { timestamps: true });

psychologicalPatientSchema.index({ psychologist: 1, status: 1, isDeleted: 1, createdAt: -1 });
psychologicalPatientSchema.index({ user: 1, psychologist: 1, isDeleted: 1 });

applyClinicalLifecycle(psychologicalPatientSchema, {
  entityName: 'PsychologicalPatient',
  retentionYears: 10,
});

export default mongoose.models.PsychologicalPatient || 
  mongoose.model('PsychologicalPatient', psychologicalPatientSchema);
