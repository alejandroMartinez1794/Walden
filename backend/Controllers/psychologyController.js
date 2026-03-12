// backend/Controllers/psychologyController.js
import PsychologicalPatient from '../models/PsychologicalPatientSchema.js';
import TherapySession from '../models/TherapySessionSchema.js';
import PsychologicalAssessment from '../models/PsychologicalAssessmentSchema.js';
import TreatmentPlan from '../models/TreatmentPlanSchema.js';
import PsychologicalClinicalHistory from '../models/PsychologicalClinicalHistorySchema.js';
import Booking from '../models/BookingSchema.js';
import User from '../models/UserSchema.js';
import ClinicalLog from '../models/ClinicalLogSchema.js';
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// ============ PACIENTES ============

export const createPatient = async (req, res) => {
  try {
    const psychologistId = req.userId;
    const patientData = { ...req.body, psychologist: psychologistId };
    
    // Intentar vincular con usuario existente por email
    if (patientData.personalInfo?.email) {
      const existingUser = await User.findOne({ email: patientData.personalInfo.email });
      if (existingUser) {
        patientData.user = existingUser._id;
      }
    }

    const newPatient = await PsychologicalPatient.create(patientData);
    
    res.status(201).json({
      success: true,
      message: 'Paciente creado exitosamente',
      data: newPatient,
    });
  } catch (error) {
    logger.error('Error al crear paciente:', error);
    res.status(500).json({ success: false, message: 'Error al crear paciente' });
  }
};

export const getMyPatients = async (req, res) => {
  try {
    const psychologistId = req.userId;
    logger.info(`🧠 getMyPatients: Buscando pacientes para psicólogo ${psychologistId}`);
    
    const { status } = req.query;
    
    // 1. Sincronizar pacientes desde Reservas (Bookings)
    // Buscar reservas de este doctor donde el usuario no tenga aún un expediente
    const bookings = await Booking.find({ doctor: psychologistId }).populate('user');
    
    // Extraer usuarios únicos de las reservas
    const uniqueUsers = {};
    bookings.forEach(booking => {
      if (booking.user && booking.user._id) {
        uniqueUsers[booking.user._id.toString()] = booking.user;
      }
    });

    // Verificar cuáles ya tienen expediente
    const userIds = Object.keys(uniqueUsers);
    if (userIds.length > 0) {
      const existingPatients = await PsychologicalPatient.find({
        psychologist: psychologistId,
        user: { $in: userIds }
      });
      
      const existingUserIds = new Set(existingPatients.map(p => p.user.toString()));
      
      // Crear expedientes para los nuevos
      const newPatientsToCreate = userIds
        .filter(id => !existingUserIds.has(id))
        .map(id => {
          const user = uniqueUsers[id];
          return {
            psychologist: psychologistId,
            user: id,
            personalInfo: {
              fullName: user.name,
              email: user.email,
              phone: user.phone ? String(user.phone) : '',
              gender: (user.gender && ['male', 'female', 'other'].includes(user.gender.toLowerCase())) ? user.gender.toLowerCase() : 'prefer-not-to-say',
              dateOfBirth: new Date(), // Placeholder, se debe actualizar
            },
            status: 'active'
          };
        });
      
      if (newPatientsToCreate.length > 0) {
        await PsychologicalPatient.insertMany(newPatientsToCreate);
      }
    }

    // 2. Obtener lista completa
    const filter = { psychologist: psychologistId };
    if (status) filter.status = status;
    
    const patients = await PsychologicalPatient.find(filter)
      .sort({ lastSessionDate: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    logger.error('❌ Error en getMyPatients:', error);
    res.status(500).json({ success: false, message: 'Error al obtener pacientes', error: error.message });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const psychologistId = req.userId;
    
    const patient = await PsychologicalPatient.findOne({ 
      _id: id, 
      psychologist: psychologistId 
    });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    }
    
    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    logger.error('Error al obtener paciente:', error);
    res.status(500).json({ success: false, message: 'Error al obtener paciente' });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const psychologistId = req.userId;
    
    const updatedPatient = await PsychologicalPatient.findOneAndUpdate(
      { _id: id, psychologist: psychologistId },
      { $set: req.body },
      { new: true }
    );
    
    if (!updatedPatient) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Paciente actualizado exitosamente',
      data: updatedPatient,
    });
  } catch (error) {
    logger.error('Error al actualizar paciente:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar paciente' });
  }
};

