import mongoose from 'mongoose';

const SecurityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, refPath: 'userType' },
  userType: { type: String, enum: ['User', 'Doctor'] },
  event: { type: String, required: true }, // LOGIN_SUCCESS, LOGIN_FAIL, PASSWORD_CHANGE, LOCKED_OUT
  ipAddress: { type: String },
  userAgent: { type: String },
  status: { type: String, enum: ['SUCCESS', 'FAILURE', 'WARNING'] },
  metadata: { type: mongoose.Schema.Types.Mixed }, // Detalles extra (razón del fallo, etc.)
}, { timestamps: true });

// Índice TTL opcional: borrar logs muy viejos después de 1 año (31536000 seg)
SecurityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export default mongoose.models.SecurityLog || mongoose.model('SecurityLog', SecurityLogSchema);
