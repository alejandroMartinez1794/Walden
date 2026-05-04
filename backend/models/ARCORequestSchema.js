import mongoose from 'mongoose';

const ARCORequestSchema = new mongoose.Schema(
  {
    requester: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
      role: {
        type: String,
        enum: ['paciente', 'doctor', 'admin', 'unknown'],
        default: 'unknown',
      },
      email: { type: String },
    },
    subject: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
      role: {
        type: String,
        enum: ['paciente', 'doctor', 'admin', 'unknown'],
        default: 'paciente',
      },
      email: { type: String },
    },
    requestType: {
      type: String,
      required: true,
      enum: ['ACCESS', 'RECTIFICATION', 'CANCELLATION', 'OPPOSITION'],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'FULFILLED', 'PARTIALLY_FULFILLED'],
      default: 'PENDING',
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    details: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    requestedFields: [{ type: String, trim: true, maxlength: 120 }],
    requestedChanges: { type: mongoose.Schema.Types.Mixed, default: {} },
    review: {
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reviewedByRole: { type: String },
      reviewedAt: { type: Date },
      reviewNotes: { type: String, trim: true, maxlength: 2000 },
    },
    fulfillment: {
      fulfilledAt: { type: Date },
      fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      summary: { type: String, trim: true, maxlength: 2000 },
      exportBundle: { type: mongoose.Schema.Types.Mixed },
      rectificationResults: { type: [mongoose.Schema.Types.Mixed], default: [] },
      affectedEntities: [
        {
          entity: { type: String },
          count: { type: Number, default: 0 },
          blockedByLegalHold: { type: Number, default: 0 },
        },
      ],
    },
    metadata: {
      ip: { type: String },
      userAgent: { type: String },
    },
  },
  { timestamps: true, collection: 'arco_requests' }
);

ARCORequestSchema.index({ 'requester.userId': 1, createdAt: -1 });
ARCORequestSchema.index({ 'subject.userId': 1, requestType: 1, status: 1, createdAt: -1 });
ARCORequestSchema.index({ requestType: 1, status: 1, createdAt: -1 });

export default mongoose.models.ARCORequest || mongoose.model('ARCORequest', ARCORequestSchema);