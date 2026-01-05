import mongoose from 'mongoose';

const ClinicalLogSchema = new mongoose.Schema({
  actor: {
    userId: { type: mongoose.Types.ObjectId, required: true, refPath: 'actor.role' },
    role: { type: String, required: true, enum: ['User', 'Doctor', 'Admin'] },
    ip: { type: String },
    userAgent: { type: String }
  },
  action: {
    type: String,
    required: true,
    enum: ['ACCESS', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN_FAILED']
  },
  resource: {
    entity: { type: String, required: true }, // Ej: 'ClinicalHistory', 'PatientFile'
    entityId: { type: String },
    field: { type: String } // Si fue acceso a un campo específico sensible
  },
  context: {
    reason: { type: String }, // Justificación clínica si aplica
    status: { type: String, enum: ['SUCCESS', 'DENIED', 'ERROR'], default: 'SUCCESS' }
  },
  timestamp: { type: Date, default: Date.now, immutable: true } // Inmutable
});

// Índice TTL opcional si se desea purgar logs muy antiguos (ej: 5 años), 
// pero por defecto en salud se conservan largo plazo.
ClinicalLogSchema.index({ timestamp: 1 });
ClinicalLogSchema.index({ "actor.userId": 1 });
ClinicalLogSchema.index({ "resource.entityId": 1 });

export default mongoose.model('ClinicalLog', ClinicalLogSchema);
