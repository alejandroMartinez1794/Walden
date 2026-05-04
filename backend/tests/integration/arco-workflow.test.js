process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../../index.js';
import User from '../../models/UserSchema.js';
import Doctor from '../../models/DoctorSchema.js';
import MedicalRecord from '../../models/MedicalRecordSchema.js';
import PsychologicalPatient from '../../models/PsychologicalPatientSchema.js';
import PsychologicalClinicalHistory from '../../models/PsychologicalClinicalHistorySchema.js';
import TreatmentPlan from '../../models/TreatmentPlanSchema.js';
import ARCORequest from '../../models/ARCORequestSchema.js';
import { setupTestDB, teardownTestDB, clearTestDB, createTestUser, createTestDoctor, generateTestToken } from './setup.js';
import { resetArcoMetrics } from '../../utils/arcoWorkflow.js';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await clearTestDB();
  resetArcoMetrics();
});

const createClinicalBundle = async () => {
  const patientUser = await createTestUser(User, {
    email: `patient-${Date.now()}@test.com`,
    emailVerified: true,
  });
  const doctor = await createTestDoctor(Doctor, {
    email: `doctor-${Date.now()}@test.com`,
    emailVerified: true,
  });

  const psychologicalPatient = await PsychologicalPatient.create({
    user: patientUser._id,
    psychologist: doctor._id,
    personalInfo: {
      fullName: 'Paciente ARCO',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'prefer-not-to-say',
    },
    clinicalInfo: {
      chiefComplaint: 'Ansiedad persistente y alteraciones del sueño',
    },
    status: 'active',
  });

  const medicalRecord = await MedicalRecord.create({
    user: patientUser._id,
    createdBy: doctor._id,
    type: 'consultation',
    title: 'Consulta inicial ARCO',
    description: 'Registro médico de prueba para el workflow ARCO',
  });

  const clinicalHistory = await PsychologicalClinicalHistory.create({
    patient: psychologicalPatient._id,
    psychologist: doctor._id,
    intake: {
      chiefComplaint: 'Ansiedad persistente y alteraciones del sueño',
      onsetDate: new Date('2024-01-01'),
    },
  });

  const treatmentPlan = await TreatmentPlan.create({
    patient: psychologicalPatient._id,
    psychologist: doctor._id,
    currentPhase: 'INTAKE',
    status: 'ACTIVE',
    theoreticalOrientation: 'CBT',
    goals: [{ description: 'Reducir ansiedad generalizada', achievable: true }],
  });

  return { patientUser, doctor, psychologicalPatient, medicalRecord, clinicalHistory, treatmentPlan };
};

