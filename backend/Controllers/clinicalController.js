// backend/Controllers/clinicalController.js
import Measure from '../models/MeasureSchema.js';
import Alert from '../models/AlertSchema.js';
import ClinicalSuggestionLog from '../models/ClinicalSuggestionLogSchema.js';
import ActivityLog from '../models/ActivityLogSchema.js';
import { scorePHQ9, scoreGAD7, assessRisk, generateClinicalSummary } from '../utils/clinicalRules.js';

export const createMeasure = async (req, res) => {
  try {
    const clinicianId = req.userId;
    const { id: patientId } = req.params;
    const { name, responses, itemMap } = req.body;

    let score = 0; let severity; let item9;
    if (name === 'PHQ-9') { const s = scorePHQ9(Array.isArray(responses) ? responses : []); score = s.total; severity = s.severity; item9 = s.item9; }
    else if (name === 'GAD-7') { const s = scoreGAD7(Array.isArray(responses) ? responses : []); score = s.total; severity = s.severity; }
    else { score = (responses || []).reduce((a, b) => a + Number(b?.response || b || 0), 0); }

    const measure = await Measure.create({ patient: patientId, clinician: clinicianId, name, responses, score, itemMap });

    // Build recent PHQ-9 series for trend
    const measuresPHQ9 = name === 'PHQ-9' ? [] : await Measure.find({ patient: patientId, clinician: clinicianId, name: 'PHQ-9' }).sort({ takenAt: 1 }).select('score takenAt');
    if (name === 'PHQ-9') measuresPHQ9.push({ score, takenAt: new Date() });

    const risk = assessRisk({ phq9: name === 'PHQ-9' ? { total: score, item9, severity } : measuresPHQ9.length ? { total: measuresPHQ9.at(-1).score } : undefined, measuresPHQ9 });

    const alertsCreated = [];
    for (const flag of risk.flags) {
      const severityMap = { suicide_risk: 'critical', high_depression: 'high', worsening_trend: 'moderate' };
      const alert = await Alert.create({ patient: patientId, clinician: clinicianId, type: flag, severity: severityMap[flag] || 'moderate', relatedMeasureId: measure._id });
      alertsCreated.push(alert);
    }

    await ActivityLog.create({ actor: clinicianId, patient: patientId, action: 'create_measure', meta: { name, score, alerts: risk.flags } });

    res.status(201).json({ success: true, data: { measure, score, severity, alertsCreated } });
  } catch (error) {
    console.error('Error creating measure:', error);
    res.status(500).json({ success: false, message: 'Error al crear medida' });
  }
};

export const generateClinicalSummaryHandler = async (req, res) => {
  try {
    const clinicianId = req.userId;
    const { id: patientId } = req.params;
    const { lookbackDays = 30, includeNotes = true } = req.body || {};

    const since = new Date(); since.setDate(since.getDate() - Number(lookbackDays));
    const measures = await Measure.find({ patient: patientId, clinician: clinicianId, takenAt: { $gte: since } }).sort({ takenAt: 1 }).lean();
    const measuresPHQ9 = measures.filter(m => m.name === 'PHQ-9').map(m => ({ score: m.score, date: m.takenAt }));
    const measuresGAD7 = measures.filter(m => m.name === 'GAD-7').map(m => ({ score: m.score, date: m.takenAt }));

    // TODO: lastNotes y adherencia provendrán de Sessions/Tareas cuando estén
    const lastNotes = includeNotes ? [] : [];
    const adherence = 0.7;

    const summary = generateClinicalSummary({ measuresPHQ9, measuresGAD7, lastNotes, adherence });

    const log = await ClinicalSuggestionLog.create({ patient: patientId, clinician: clinicianId, summary, accepted: false });
    await ActivityLog.create({ actor: clinicianId, patient: patientId, action: 'generate_clinical_summary', meta: { lookbackDays, flags: summary.flags } });

    res.status(201).json({ success: true, data: summary, logId: log._id });
  } catch (error) {
    console.error('Error generating clinical summary:', error);
    res.status(500).json({ success: false, message: 'Error al generar resumen clínico' });
  }
};

export const listAlerts = async (req, res) => {
  try {
    const clinicianId = req.userId; const { id: patientId } = req.params;
    const alerts = await Alert.find({ patient: patientId, clinician: clinicianId, resolved: false }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: alerts });
  } catch (e) { res.status(500).json({ success: false, message: 'Error al listar alertas' }); }
};

export const resolveAlert = async (req, res) => {
  try {
    const clinicianId = req.userId; const { alertId } = req.params;
    const alert = await Alert.findOneAndUpdate({ _id: alertId, clinician: clinicianId }, { $set: { resolved: true, resolvedAt: new Date() } }, { new: true });
    if (!alert) return res.status(404).json({ success: false, message: 'Alerta no encontrada' });
    await ActivityLog.create({ actor: clinicianId, patient: alert.patient, action: 'resolve_alert', meta: { alertId } });
    res.status(200).json({ success: true, data: alert });
  } catch (e) { res.status(500).json({ success: false, message: 'Error al resolver alerta' }); }
};

export const updateAlertMitigation = async (req, res) => {
  try {
    const clinicianId = req.userId; const { alertId } = req.params;
    const { emergencyContact, safetyPlan, urgentAppointment, scheduledAt, notes } = req.body || {};
    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, clinician: clinicianId },
      { $set: { mitigation: { emergencyContact, safetyPlan, urgentAppointment, scheduledAt }, notes } },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alerta no encontrada' });
    await ActivityLog.create({ actor: clinicianId, patient: alert.patient, action: 'update_alert_mitigation', meta: { alertId } });
    res.status(200).json({ success: true, data: alert });
  } catch (e) { res.status(500).json({ success: false, message: 'Error al actualizar mitigación' }); }
};

export const acceptSuggestion = async (req, res) => {
  try {
    const clinicianId = req.userId; const { logId } = req.params; const { accepted, clinicianNotes } = req.body || {};
    const log = await ClinicalSuggestionLog.findOneAndUpdate(
      { _id: logId, clinician: clinicianId },
      { $set: { accepted: !!accepted, clinicianNotes } },
      { new: true }
    );
    if (!log) return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    await ActivityLog.create({ actor: clinicianId, patient: log.patient, action: 'accept_suggestion', meta: { logId, accepted } });
    res.status(200).json({ success: true, data: log });
  } catch (e) { res.status(500).json({ success: false, message: 'Error al registrar aceptación' }); }
};
