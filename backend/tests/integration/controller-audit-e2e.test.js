/**
 * 🧪 END-TO-END CONTROLLER + AUDIT INTEGRATION TESTS
 * 
 * Validates that audit context flows correctly from controllers → models → audit logs
 * Simulates actual API requests with mock Express request objects
 */

process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import MedicalRecord from '../../models/MedicalRecordSchema.js';
import TreatmentPlan from '../../models/TreatmentPlanSchema.js';
import PsychologicalClinicalHistory from '../../models/PsychologicalClinicalHistorySchema.js';
import ClinicalAuditLog from '../../models/ClinicalAuditLogSchema.js';
import User from '../../models/UserSchema.js';
import Doctor from '../../models/DoctorSchema.js';
import { setupTestDB, teardownTestDB, clearTestDB, createTestUser, createTestDoctor } from './setup.js';

// Mock Express request object
const createMockRequest = (userId, userRole = 'doctor', email = 'test@example.com') => ({
  userId,
  user: {
    id: userId,
    role: userRole,
    email,
  },
  ip: '192.168.1.100',
  get: (header) => {
    if (header === 'user-agent') return 'Mozilla/5.0 (Test Client)';
    return undefined;
  },
});

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('🔗 Controller → Audit Integration', () => {
  
  test('should capture audit actor from controller request context in createRecord()', async () => {
    const user = await createTestUser(User);
    const doctor = await createTestDoctor(Doctor);
    const mockReq = createMockRequest(doctor._id, 'doctor', doctor.email);
    
    // Simulate createRecord() controller behavior
    const record = new MedicalRecord({
      user: user._id,
      createdBy: doctor._id,
      type: 'consultation',
      title: 'Controller-created Record',
      description: 'Created via controller with audit context',
    });
    
    // Inject audit actor like controller does
    record.$locals.clinicalAuditActor = {
      userId: mockReq.userId,
      role: 'Doctor', // Must match enum: ['User', 'Doctor', 'Admin', 'system', 'unknown']
      email: mockReq.user?.email,
      ip: mockReq.ip,
      userAgent: mockReq.get('user-agent'),
    };
    
    await record.save();
    
    // Wait for async audit log creation
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Verify audit log captured the correct actor
    const log = await ClinicalAuditLog.findOne({
      'resource.entity': 'MedicalRecord',
      'resource.entityId': record._id,
      action: 'CREATE',
    });
    
    expect(log).toBeDefined();
    expect(log.actor.userId.toString()).toBe(doctor._id.toString());
    expect(log.actor.role).toBe('Doctor');
    expect(log.actor.email).toBe(doctor.email);
    expect(log.actor.ip).toBe('192.168.1.100');
    expect(log.actor.userAgent).toContain('Test Client');
  });
  
  test('should capture audit actor in findOneAndUpdate with clinicalAuditActor option', async () => {
    const patient = await createTestUser(User);
    const psychologist = await createTestDoctor(Doctor);
    const mockReq = createMockRequest(psychologist._id, 'doctor', psychologist.email);
    
    // Create initial record
    const history = await PsychologicalClinicalHistory.create({
      patient: patient._id,
      psychologist: psychologist._id,
      intake: {
        chiefComplaint: 'Initial presentation',
      },
    });
    
    // Simulate upsertClinicalHistory() controller behavior with findOneAndUpdate
    const updated = await PsychologicalClinicalHistory.findOneAndUpdate(
      { patient: patient._id, psychologist: psychologist._id },
      {
        $set: {
          intake: {
            chiefComplaint: 'Updated complaint via controller',
          },
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        clinicalAuditActor: {
          userId: mockReq.userId,
          role: 'Doctor', // Must match enum: ['User', 'Doctor', 'Admin', 'system', 'unknown']
          email: mockReq.user?.email,
          ip: mockReq.ip,
          userAgent: mockReq.get('user-agent'),
        },
      }
    );
    
    // Wait for audit
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Verify audit captured actor from option
    const updateLog = await ClinicalAuditLog.findOne({
      'resource.entity': 'PsychologicalClinicalHistory',
      'resource.entityId': history._id,
      action: 'UPDATE',
    });
    
    expect(updateLog).toBeDefined();
    expect(updateLog.actor.userId.toString()).toBe(psychologist._id.toString());
    expect(updateLog.actor.role).toBe('Doctor');
    expect(updateLog.actor.email).toBe(psychologist.email);
    expect(updateLog.actor.ip).toBe('192.168.1.100');
  });
  
  test('should capture multi-step treatment plan lifecycle from controller', async () => {
    const patient = await createTestUser(User);
    const doctor = await createTestDoctor(Doctor);
    const mockReq = createMockRequest(doctor._id, 'doctor', doctor.email);
    
    // Step 1: Controller creates treatment plan
    const plan = new TreatmentPlan({
      patient: patient._id,
      psychologist: doctor._id,
      theoreticalOrientation: 'CBT',
      currentPhase: 'INTAKE',
      status: 'ACTIVE',
    });
    
    plan.$locals.clinicalAuditActor = {
      userId: mockReq.userId,
      role: 'Doctor',
      email: mockReq.user?.email,
      ip: mockReq.ip,
      userAgent: mockReq.get('user-agent'),
    };
    await plan.save();
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Verify CREATE audit
    const createLog = await ClinicalAuditLog.findOne({
      'resource.entity': 'TreatmentPlan',
      'resource.entityId': plan._id,
      action: 'CREATE',
    });
    expect(createLog).toBeDefined();
    expect(createLog.actor.userId.toString()).toBe(doctor._id.toString());
    
    // Step 2: Controller updates treatment plan status
    const updated = await TreatmentPlan.findByIdAndUpdate(
      plan._id,
      { $set: { status: 'ON_HOLD', currentPhase: 'ASSESSMENT' } },
      {
        new: true,
        clinicalAuditActor: {
          userId: mockReq.userId,
          role: 'Doctor', // Must match enum: ['User', 'Doctor', 'Admin', 'system', 'unknown']
          email: mockReq.user?.email,
          ip: mockReq.ip,
          userAgent: mockReq.get('user-agent'),
        },
      }
    );
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Verify UPDATE audit
    const updateLog = await ClinicalAuditLog.findOne({
      'resource.entity': 'TreatmentPlan',
      'resource.entityId': plan._id,
      action: 'UPDATE',
    });
    expect(updateLog).toBeDefined();
    expect(updateLog.actor.userId.toString()).toBe(doctor._id.toString());
    expect(updateLog.changes.some(c => c.path === 'status')).toBe(true);
    expect(updateLog.changes.some(c => c.path === 'currentPhase')).toBe(true);
  });
  
  test('should track different doctor actors in collaborative clinical record', async () => {
    const patient = await createTestUser(User);
    const doctor1 = await createTestDoctor(Doctor, { email: 'doctor1@test.com' });
    const doctor2 = await createTestDoctor(Doctor, { email: 'doctor2@test.com', name: 'Dr. Second' });
    
    // Doctor1 creates record
    const mockReq1 = createMockRequest(doctor1._id, 'doctor', doctor1.email);
    const record = new MedicalRecord({
      user: patient._id,
      createdBy: doctor1._id,
      type: 'consultation',
      title: 'Initial exam by doctor1',
    });
    record.$locals.clinicalAuditActor = {
      userId: mockReq1.userId,
      role: 'Doctor',
      email: mockReq1.user?.email,
      ip: mockReq1.ip,
      userAgent: mockReq1.get('user-agent'),
    };
    await record.save();
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Doctor2 updates same record
    const mockReq2 = createMockRequest(doctor2._id, 'doctor', doctor2.email);
    await MedicalRecord.findByIdAndUpdate(
      record._id,
      { $set: { description: 'Follow-up notes added by doctor2' } },
      {
        new: true,
        clinicalAuditActor: {
          userId: mockReq2.userId,
          role: 'Doctor',
          email: mockReq2.user?.email,
          ip: mockReq2.ip,
          userAgent: mockReq2.get('user-agent'),
        },
      }
    );
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Get all audit logs for this record
    const logs = await ClinicalAuditLog.find({
      'resource.entity': 'MedicalRecord',
      'resource.entityId': record._id,
    }).sort({ timestamp: 1 });
    
    expect(logs).toHaveLength(2);
    
    // Verify CREATE captured doctor1
    expect(logs[0].action).toBe('CREATE');
    expect(logs[0].actor.email).toBe(doctor1.email);
    
    // Verify UPDATE captured doctor2
    expect(logs[1].action).toBe('UPDATE');
    expect(logs[1].actor.email).toBe(doctor2.email);
    
    // Verify full audit trail is complete
    const auditTrail = logs.map(log => ({
      action: log.action,
      actor: log.actor.email,
      timestamp: log.timestamp,
    }));
    
    expect(auditTrail).toEqual([
      { action: 'CREATE', actor: doctor1.email, timestamp: expect.any(Date) },
      { action: 'UPDATE', actor: doctor2.email, timestamp: expect.any(Date) },
    ]);
  });
  
  test('should handle missing audit actor gracefully (fallback behavior)', async () => {
    const user = await createTestUser(User);
    const doctor = await createTestDoctor(Doctor);
    
    // Create without injecting audit actor (unusual but should not crash)
    const record = new MedicalRecord({
      user: user._id,
      createdBy: doctor._id,
      type: 'lab',
      title: 'Record without actor context',
    });
    // Note: NOT setting $locals.clinicalAuditActor
    await record.save();
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Audit log should still be created with null/fallback actor
    const log = await ClinicalAuditLog.findOne({
      'resource.entity': 'MedicalRecord',
      'resource.entityId': record._id,
      action: 'CREATE',
    });
    
    expect(log).toBeDefined();
    // Actor fields should be null or undefined (graceful degradation)
    expect(log.actor.userId).toBeNull();
  });
  
  test('should preserve audit context across nested operations', async () => {
    const patient = await createTestUser(User);
    const doctor = await createTestDoctor(Doctor);
    const mockReq = createMockRequest(doctor._id, 'doctor', doctor.email);
    
    // Simulate complex controller flow: create history + create treatment plan in sequence
    const history = new PsychologicalClinicalHistory({
      patient: patient._id,
      psychologist: doctor._id,
      intake: { chiefComplaint: 'Multiple symptoms' },
    });
    history.$locals.clinicalAuditActor = {
      userId: mockReq.userId,
      role: 'Doctor',
      email: mockReq.user?.email,
      ip: mockReq.ip,
      userAgent: mockReq.get('user-agent'),
    };
    await history.save();
    
    const plan = new TreatmentPlan({
      patient: patient._id,
      psychologist: doctor._id,
      currentPhase: 'INTAKE',
      status: 'ACTIVE',
    });
    plan.$locals.clinicalAuditActor = {
      userId: mockReq.userId,
      role: 'Doctor',
      email: mockReq.user?.email,
      ip: mockReq.ip,
      userAgent: mockReq.get('user-agent'),
    };
    await plan.save();
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Both should have same actor
    const historyLog = await ClinicalAuditLog.findOne({
      'resource.entity': 'PsychologicalClinicalHistory',
      'resource.entityId': history._id,
    });
    const planLog = await ClinicalAuditLog.findOne({
      'resource.entity': 'TreatmentPlan',
      'resource.entityId': plan._id,
    });
    
    expect(historyLog.actor.email).toBe(doctor.email);
    expect(planLog.actor.email).toBe(doctor.email);
    expect(historyLog.actor.email).toBe(planLog.actor.email);
  });
});