// ============ SESIONES ============

export const createSession = async (req, res) => {
  try {
    const psychologistId = req.userId;
    const sessionData = { ...req.body, psychologist: psychologistId };
    
    const newSession = await TherapySession.create(sessionData);
    
    // Actualizar fecha de última sesión del paciente
    await PsychologicalPatient.findByIdAndUpdate(
      req.body.patient,
      { lastSessionDate: sessionData.sessionDate }
    );
    
    res.status(201).json({
      success: true,
      message: 'Sesión registrada exitosamente',
      data: newSession,
    });
  } catch (error) {
    logger.error('Error al crear sesión:', error);
    res.status(500).json({ success: false, message: 'Error al registrar sesión' });
  }
};

export const getPatientSessions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const psychologistId = req.userId;
    
    const sessions = await TherapySession.find({
      patient: patientId,
      psychologist: psychologistId,
    })
      .sort({ sessionDate: -1 })
      .populate('patient', 'personalInfo.fullName');
    
    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    logger.error('Error al obtener sesiones:', error);
    res.status(500).json({ success: false, message: 'Error al obtener sesiones' });
  }
};

// ============ EVALUACIONES ============

export const createAssessment = async (req, res) => {
  try {
    const psychologistId = req.userId;
    const assessmentData = { ...req.body, psychologist: psychologistId };
    
    // Detectar alertas de riesgo automáticamente
    const { testType, responses, scores } = req.body;
    
    // Ejemplo: BDI-II ítem 9 o PHQ-9 ítem 9 (ideación suicida)
    if ((testType === 'BDI-II' || testType === 'PHQ-9') && responses) {
      const suicidalItem = responses.find(r => r.itemNumber === 9);
      if (suicidalItem && suicidalItem.response > 0) {
        assessmentData.riskAlert = {
          flagged: true,
          reason: 'Respuesta positiva en ítem de ideación suicida',
          action: 'Requiere evaluación inmediata del riesgo',
        };
      }
    }
    
    // Normalizar puntajes y severidad (PHQ-9 / GAD-7 / BDI-II)
    const total = scores?.total ?? (Array.isArray(responses) ? responses.reduce((s, r) => s + Number(r.response || 0), 0) : undefined);
    if (total !== undefined) {
      assessmentData.scores = { ...(assessmentData.scores || {}), total };
      const sev = (() => {
        if (testType === 'PHQ-9') {
          if (total >= 20) return 'severe';
          if (total >= 15) return 'moderately-severe';
          if (total >= 10) return 'moderate';
          if (total >= 5) return 'mild';
          return 'minimal';
        }
        if (testType === 'GAD-7') {
          if (total >= 15) return 'severe';
          if (total >= 10) return 'moderate';
          if (total >= 5) return 'mild';
          return 'minimal';
        }
        if (testType === 'BDI-II') {
          if (total >= 29) return 'severe';
          if (total >= 20) return 'moderate';
          if (total >= 14) return 'mild';
          return 'minimal';
        }
        return undefined;
      })();
      if (sev) {
        assessmentData.interpretation = {
          ...(assessmentData.interpretation || {}),
          severity: sev,
        };
      }
    }

    const newAssessment = await PsychologicalAssessment.create(assessmentData);
    
    res.status(201).json({
      success: true,
      message: 'Evaluación registrada exitosamente',
      data: newAssessment,
    });
  } catch (error) {
    logger.error('Error al crear evaluación:', error);
    res.status(500).json({ success: false, message: 'Error al registrar evaluación' });
  }
};

