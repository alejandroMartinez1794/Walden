process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import Doctor from '../../models/DoctorSchema.js';
import PsychologicalPatient from '../../models/PsychologicalPatientSchema.js';
import TreatmentPlan from '../../models/TreatmentPlanSchema.js';
import {
  setupTestDB,
  teardownTestDB,
  clearTestDB,
} from '../integration/setup.js';
import {
  assertTreatmentPlanAccess,
  assertPatientAccess,
} from '../../services/clinicalAuthorization.js';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

const buildRequest = (doctor) => ({
  userId: doctor._id.toString(),
  user: {
    id: doctor._id.toString(),
    role: 'doctor',
    email: doctor.email,
  },
  role: 'doctor',
});

describe('clinical object-level authorization', () => {
  test('allows the assigned clinician to access their treatment plan', async () => {
    const doctor = await Doctor.create({
      name: 'Doctor A',
      email: 'doctor-a@test.com',
      password: 'SecurePass123!',
      role: 'doctor',
      isApproved: true,
      emailVerified: true,
    });

    const patient = await PsychologicalPatient.create({
      personalInfo: {
        fullName: 'Patient A',
        dateOfBirth: new Date('1990-01-01'),
      },
      psychologist: doctor._id,
    });

    const plan = await TreatmentPlan.create({
      patient: patient._id,
      patientId: new mongoose.Types.ObjectId(),
      psychologist: doctor._id,
      psychologistId: doctor._id,
      currentPhase: 'INTAKE',
      status: 'ACTIVE',
    });

    const authorized = await assertTreatmentPlanAccess({
      req: buildRequest(doctor),
      treatmentPlanId: plan._id,
      action: 'read',
    });

    expect(authorized._id.toString()).toBe(plan._id.toString());
  });

  test('denies a clinician from another clinician treatment plan', async () => {
    const doctorA = await Doctor.create({
      name: 'Doctor A',
      email: 'doctor-a@test.com',
      password: 'SecurePass123!',
      role: 'doctor',
      isApproved: true,
      emailVerified: true,
    });

    const doctorB = await Doctor.create({
      name: 'Doctor B',
      email: 'doctor-b@test.com',
      password: 'SecurePass123!',
      role: 'doctor',
      isApproved: true,
      emailVerified: true,
    });

    const patient = await PsychologicalPatient.create({
      personalInfo: {
        fullName: 'Patient B',
        dateOfBirth: new Date('1991-01-01'),
      },
      psychologist: doctorB._id,
    });

    const plan = await TreatmentPlan.create({
      patient: patient._id,
      psychologist: doctorB._id,
      psychologistId: doctorB._id,
      currentPhase: 'INTAKE',
      status: 'ACTIVE',
    });

    await expect(
      assertTreatmentPlanAccess({
        req: buildRequest(doctorA),
        treatmentPlanId: plan._id,
        action: 'read',
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('patient-level authorization resolves through the clinical relationship', async () => {
    const doctor = await Doctor.create({
      name: 'Doctor C',
      email: 'doctor-c@test.com',
      password: 'SecurePass123!',
      role: 'doctor',
      isApproved: true,
      emailVerified: true,
    });

    const userId = new mongoose.Types.ObjectId();
    const patient = await PsychologicalPatient.create({
      personalInfo: {
        fullName: 'Patient C',
        dateOfBirth: new Date('1992-01-01'),
      },
      psychologist: doctor._id,
      user: userId,
    });

    const plan = await TreatmentPlan.create({
      patient: patient._id,
      patientId: userId,
      psychologist: doctor._id,
      psychologistId: doctor._id,
      currentPhase: 'INTAKE',
      status: 'ACTIVE',
    });

    const authorized = await assertPatientAccess({
      req: buildRequest(doctor),
      patientId: userId,
      action: 'create measure',
    });

    expect(authorized._id.toString()).toBe(plan._id.toString());
  });

  test('patient-level authorization denies a patient outside the clinician caseload', async () => {
    const doctorA = await Doctor.create({
      name: 'Doctor D',
      email: 'doctor-d@test.com',
      password: 'SecurePass123!',
      role: 'doctor',
      isApproved: true,
      emailVerified: true,
    });

    const doctorB = await Doctor.create({
      name: 'Doctor E',
      email: 'doctor-e@test.com',
      password: 'SecurePass123!',
      role: 'doctor',
      isApproved: true,
      emailVerified: true,
    });

    const patientUserId = new mongoose.Types.ObjectId();

    const patient = await PsychologicalPatient.create({
      personalInfo: {
        fullName: 'Patient D',
        dateOfBirth: new Date('1993-01-01'),
      },
      psychologist: doctorB._id,
      user: patientUserId,
    });

    await TreatmentPlan.create({
      patient: patient._id,
      patientId: patientUserId,
      psychologist: doctorB._id,
      psychologistId: doctorB._id,
      currentPhase: 'INTAKE',
      status: 'ACTIVE',
    });

    await expect(
      assertPatientAccess({
        req: buildRequest(doctorA),
        patientId: patientUserId,
        action: 'create measure',
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});
