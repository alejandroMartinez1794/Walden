import mongoose from 'mongoose';
import { applyClinicalLifecycle, sanitizeClinicalText } from '../utils/clinicalLifecyclePlugin.js';

const AttachmentSchema = new mongoose.Schema(
  {
    url: String,
    name: String,
    type: String,
  },
  { _id: false }
);

const MedicalRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['consultation', 'lab', 'prescription', 'other'], required: true },
    title: { type: String, required: true, trim: true, minlength: 8, maxlength: 180, set: sanitizeClinicalText },
    description: { type: String, trim: true, maxlength: 5000, set: sanitizeClinicalText },
    date: {
      type: Date,
      default: Date.now,
      validate: {
        validator: (value) => !value || value <= new Date(),
        message: 'Medical record date cannot be in the future',
      },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    attachments: [AttachmentSchema],
  },
  { timestamps: true }
);

MedicalRecordSchema.index({ user: 1, isDeleted: 1, date: -1 });
MedicalRecordSchema.index({ user: 1, type: 1, isDeleted: 1, date: -1 });

applyClinicalLifecycle(MedicalRecordSchema, {
  entityName: 'MedicalRecord',
  retentionYears: 8,
});

export default mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', MedicalRecordSchema);
