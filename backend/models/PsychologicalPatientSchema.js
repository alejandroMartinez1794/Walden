// backend/models/PsychologicalPatientSchema.js
import mongoose from 'mongoose';

const psychologicalPatientSchema = new mongoose.Schema({
  // Datos demográficos básicos
  personalInfo: {
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
    phone: String,
    email: String,
    address: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
  },

  // Información clínica
  clinicalInfo: {
    referralSource: String, // ¿Quién lo refirió? (médico, familiar, etc.)
    chiefComplaint: String, // Motivo principal de consulta
    
    // Diagnósticos según DSM-5 o CIE-11
    diagnoses: [{
      code: String, // Ej: F41.1 (Trastorno de ansiedad generalizada)
      description: String,
      type: { type: String, enum: ['primary', 'secondary', 'differential'] },
      dateAssigned: { type: Date, default: Date.now },
    }],

    // Historial psiquiátrico previo
    previousTreatments: [{
      type: { type: String, enum: ['psychotherapy', 'medication', 'hospitalization', 'other'] },
      description: String,
      dateRange: String,
      outcome: String,
    }],

    // Medicación actual
    currentMedication: [{
      name: String,
      dosage: String,
      prescribedBy: String,
      startDate: Date,
    }],

    // Factores de riesgo
    riskFactors: {
      suicidalIdeation: { type: Boolean, default: false },
      selfHarmHistory: { type: Boolean, default: false },
      substanceAbuse: { type: Boolean, default: false },
      traumaHistory: { type: Boolean, default: false },
      notes: String,
    },
  },

  // Relación con el psicólogo/terapeuta
  psychologist: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: true 
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

export default mongoose.models.PsychologicalPatient || 
  mongoose.model('PsychologicalPatient', psychologicalPatientSchema);
