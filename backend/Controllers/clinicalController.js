// backend/Controllers/clinicalController.js
import mongoose from 'mongoose';
import Measure from '../models/MeasureSchema.js';
import PsychologicalAssessment from '../models/PsychologicalAssessmentSchema.js';
import PsychologicalPatient from '../models/PsychologicalPatientSchema.js';
import Alert from '../models/AlertSchema.js';
import ClinicalSuggestionLog from '../models/ClinicalSuggestionLogSchema.js';
import ActivityLog from '../models/ActivityLogSchema.js';
import { generateClinicalSummary } from '../utils/clinicalRules.js';

import sendEmail from '../utils/emailService.js';
import logger from '../utils/logger.js';
import { createClinicalMeasure } from '../services/clinicalMeasureService.js';

export const sendConsentEmail = async (req, res) => {
  try {
    const { patientEmail, patientName, customMessage, consentType } = req.body;
    const consentLabels = { treatment: 'tratamiento', communication: 'comunicaciones electrónicas', research: 'investigación', sharing: 'intercambio de información clínica' };
    const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const finalLink = new URL('/consentimiento', clientBaseUrl).toString();
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character]);
    const safeName = escapeHtml(patientName || 'Usuario');
    const safeMessage = escapeHtml(customMessage);
    const consentLabel = consentLabels[consentType];
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Basileia</h2>
          <p style="color: #94a3b8; margin: 5px 0 0 0;">Salud Mental Integral</p>
        </div>
        <div style="padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
          <p>Hola <strong>${safeName}</strong>,</p>
          <p>Se ha generado un documento de consentimiento informado relacionado con ${escapeHtml(consentLabel)}. Por favor, revíselo antes de su próxima sesión.</p>
          ${safeMessage ? `<p style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; font-style: italic;">"${safeMessage}"</p>` : ''}
          <div style="text-align: center; margin: 30px 0;"><a href="${finalLink}" style="background-color: #0f172a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Revisar consentimiento</a></div>
          <p style="font-size: 14px; color: #64748b;">Si el botón no funciona, copie este enlace: <a href="${finalLink}" style="color: #2563eb;">${finalLink}</a></p>
        </div>
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #94a3b8;"><p>Este es un mensaje automático de la plataforma Basileia.</p></div>
      </div>`;
    await sendEmail({
      email: patientEmail,
      subject: 'Consentimiento informado - Basileia',
      message: `Hola ${patientName}, tiene un consentimiento informado relacionado con ${consentLabel}. Revíselo en: ${finalLink}${customMessage ? `\n\n${customMessage}` : ''}`,
      html: htmlContent,
    });
    return res.status(200).json({ success: true, message: 'Correo enviado exitosamente' });
  } catch (error) {
    logger.error('Error sending consent email:', error);
    return res.status(500).json({ success: false, message: 'Error al enviar el correo' });
  }
};

export const createMeasure = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const clinicianId = req.userId;
    const { id: patientId } = req.params;
    const { name, responses, itemMap, assessmentId } = req.body;

    const assignedPatient = await PsychologicalPatient.findOne({
      _id: patientId,
      psychologist: clinicianId,
      isDeleted: { $ne: true },
    }).select('_id').session(session);

    if (!assignedPatient) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado',
      });
    }

    let sourceAssessment;
    if (assessmentId) {
      sourceAssessment = await PsychologicalAssessment.findOne({
        _id: assessmentId,
        patient: patientId,
        psychologist: clinicianId,
      }).select('_id testType responses testDate').session(session);

      if (!sourceAssessment) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: 'Evaluación de origen no encontrada',
        });
      }

      if (sourceAssessment.testType !== name) {
        await session.abortTransaction();
        return res.status(409).json({
          success: false,
          message: 'El instrumento de la medición no coincide con la evaluación de origen',
        });
      }
    }

    const result = await createClinicalMeasure({
      patientId,
      clinicianId,
      name,
      responses: sourceAssessment?.responses ?? responses,
      itemMap,
      assessmentId,
      takenAt: sourceAssessment?.testDate,
      session,
    });

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    logger.error('Error creating measure:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error al crear medida',
    });
  } finally {
    await session.endSession();
  }
};

export const generateClinicalSummaryHandler = async (req, res) => {
  try {
    const clinicianId = req.userId;
    const { id: patientId } = req.params;
    const { dataRange = 'last90days' } = req.body || {};

    const assignedPatient = await PsychologicalPatient.findOne({
      _id: patientId,
      psychologist: clinicianId,
      isDeleted: { $ne: true },
    }).select('_id').lean();

    if (!assignedPatient) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    }

    // Match the public request schema: dataRange is a named range, not a day count.
    const lookbackDaysByRange = {
      last30days: 30,
      last90days: 90,
      last6months: 183,
    };
    const since = dataRange === 'all' ? null : new Date(Date.now() - lookbackDaysByRange[dataRange] * 24 * 60 * 60 * 1000);
    const measureQuery = { patient: patientId, clinician: clinicianId };
    if (since) measureQuery.takenAt = { $gte: since };

    const measures = await Measure.find(measureQuery).sort({ takenAt: 1 }).lean();
    const severityFor = (name, score) => {
      if (name === 'PHQ-9') {
        if (score >= 20) return 'severe';
        if (score >= 15) return 'moderately-severe';
        if (score >= 10) return 'moderate';
        if (score >= 5) return 'mild';
        return 'minimal';
      }
      if (name === 'GAD-7') {
        if (score >= 15) return 'severe';
        if (score >= 10) return 'moderate';
        if (score >= 5) return 'mild';
        return 'minimal';
      }
      return 'unknown';
    };
    const measuresPHQ9 = measures.filter(m => m.name === 'PHQ-9').map(m => ({
      score: m.score,
      total: m.score,
      severity: severityFor(m.name, m.score),
      item9: m.responses?.find(response => response?.itemNumber === 9)?.response ?? 0,
      date: m.takenAt,
    }));
    const measuresGAD7 = measures.filter(m => m.name === 'GAD-7').map(m => ({
      score: m.score,
      total: m.score,
      severity: severityFor(m.name, m.score),
      date: m.takenAt,
    }));

    // Notes and task adherence are not yet persisted in the clinical summary contract.
    const lastNotes = [];
    const adherence = null;
    const summary = generateClinicalSummary({ measuresPHQ9, measuresGAD7, lastNotes, adherence });

    const log = await ClinicalSuggestionLog.create({
      patient: patientId,
      clinician: clinicianId,
      summary,
      accepted: false,
    });
    await ActivityLog.create({
      actor: clinicianId,
      patient: patientId,
      action: 'generate_clinical_summary',
      meta: { dataRange, flags: summary.flags },
    });

    return res.status(201).json({ success: true, data: summary, logId: log._id });
  } catch (error) {
    logger.error('Error generating clinical summary:', error);
    return res.status(500).json({ success: false, message: 'Error al generar resumen clínico' });
  }
};

export const listAlerts = async (req, res) => {
  try {
    const clinicianId = req.userId;
    const { id: patientId } = req.params;
    const { status, riskLevel, page = 1, limit = 20 } = req.query;
    const filter = { patient: patientId, clinician: clinicianId };
    if (status === 'active') filter.$or = [{ status: 'active' }, { status: { $exists: false }, resolved: false }];
    else if (status) filter.status = status;
    if (riskLevel) filter.severity = riskLevel;
    const skip = (Number(page) - 1) * Number(limit);
    const [alerts, total] = await Promise.all([
      Alert.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Alert.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true, data: alerts,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    logger.error('Error listing clinical alerts:', error);
    return res.status(500).json({ success: false, message: 'Error al listar alertas' });
  }
};

export const resolveAlert = async (req, res) => {
  try {
    const clinicianId = req.userId;
    const { alertId } = req.params;
    const { status, actionTaken, notes } = req.body || {};
    const combinedNotes = [actionTaken, notes].filter(Boolean).join('\n\n');
    const update = { status, resolved: status === 'resolved' };
    if (combinedNotes) update.notes = combinedNotes;
    if (status === 'resolved') update.resolvedAt = new Date();
    const updateOperation = { $set: update };
    if (status !== 'resolved') updateOperation.$unset = { resolvedAt: 1 };
    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, clinician: clinicianId }, updateOperation, { new: true, runValidators: true },
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alerta no encontrada' });
    await ActivityLog.create({
      actor: clinicianId, patient: alert.patient, action: 'update_alert_status',
      meta: { alertId, status, actionTaken },
    });
    return res.status(200).json({ success: true, data: alert });
  } catch (error) {
    logger.error('Error updating clinical alert status:', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar la alerta' });
  }
};

export const updateAlertMitigation = async (req, res) => {
  try {
    const clinicianId = req.userId;
    const { alertId } = req.params;
    const { mitigationSteps, reviewInDays } = req.body || {};
    const scheduledAt = new Date(Date.now() + Number(reviewInDays) * 24 * 60 * 60 * 1000);
    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, clinician: clinicianId },
      { $set: { 'mitigation.safetyPlan': mitigationSteps.join('\n'), 'mitigation.scheduledAt': scheduledAt } },
      { new: true, runValidators: true },
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alerta no encontrada' });
    await ActivityLog.create({
      actor: clinicianId, patient: alert.patient, action: 'update_alert_mitigation',
      meta: { alertId, reviewInDays },
    });
    return res.status(200).json({ success: true, data: alert });
  } catch (error) {
    logger.error('Error updating clinical alert mitigation:', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar mitigación' });
  }
};

export const acceptSuggestion = async (req, res) => {
  try {
    const clinicianId = req.userId;
    const { logId } = req.params;
    const { action, reason, notes } = req.body || {};
    const clinicianNotes = [`Decisión clínica: ${action}`, reason, notes].filter(Boolean).join('\n\n');
    const log = await ClinicalSuggestionLog.findOneAndUpdate(
      { _id: logId, clinician: clinicianId },
      { $set: { accepted: action === 'accepted', decision: action, clinicianNotes } },
      { new: true, runValidators: true },
    );
    if (!log) return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    await ActivityLog.create({
      actor: clinicianId, patient: log.patient, action: 'record_clinical_suggestion_decision',
      meta: { logId, decision: action },
    });
    return res.status(200).json({ success: true, data: log });
  } catch (error) {
    logger.error('Error recording clinical suggestion decision:', error);
    return res.status(500).json({ success: false, message: 'Error al registrar la decisión clínica' });
  }
};
