// backend/models/TreatmentPlanSchema.js
import mongoose from 'mongoose';

const treatmentPlanSchema = new mongoose.Schema({
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
