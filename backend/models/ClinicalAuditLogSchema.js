import mongoose from 'mongoose';

const ClinicalAuditLogSchema = new mongoose.Schema(
  {
    actor: {
      userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'actor.role', index: true },
      role: { type: String, enum: ['User', 'Doctor', 'Admin', 'system', 'unknown'], default: 'unknown' },
      email: { type: String },
      ip: { type: String },
      userAgent: { type: String },
    },
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'ACCESS', 'EXPORT'],
      index: true,
    },
    resource: {
      entity: { type: String, required: true, index: true },
      entityId: { type: mongoose.Schema.Types.ObjectId, required: false, index: true },
    },
    changes: [
      {
        path: { type: String, required: true },
        previousValue: { type: mongoose.Schema.Types.Mixed },
        newValue: { type: mongoose.Schema.Types.Mixed },
      },
    ],
    previousValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
    context: {
      status: { type: String, enum: ['SUCCESS', 'DENIED', 'ERROR'], default: 'SUCCESS' },
      reason: { type: String },
      requestId: { type: String },
      method: { type: String },
      path: { type: String },
    },
    timestamp: { type: Date, default: Date.now, immutable: true, index: true },
  },
  {
    collection: 'clinical_audit_logs',
    timestamps: false,
  }
);

ClinicalAuditLogSchema.index({ 'actor.userId': 1, timestamp: -1 });
ClinicalAuditLogSchema.index({ 'resource.entity': 1, 'resource.entityId': 1, timestamp: -1 });
ClinicalAuditLogSchema.index({ action: 1, timestamp: -1 });
ClinicalAuditLogSchema.index({ 'context.status': 1, timestamp: -1 });

ClinicalAuditLogSchema.statics.log = async function (data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    return null;
  }
};

export default mongoose.models.ClinicalAuditLog || mongoose.model('ClinicalAuditLog', ClinicalAuditLogSchema);