describe('ARCO Workflow', () => {
  test('debe crear, listar y aprobar una solicitud de cancelación con soft-delete en cascada', async () => {
    const { patientUser, psychologicalPatient, medicalRecord, clinicalHistory, treatmentPlan } = await createClinicalBundle();
    const admin = await createTestUser(User, {
      email: `admin-${Date.now()}@test.com`,
      role: 'admin',
      emailVerified: true,
    });

    const patientToken = generateTestToken(patientUser._id, 'paciente');
    const adminToken = generateTestToken(admin._id, 'admin');

    const createResponse = await request(app)
      .post('/api/v1/clinical/arco/request-cancellation')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        reason: 'Solicito la cancelación de mis datos clínicos bajo ARCO.',
        details: 'Es una petición de prueba para validar el workflow.',
      })
      .expect(201);

    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.status).toBe('PENDING');

    const requestId = createResponse.body.data._id;

    const myRequests = await request(app)
      .get('/api/v1/clinical/arco/my-requests')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200);

    expect(myRequests.body.data).toHaveLength(1);
    expect(myRequests.body.data[0]._id).toBe(requestId);

    const adminListing = await request(app)
      .get('/api/v1/clinical/arco/requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(adminListing.body.data).toHaveLength(1);

    const approveResponse = await request(app)
      .post(`/api/v1/clinical/arco/requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reviewNotes: 'Cancelación aprobada por validación de prueba.' })
      .expect(200);

    expect(approveResponse.body.success).toBe(true);
    expect(approveResponse.body.data.status).toBe('FULFILLED');
    expect(approveResponse.body.cascade.summary.medicalRecords.deleted).toBeGreaterThanOrEqual(1);
    expect(approveResponse.body.cascade.summary.psychologicalPatients.deleted).toBeGreaterThanOrEqual(1);

    const deletedMedicalRecord = await MedicalRecord.findById(medicalRecord._id).setOptions({ includeDeleted: true });
    const deletedClinicalHistory = await PsychologicalClinicalHistory.findById(clinicalHistory._id).setOptions({ includeDeleted: true });
    const deletedTreatmentPlan = await TreatmentPlan.findById(treatmentPlan._id).setOptions({ includeDeleted: true });
    const deletedPsychologicalPatient = await PsychologicalPatient.findById(psychologicalPatient._id).setOptions({ includeDeleted: true });

    expect((await MedicalRecord.findById(medicalRecord._id))).toBeNull();
    expect((await PsychologicalClinicalHistory.findById(clinicalHistory._id))).toBeNull();
    expect((await TreatmentPlan.findById(treatmentPlan._id))).toBeNull();
    expect((await PsychologicalPatient.findById(psychologicalPatient._id))).toBeNull();

    expect(deletedMedicalRecord.isDeleted).toBe(true);
    expect(deletedClinicalHistory.isDeleted).toBe(true);
    expect(deletedTreatmentPlan.isDeleted).toBe(true);
    expect(deletedPsychologicalPatient.isDeleted).toBe(true);

    const storedRequest = await ARCORequest.findById(requestId).setOptions({ includeDeleted: true });
    expect(storedRequest.status).toBe('FULFILLED');
    expect(storedRequest.fulfillment.affectedEntities.length).toBeGreaterThan(0);
  });

  test('debe permitir rechazar una solicitud de acceso con estado final REJECTED', async () => {
    const { patientUser } = await createClinicalBundle();
    const admin = await createTestUser(User, {
      email: `admin-${Date.now()}@test.com`,
      role: 'admin',
      emailVerified: true,
    });

    const patientToken = generateTestToken(patientUser._id, 'paciente');
    const adminToken = generateTestToken(admin._id, 'admin');

    const createResponse = await request(app)
      .post('/api/v1/clinical/arco/request-access')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        reason: 'Necesito acceso a mi historia clínica para revisión personal.',
        requestedFields: ['medical', 'psychological'],
      })
      .expect(201);

    const requestId = createResponse.body.data._id;

    const rejectResponse = await request(app)
      .post(`/api/v1/clinical/arco/requests/${requestId}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reviewNotes: 'Solicitud rechazada por falta de validación adicional.' })
      .expect(200);

    expect(rejectResponse.body.data.status).toBe('REJECTED');

    const myRequests = await request(app)
      .get('/api/v1/clinical/arco/my-requests')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200);

    expect(myRequests.body.data[0].status).toBe('REJECTED');
  });

  test('debe aplicar rectificación automática y dejar métricas de monitoreo', async () => {
    const { patientUser, psychologicalPatient, clinicalHistory } = await createClinicalBundle();
    const admin = await createTestUser(User, {
      email: `admin-${Date.now()}@test.com`,
      role: 'admin',
      emailVerified: true,
    });

    const patientToken = generateTestToken(patientUser._id, 'paciente');
    const adminToken = generateTestToken(admin._id, 'admin');

    const rectificationResponse = await request(app)
      .post('/api/v1/clinical/arco/request-rectification')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        reason: 'Necesito corregir mi nombre y el motivo de consulta registrado.',
        details: 'La información de identificación está desactualizada.',
        requestedChanges: {
          psychologicalPatient: {
            personalInfo: {
              fullName: 'Paciente ARCO Corregido',
            },
          },
          clinicalHistory: {
            intake: {
              chiefComplaint: 'Ansiedad persistente corregida tras revisión documental',
            },
          },
        },
      })
      .expect(201);

    const rectificationRequestId = rectificationResponse.body.data._id;

    const approvalResponse = await request(app)
      .post(`/api/v1/clinical/arco/requests/${rectificationRequestId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reviewNotes: 'Rectificación aprobada y aplicada en los registros clínicos.' })
      .expect(200);

    expect(['FULFILLED', 'PARTIALLY_FULFILLED']).toContain(approvalResponse.body.data.status);
    expect(approvalResponse.body.data.fulfillment.rectificationResults).toEqual(expect.any(Array));

    const updatedPsychologicalPatient = await PsychologicalPatient.findById(psychologicalPatient._id).setOptions({ includeDeleted: true });
    const updatedClinicalHistory = await PsychologicalClinicalHistory.findById(clinicalHistory._id).setOptions({ includeDeleted: true });

    expect(updatedPsychologicalPatient.personalInfo.fullName).toBe('Paciente ARCO Corregido');
    expect(updatedClinicalHistory.intake.chiefComplaint).toContain('corregida');

    const metricsResponse = await request(app)
      .get('/api/v1/clinical/arco/metrics')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(metricsResponse.body.data.totalRequests).toBeGreaterThanOrEqual(2);
    expect(metricsResponse.body.data.byRequestType.RECTIFICATION).toBeGreaterThanOrEqual(1);
    expect(metricsResponse.body.data.operations.approveRequest.count).toBeGreaterThanOrEqual(1);
    expect(metricsResponse.body.data.operations.approveRequest.averageMs).toBeGreaterThanOrEqual(0);
  });

  test('debe generar bundle de exportación para solicitud de acceso', async () => {
    const { patientUser } = await createClinicalBundle();
    const admin = await createTestUser(User, {
      email: `admin-${Date.now()}@test.com`,
      role: 'admin',
      emailVerified: true,
    });

    const patientToken = generateTestToken(patientUser._id, 'paciente');
    const adminToken = generateTestToken(admin._id, 'admin');

    const createResponse = await request(app)
      .post('/api/v1/clinical/arco/request-access')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        reason: 'Deseo obtener un export de mis datos clínicos.',
        requestedFields: ['medical', 'psychological'],
      })
      .expect(201);

    const requestId = createResponse.body.data._id;

    const approvalResponse = await request(app)
      .post(`/api/v1/clinical/arco/requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reviewNotes: 'Exportación generada correctamente.' })
      .expect(200);

    expect(approvalResponse.body.data.status).toBe('FULFILLED');
    expect(approvalResponse.body.data.fulfillment.exportBundle.summary.totalDocuments).toBeGreaterThan(0);
    expect(approvalResponse.body.data.fulfillment.exportBundle.sections.medicalRecords).toEqual(expect.any(Array));
  });

  test('debe bloquear administración ARCO para usuarios no admin', async () => {
    const { patientUser } = await createClinicalBundle();
    const patientToken = generateTestToken(patientUser._id, 'paciente');

    await request(app)
      .get('/api/v1/clinical/arco/requests')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(403);
  });
});