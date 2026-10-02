// backend/Controllers/clinicalController.js
import Measure from '../models/MeasureSchema.js';
import PsychologicalAssessment from '../models/PsychologicalAssessmentSchema.js';
import TherapySession from '../models/TherapySessionSchema.js';
import TreatmentPlan from '../models/TreatmentPlanSchema.js';
import Alert from '../models/AlertSchema.js';
import ClinicalSuggestionLog from '../models/ClinicalSuggestionLogSchema.js';
import ActivityLog from '../models/ActivityLogSchema.js';
import { scorePHQ9, scoreGAD7, assessRisk, generateClinicalSummary } from '../utils/clinicalRules.js';

import sendEmail from '../utils/emailService.js';
import logger from '../utils/logger.js';

export const sendConsentEmail = async (req, res) => {
  try {
    const { email, name, message } = req.body; // Can be unregistered user, so no req.userId checking for recipient

    if (!email) {
      return res.status(400).json({ success: false, message: 'El correo electrónico es obligatorio' });
    }

    const consentLink = `http://${req.get('host')}/consentimiento`; // Or process.env.CLIENT_URL
    // NOTE: In production, ideally use process.env.CLIENT_URL or standard origin.
    // Assuming Frontend runs on localhost:5173 for dev, we might need a fixed URL or pass it from body.
    // But let's try to infer or use a fixed dev URL for now if header is api port.
    
    // Better strategy: Pass the link from frontend or hardcode current environment
    // For this context, I'll allow passing full link or default to hardcoded
    const finalLink = req.body.link || "http://localhost:5173/consentimiento"; 

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Basileia</h2>
          <p style="color: #94a3b8; margin: 5px 0 0 0;">Salud Mental Integral</p>
        </div>
        
        <div style="padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
          <p>Hola <strong>${name || 'Usuario'}</strong>,</p>
          
          <p>Se ha generado un documento de <strong>Consentimiento Informado</strong> para su proceso de atención psicológica. Por favor, revíselo y fírmelo digitalmente antes de su próxima sesión.</p>
          
          ${message ? `<p style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; font-style: italic;">"${message}"</p>` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${finalLink}" style="background-color: #0f172a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Firmar Documento Ahora
            </a>
          </div>
          
          <p style="font-size: 14px; color: #64748b;">
            Si el botón no funciona, copie y pegue el siguiente enlace en su navegador:<br>
            <a href="${finalLink}" style="color: #2563eb;">${finalLink}</a>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #94a3b8;">
          <p>Este es un mensaje automático de la plataforma Basileia.</p>
        </div>
      </div>
    `;

    await sendEmail({
      email: email,
      subject: 'Documento Pendiente: Consentimiento Informado - Basileia',
      message: `Hola ${name || ''}, por favor firma tu consentimiento informado en: ${finalLink}`,
      html: htmlContent
    });

    res.status(200).json({ success: true, message: 'Correo enviado exitosamente' });

  } catch (error) {
    logger.error("Error sending consent email:", error);
    res.status(500).json({ success: false, message: 'Error al enviar el correo' });
  }
};

export const createMeasure = async (req, res) => {
  try {
    const clinicianId = req.userId;
    const { id: patientId } = req.params;
    const {
      name,
      measureType,
      responses: submittedResponses,
      itemMap,
      assessmentId,
      therapySessionId,
      treatmentPlanId,
      takenAt,
    } = req.body;

    const measureTypeMap = {
      phq9: 'PHQ-9',
      gad7: 'GAD-7',
      audit: 'AUDIT',
      phq2: 'PHQ-2',
      columbia: 'OTHER',
      other: 'OTHER',
    };

    let sourceAssessment = null;
    let nameToPersist = name || measureTypeMap[measureType];
    let responses = submittedResponses;
    let submittedScore = null;
    let sourceTakenAt = takenAt;

    if (assessmentId) {
      sourceAssessment = await PsychologicalAssessment.findOne({
        _id: assessmentId,
        patient: patientId,
        psychologist: clinicianId,
      }).select('testType responses scores.testDate testDate');

      if (!sourceAssessment) {
        return res.status(404).json({
          success: false,
          message: 'Evaluación de origen no encontrada',
        });
      }

      if (nameToPersist && nameToPersist !== sourceAssessment.testType) {
        return res.status(400).json({
          success: false,
          message: 'El instrumento no coincide con la evaluación de origen',
        });
      }

      nameToPersist = sourceAssessment.testType;
      responses = sourceAssessment.responses;
      submittedScore = sourceAssessment.scores?.total ?? null;
      sourceTakenAt = sourceAssessment.testDate;
    }

    if (!nameToPersist || !Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Instrumento y respuestas son obligatorios',
      });
    }

    const normalizedResponses = responses.map((response, index) => {
      if (typeof response === 'number') {
        return { itemNumber: index + 1, response, score: response };
      }

      const numericScore = Number.isFinite(Number(response?.score))
        ? Number(response.score)
        : Number.isFinite(Number(response?.response))
          ? Number(response.response)
          : null;

      return {
        itemNumber: response?.itemNumber ?? index + 1,
        question: response?.question ?? response?.itemText,
        response: response?.response,
        ...(numericScore !== null ? { score: numericScore } : {}),
      };
    });

    const numericScores = normalizedResponses.map((response) => response.score);
    const canComputeScore = numericScores.length > 0 && numericScores.every(
      (score) => Number.isFinite(score)
    );

    const computedScore = canComputeScore
      ? numericScores.reduce((sum, score) => sum + score, 0)
      : null;

    if (
      sourceAssessment &&
      submittedScore !== null &&
      computedScore !== null &&
      submittedScore !== computedScore
    ) {
      return res.status(400).json({
        success: false,
        message: 'La puntuación de la evaluación no coincide con sus respuestas',
      });
    }

    const score = computedScore ?? submittedScore;

    if (score === null || !Number.isFinite(Number(score))) {
      return res.status(400).json({
        success: false,
        message: 'No fue posible determinar la puntuación de la medición',
      });
    }

    // Provenance references must belong to the same patient and clinician.
    if (therapySessionId) {
      const session = await TherapySession.findOne({
        _id: therapySessionId,
        patient: patientId,
        psychologist: clinicianId,
      }).select('_id');

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Sesión de origen no encontrada',
        });
      }
    }

    if (treatmentPlanId) {
      const plan = await TreatmentPlan.findOne({
        _id: treatmentPlanId,
        patient: patientId,
        $or: [
          { psychologist: clinicianId },
          { psychologistId: clinicianId },
        ],
      }).select('_id');

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan de tratamiento de origen no encontrado',
        });
      }
    }

    const measure = await Measure.create({
      patient: patientId,
      clinician: clinicianId,
      name: nameToPersist,
      responses: normalizedResponses,
      score: Number(score),
      scoreSource: computedScore !== null ? 'server' : 'submitted',
      itemMap,
      ...(assessmentId ? { assessmentId } : {}),
      ...(therapySessionId ? { therapySessionId } : {}),
      ...(treatmentPlanId ? { treatmentPlanId } : {}),
      ...(sourceTakenAt ? { takenAt: sourceTakenAt } : {}),
    });

    const measuresPHQ9 = nameToPersist === 'PHQ-9'
      ? []
      : await Measure.find({
          patient: patientId,
          clinician: clinicianId,
          name: 'PHQ-9',
        }).sort({ takenAt: 1 }).select('score takenAt');

    if (nameToPersist === 'PHQ-9') {
      measuresPHQ9.push({ score: Number(score), takenAt: sourceTakenAt || new Date() });
    }

    const phq9Response = nameToPersist === 'PHQ-9'
      ? { total: Number(score), item9: Number(normalizedResponses[8]?.score ?? normalizedResponses[8]?.response ?? 0) }
      : measuresPHQ9.length
        ? { total: measuresPHQ9.at(-1).score }
        : undefined;

    const risk = assessRisk({
      phq9: phq9Response,
      measuresPHQ9,
    });

    const alertsCreated = [];
    for (const flag of risk.flags) {
      const severityMap = {
        suicide_risk: 'critical',
        high_depression: 'high',
        worsening_trend: 'moderate',
      };
      const alert = await Alert.create({
        patient: patientId,
        clinician: clinicianId,
        type: flag,
        severity: severityMap[flag] || 'moderate',
        relatedMeasureId: measure._id,
      });
      alertsCreated.push(alert);
    }

    await ActivityLog.create({
      actor: clinicianId,
      patient: patientId,
      action: 'create_measure',
      meta: {
        name: nameToPersist,
        score: Number(score),
        scoreSource: measure.scoreSource,
        assessmentId,
        therapySessionId,
        treatmentPlanId,
        alerts: risk.flags,
      },
    });

    res.status(201).json({
      success: true,
      data: { measure, score: Number(score), alertsCreated },
    });
  } catch (error) {
    logger.error('Error creating measure:', error);
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
    logger.error('Error generating clinical summary:', error);
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
