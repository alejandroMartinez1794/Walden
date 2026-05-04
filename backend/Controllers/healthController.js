import Medication from '../models/MedicationSchema.js';
import HealthMetric from '../models/HealthMetricSchema.js';
import MedicalRecord from '../models/MedicalRecordSchema.js';

// Medications
export const getMyMedications = async (req, res) => {
  try {
    const meds = await Medication.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: meds });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch medications' });
  }
};

export const createMedication = async (req, res) => {
  try {
    const med = await Medication.create({ user: req.user.id, ...req.body });
    res.status(201).json({ success: true, data: med });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Failed to create medication' });
  }
};

export const updateMedication = async (req, res) => {
  try {
    const med = await Medication.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!med) return res.status(404).json({ success: false, message: 'Medication not found' });
    res.status(200).json({ success: true, data: med });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Failed to update medication' });
  }
};

export const deleteMedication = async (req, res) => {
  try {
    const med = await Medication.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!med) return res.status(404).json({ success: false, message: 'Medication not found' });
    res.status(200).json({ success: true, message: 'Medication deleted' });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Failed to delete medication' });
  }
};

export const takeMedicationDose = async (req, res) => {
  try {
    const med = await Medication.findOne({ _id: req.params.id, user: req.user.id });
    if (!med) return res.status(404).json({ success: false, message: 'Medication not found' });
    if (med.remainingDoses <= 0) {
      return res.status(400).json({ success: false, message: 'No remaining doses' });
    }
    med.remainingDoses = med.remainingDoses - 1;
    await med.save();
    res.status(200).json({ success: true, data: med });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Failed to take dose' });
  }
};

// Health Metrics
export const getMyMetrics = async (req, res) => {
  try {
    const metrics = await HealthMetric.find({ user: req.user.id }).sort({ date: 1 });
    res.status(200).json({ success: true, data: metrics });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch metrics' });
  }
};

export const addMetric = async (req, res) => {
  try {
    const metric = await HealthMetric.create({ user: req.user.id, ...req.body });
    res.status(201).json({ success: true, data: metric });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Failed to add metric' });
  }
};

// Medical Records
export const getMyRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch records' });
  }
};

export const createRecord = async (req, res) => {
  try {
    // Create with audit context - captured automatically by lifecycle plugin
    const record = new MedicalRecord({ user: req.user.id, ...req.body });
    record.$locals.clinicalAuditActor = {
      userId: req.userId,
      role: 'Doctor', // Must match ClinicalAuditLogSchema enum: ['User', 'Doctor', 'Admin', 'system', 'unknown']
      email: req.user?.email,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    await record.save();
    res.status(201).json({ success: true, data: record });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Failed to create record' });
  }
};
