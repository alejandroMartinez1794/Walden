// backend/models/PsychologicalAssessmentSchema.js
import mongoose from 'mongoose';

const psychologicalAssessmentSchema = new mongoose.Schema({
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

  // Información del test
  testType: {
    type: String,
    required: true,
    enum: [
      'BDI-II',     // Inventario de Depresión de Beck II
      'BAI',        // Inventario de Ansiedad de Beck
      'PHQ-9',      // Patient Health Questionnaire-9
      'GAD-7',      // Generalized Anxiety Disorder-7
      'PCL-5',      // PTSD Checklist
      'OCI-R',      // Obsessive-Compulsive Inventory-Revised
      'YBOCS',      // Yale-Brown Obsessive Compulsive Scale
      'AUDIT',      // Alcohol Use Disorders Identification Test
      'PSS',        // Perceived Stress Scale
      'other'
    ],
  },

  testDate: { type: Date, required: true, default: Date.now },

  // Respuestas del test (array flexible para diferentes instrumentos)
  responses: [{
    itemNumber: Number,
    itemText: String,
    response: mongoose.Schema.Types.Mixed, // Puede ser número, texto, etc.
  }],

  // Puntuaciones
  scores: {
    total: { type: Number, required: true },
    subscales: Map, // Para tests con subescalas (ej: BDI-II tiene cognitivo, somático)
    percentile: Number, // Percentil según normas
  },

  // Interpretación clínica
  interpretation: {
    severity: {
      type: String,
      enum: ['minimal', 'mild', 'moderate', 'severe', 'extremely-severe'],
    },
    clinicalNotes: String,
  },

  // Alertas automáticas (ej: ítem 9 de BDI-II o PHQ-9 sobre ideación suicida)
  riskAlert: {
    flagged: { type: Boolean, default: false },
    reason: String, // Ej: "Respuesta positiva en ítem de ideación suicida"
    action: String, // Acción tomada
  },

  // Comparación con evaluaciones previas
  comparisonNotes: String,

}, { timestamps: true });

// Índice compuesto para facilitar búsquedas
psychologicalAssessmentSchema.index({ patient: 1, testType: 1, testDate: -1 });

export default mongoose.models.PsychologicalAssessment || 
  mongoose.model('PsychologicalAssessment', psychologicalAssessmentSchema);