export const getPatientAssessments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const psychologistId = req.userId;
    const { testType } = req.query;
    
    const filter = {
      patient: patientId,
      psychologist: psychologistId,
    };
    
    if (testType) filter.testType = testType;
    
    const assessments = await PsychologicalAssessment.find(filter)
      .sort({ testDate: -1 });
    
    res.status(200).json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    logger.error('Error al obtener evaluaciones:', error);
    res.status(500).json({ success: false, message: 'Error al obtener evaluaciones' });
  }
};

// ============ PLANES DE TRATAMIENTO ============

export const createTreatmentPlan = async (req, res) => {
  try {
    const psychologistId = req.userId;
    const planData = { ...req.body, psychologist: psychologistId };
    
    const newPlan = await TreatmentPlan.create(planData);
    
    res.status(201).json({
      success: true,
      message: 'Plan de tratamiento creado exitosamente',
      data: newPlan,
    });
  } catch (error) {
    logger.error('Error al crear plan de tratamiento:', error);
    res.status(500).json({ success: false, message: 'Error al crear plan' });
  }
};

export const getPatientTreatmentPlans = async (req, res) => {
  try {
    const { patientId } = req.params;
    const psychologistId = req.userId;
    
    const plans = await TreatmentPlan.find({
      patient: patientId,
      psychologist: psychologistId,
    })
      .sort({ startDate: -1 });
    
    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    logger.error('Error al obtener planes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener planes' });
  }
};

export const updateTreatmentPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const psychologistId = req.userId;
    
    const updatedPlan = await TreatmentPlan.findOneAndUpdate(
      { _id: id, psychologist: psychologistId },
      { $set: req.body },
      { new: true }
    );
    
    if (!updatedPlan) {
      return res.status(404).json({ success: false, message: 'Plan no encontrado' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Plan actualizado exitosamente',
      data: updatedPlan,
    });
  } catch (error) {
    logger.error('Error al actualizar plan:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar plan' });
  }
};

// ============ DASHBOARD OVERVIEW ============

export const getPsychologyDashboard = async (req, res) => {
  try {
    const psychologistId = req.userId;
    
    // Estadísticas generales
    const totalPatients = await PsychologicalPatient.countDocuments({ 
      psychologist: psychologistId 
    });
    
    const activePatients = await PsychologicalPatient.countDocuments({ 
      psychologist: psychologistId, 
      status: 'active' 
    });
    
    // Sesiones de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaySessions = await TherapySession.find({
      psychologist: psychologistId,
      sessionDate: { $gte: today, $lt: tomorrow },
    }).populate('patient', 'personalInfo.fullName');
    
    // Alertas de riesgo (evaluaciones con flags)
    const riskAlerts = await PsychologicalAssessment.find({
      psychologist: psychologistId,
      'riskAlert.flagged': true,
    })
      .sort({ testDate: -1 })
      .limit(5)
      .populate('patient', 'personalInfo.fullName');
    
    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        activePatients,
        todaySessions,
        riskAlerts,
      },
    });
  } catch (error) {
    logger.error('Error al obtener dashboard:', error);
    res.status(500).json({ success: false, message: 'Error al obtener datos del dashboard' });
  }
};

// ============ HISTORIA CLÍNICA ============
export const upsertClinicalHistory = async (req, res) => {
  try {
    const psychologistId = req.userId;
    const { patientId } = req.params;
    const payload = { ...req.body, patient: patientId, psychologist: psychologistId };

    const updated = await PsychologicalClinicalHistory.findOneAndUpdate(
      { patient: patientId, psychologist: psychologistId },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Auditoría Clínica
    try {
      await ClinicalLog.create({
        actor: { userId: psychologistId, role: 'Doctor', ip: req.ip, userAgent: req.get('User-Agent') },
        action: 'UPDATE',
        resource: { entity: 'PsychologicalClinicalHistory', entityId: updated._id },
        context: { status: 'SUCCESS' }
      });
    } catch (logError) {
      logger.error('Error creando log de auditoría:', logError);
    }

    res.status(200).json({ success: true, message: 'Historia clínica guardada', data: updated });
  } catch (error) {
    logger.error('Error al guardar historia clínica:', error);
    res.status(500).json({ success: false, message: 'Error al guardar historia clínica' });
  }
};

export const getClinicalHistory = async (req, res) => {
  try {
    const psychologistId = req.userId;
    const { patientId } = req.params;
    const doc = await PsychologicalClinicalHistory.findOne({ patient: patientId, psychologist: psychologistId });

    if (doc) {
      // Auditoría de Acceso
      try {
        await ClinicalLog.create({
          actor: { userId: psychologistId, role: 'Doctor', ip: req.ip, userAgent: req.get('User-Agent') },
          action: 'ACCESS',
          resource: { entity: 'PsychologicalClinicalHistory', entityId: doc._id },
          context: { status: 'SUCCESS' }
        });
      } catch (logError) {
        logger.error('Error creando log de acceso:', logError);
      }
    }

    res.status(200).json({ success: true, data: doc || null });
  } catch (error) {
    logger.error('Error al obtener historia clínica:', error);
    res.status(500).json({ success: false, message: 'Error al obtener historia clínica' });
  }
};

// ============ CBT OVERVIEW (TCC) ============
// Agrega métricas agregadas específicas de TCC para el dashboard del doctor
export const getCbtOverview = async (req, res) => {
  try {
    const psychologistId = req.userId;

    // Rangos de tiempo
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const twoMonthsAgo = new Date(now);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const eightWeeksAgo = new Date(now);
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 7 * 8);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1) Tendencias de severidad (PHQ-9, BDI-II, GAD-7) promedio por mes (últimos 6 meses)
    const assessments = await PsychologicalAssessment.aggregate([
      {
        $match: {
          psychologist: new mongoose.Types.ObjectId(psychologistId),
          testDate: { $gte: sixMonthsAgo, $lte: now },
          testType: { $in: ['PHQ-9', 'BDI-II', 'GAD-7'] },
        },
      },
      {
        $project: {
          year: { $year: '$testDate' },
          month: { $month: '$testDate' },
          testType: 1,
          score: '$scores.total',
        },
      },
      {
        $group: {
          _id: { year: '$year', month: '$month', testType: '$testType' },
          avgScore: { $avg: '$score' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Construir labels últimos 6 meses
    const monthLabels = [];
    const labelDate = new Date(sixMonthsAgo);
    for (let i = 0; i < 6; i++) {
      const m = labelDate.toLocaleString('es-ES', { month: 'short' });
      monthLabels.push(m.charAt(0).toUpperCase() + m.slice(1));
      labelDate.setMonth(labelDate.getMonth() + 1);
    }

    const initSeries = () => new Array(6).fill(null);
    const phq9 = initSeries();
    const bdi2 = initSeries();
    const gad7 = initSeries();

    assessments.forEach((a) => {
      const idx = (a._id.year - sixMonthsAgo.getFullYear()) * 12 + (a._id.month - 1) - sixMonthsAgo.getMonth();
      if (idx >= 0 && idx < 6) {
        if (a._id.testType === 'PHQ-9') phq9[idx] = Number(a.avgScore.toFixed(1));
        if (a._id.testType === 'BDI-II') bdi2[idx] = Number(a.avgScore.toFixed(1));
        if (a._id.testType === 'GAD-7') gad7[idx] = Number(a.avgScore.toFixed(1));
      }
    });

    // 2) Distorsiones cognitivas (últimos 60 días de sesiones)
    const distortionsAgg = await TherapySession.aggregate([
      {
        $match: {
          psychologist: new mongoose.Types.ObjectId(psychologistId),
          sessionDate: { $gte: twoMonthsAgo, $lte: now },
        },
      },
      { $unwind: { path: '$automaticThoughts', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: '$automaticThoughts.cognitiveDistortion',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    const distortions = distortionsAgg
      .filter((d) => d._id)
      .map((d) => ({ name: d._id, value: d.count }));

    // 3) Adherencia a tareas conductuales (últimos 60 días)
    const assignmentsAgg = await TherapySession.aggregate([
      {
        $match: {
          psychologist: new mongoose.Types.ObjectId(psychologistId),
          sessionDate: { $gte: twoMonthsAgo, $lte: now },
        },
      },
      { $unwind: { path: '$behavioralAssignments', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$behavioralAssignments.completed', 1, 0] } },
        },
      },
    ]);
    const assignments = assignmentsAgg[0] || { total: 0, completed: 0 };
    const adherencePercent = assignments.total > 0 ? Math.round((assignments.completed / assignments.total) * 100) : 0;

    // 4) Técnicas de intervención TCC en planes activos
    const techniquesAgg = await TreatmentPlan.aggregate([
      {
        $match: {
          psychologist: new mongoose.Types.ObjectId(psychologistId),
          status: 'active',
        },
      },
      { $unwind: { path: '$interventionTechniques', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: '$interventionTechniques.technique',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    const interventions = techniquesAgg
      .filter((t) => t._id)
      .map((t) => ({ technique: t._id, count: t.count }));

    // 5) Modalidad de sesiones (últimos 30 días)
    const modalityAgg = await TherapySession.aggregate([
      {
        $match: {
          psychologist: new mongoose.Types.ObjectId(psychologistId),
          sessionDate: { $gte: thirtyDaysAgo, $lte: now },
        },
      },
      {
        $group: {
          _id: '$modality',
          count: { $sum: 1 },
        },
      },
    ]);
    const modality = {
      'in-person': 0,
      online: 0,
      phone: 0,
    };
    modalityAgg.forEach((m) => {
      if (m._id && modality[m._id] !== undefined) modality[m._id] = m.count;
    });

    // 6) Sesiones por semana (últimas 8 semanas)
    const sessionsByWeekAgg = await TherapySession.aggregate([
      {
        $match: {
          psychologist: new mongoose.Types.ObjectId(psychologistId),
          sessionDate: { $gte: eightWeeksAgo, $lte: now },
        },
      },
      {
        $project: {
          isoWeek: { $isoWeek: '$sessionDate' },
          isoYear: { $isoWeekYear: '$sessionDate' },
        },
      },
      {
        $group: {
          _id: { year: '$isoYear', week: '$isoWeek' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]);
    // Construir semanas etiquetas (W1..W8)
    const weekly = new Array(8).fill(0);
    const ref = new Date(eightWeeksAgo);
    for (let i = 0; i < 8; i++) {
      // Buscar en agg la semana correspondiente
      const weekNum = Number(ref.toLocaleString('en-GB', { week: 'numeric' }));
      const yearNum = ref.getFullYear();
      const hit = sessionsByWeekAgg.find((w) => w._id.week === weekNum && w._id.year === yearNum);
      weekly[i] = hit ? hit.count : 0;
      ref.setDate(ref.getDate() + 7);
    }

    // 7) Alertas de riesgo
    const riskAlertsAgg = await PsychologicalAssessment.countDocuments({
      psychologist: psychologistId,
      'riskAlert.flagged': true,
      testDate: { $gte: sixMonthsAgo, $lte: now },
    });

    res.status(200).json({
      success: true,
      data: {
        severityTrends: {
          labels: monthLabels,
          phq9,
          bdi2,
          gad7,
        },
        distortions,
        homeworkAdherence: {
          completed: assignments.completed,
          total: assignments.total,
          percent: adherencePercent,
        },
        interventions,
        modality,
        sessionsByWeek: weekly,
        riskAlerts: {
          count: riskAlertsAgg,
        },
      },
    });
  } catch (error) {
    logger.error('Error en CBT overview:', error);
    res.status(500).json({ success: false, message: 'Error al obtener métricas de TCC' });
  }
};

// ============ DEMO DATA SEED (DEV) ============
export const seedCbtDemoData = async (req, res) => {
  try {
    const psychologistId = req.userId;

    // Simple guard: allow only in non-production
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Seed no permitido en producción' });
    }

    // 1) Create a demo patient if none exists
    let patient = await PsychologicalPatient.findOne({ psychologist: psychologistId });
    if (!patient) {
      patient = await PsychologicalPatient.create({
        personalInfo: {
          fullName: 'Paciente Demo TCC',
          dateOfBirth: new Date('1990-05-10'),
          gender: 'other',
          email: 'demo.tcc@example.com',
        },
        clinicalInfo: {
          chiefComplaint: 'Ansiedad y pensamiento catastrófico',
          diagnoses: [
            { code: 'F41.1', description: 'Trastorno de ansiedad generalizada', type: 'primary' },
          ],
          riskFactors: { suicidalIdeation: false, traumaHistory: true },
        },
        psychologist: psychologistId,
        status: 'active',
        firstSessionDate: new Date(),
      });
    }

    // 2) Create demo sessions with automatic thoughts and assignments
    const baseDate = new Date();
    const sessionsPayload = [];
    for (let i = 0; i < 8; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i * 7);
      sessionsPayload.push({
        patient: patient._id,
        psychologist: psychologistId,
        sessionNumber: i + 1,
        sessionDate: d,
        modality: i % 3 === 0 ? 'in-person' : i % 3 === 1 ? 'online' : 'phone',
        automaticThoughts: [
          {
            situation: 'Reunión laboral',
            automaticThought: 'Voy a arruinarlo todo',
            emotion: 'Ansiedad',
            intensity: 8,
            cognitiveDistortion: i % 2 === 0 ? 'Catastrofismo' : 'Lectura de mente',
            rationalResponse: 'He preparado esta reunión, puedo manejarla',
            outcomeIntensity: 4,
          },
        ],
        behavioralAssignments: [
          { task: 'Registro de actividades agradables', completed: i % 2 === 0 },
          { task: 'Exposición gradual a llamadas', completed: i % 3 === 0 },
        ],
      });
    }
    await TherapySession.insertMany(sessionsPayload);

    // 3) Create demo assessments across months (PHQ-9, BDI-II, GAD-7)
    const assessPayload = [];
    const today = new Date();
    for (let m = 5; m >= 0; m--) {
      const dt = new Date(today);
      dt.setMonth(today.getMonth() - m);
      const scoreBase = 18 - m * 2;
      ['PHQ-9', 'BDI-II', 'GAD-7'].forEach((testType) => {
        assessPayload.push({
          patient: patient._id,
          psychologist: psychologistId,
          testType,
          testDate: dt,
          scores: { total: Math.max(2, scoreBase + (testType === 'GAD-7' ? -2 : 0)) },
          interpretation: { severity: 'moderate' },
        });
      });
    }
    await PsychologicalAssessment.insertMany(assessPayload);

    // 4) Create a CBT treatment plan with techniques
    await TreatmentPlan.create({
      patient: patient._id,
      psychologist: psychologistId,
      theoreticalOrientation: 'CBT',
      targetDiagnoses: ['F41.1'],
      goals: [
        { description: 'Reducir ansiedad diaria', status: 'in-progress', progress: 40, timeframe: '8 semanas' },
      ],
      interventionTechniques: [
        { technique: 'cognitive-restructuring', description: 'ABCD de pensamiento' },
        { technique: 'behavioral-activation', description: 'Agenda de actividades' },
        { technique: 'exposure-therapy', description: 'Exposición a llamadas' },
      ],
      sessionFrequency: 'weekly',
      estimatedDuration: '8-12 sesiones',
      status: 'active',
      startDate: new Date(),
    });

    res.status(201).json({ success: true, message: 'Datos demo TCC generados' });
  } catch (error) {
    logger.error('Error en seed demo TCC:', error);
    res.status(500).json({ success: false, message: 'Error al generar demo' });
  }
};
