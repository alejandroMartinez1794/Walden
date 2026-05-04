/**
 * 🧪 CLINICAL LIFECYCLE TESTS
 * 
 * Verifica:
 * - Auditoría inmutable de cambios (who, when, what, before/after)
 * - Soft delete con ciclo legal de retención
 * - Validación de negocio clínico (no fechas futuras, estados válidos)
 * - Índices para dashboard clínico rápido
 * 
 * Cubre Resolución 2654/2019 (Trazabilidad clínica) y Ley 1581/2012 (Ciclo de vida PHI)
 */

process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import MedicalRecord from '../../models/MedicalRecordSchema.js';
import PsychologicalPatient from '../../models/PsychologicalPatientSchema.js';
import PsychologicalClinicalHistory from '../../models/PsychologicalClinicalHistorySchema.js';
import TreatmentPlan from '../../models/TreatmentPlanSchema.js';
import ClinicalAuditLog from '../../models/ClinicalAuditLogSchema.js';
import User from '../../models/UserSchema.js';
import Doctor from '../../models/DoctorSchema.js';
import { setupTestDB, teardownTestDB, clearTestDB, createTestUser, createTestDoctor } from './setup.js';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('🏥 Clinical Lifecycle - Auditoría Inmutable', () => {
  
  test('debe crear audit log con before/after al crear Medical Record', async () => {
    const user = await createTestUser(User);
    const doctor = await createTestDoctor(Doctor);
    
    const record = await MedicalRecord.create({
      user: user._id,
      createdBy: doctor._id,
      type: 'consultation',
      title: 'Initial Psychiatric Evaluation',
      description: 'Patient presents with depressive symptoms',
      date: new Date('2026-01-15'),
    });
    
    // Esperar auditoría asincrónica
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const log = await ClinicalAuditLog.findOne({
      'resource.entity': 'MedicalRecord',
      'resource.entityId': record._id,
      action: 'CREATE',
    });
    
    expect(log).toBeDefined();
    expect(log.actor.userId).toBeNull(); // Creado desde test, sin usuario
    expect(log.action).toBe('CREATE');
    expect(log.changes).toBeDefined();
    expect(log.newValue.title).toBe('Initial Psychiatric Evaluation');
    expect(log.newValue.description).toBe('Patient presents with depressive symptoms');
    expect(log.context.status).toBe('SUCCESS');
    expect(log.timestamp).toBeDefined();
  });
  
  test('debe registrar cambios específicos en UPDATE con diff completo', async () => {
    const user = await createTestUser(User);
    const doctor = await createTestDoctor(Doctor);
    
    const record = await MedicalRecord.create({
      user: user._id,
      createdBy: doctor._id,
      type: 'consultation',
      title: 'Initial Visit',
      description: 'First consultation',
    });
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Actualizar
    const updated = await MedicalRecord.findByIdAndUpdate(
      record._id,
      {
        $set: {
          description: 'Updated: Patient responds well to treatment',
          title: 'Follow-up Consultation',
        },
      },
      { new: true }
    );
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const logs = await ClinicalAuditLog.find({
      'resource.entityId': record._id,
    }).sort({ timestamp: 1 });
    
    const updateLog = logs.find(l => l.action === 'UPDATE');
    expect(updateLog).toBeDefined();
    
    // Verificar que el cambio se capturó
    const titleChange = updateLog.changes.find(c => c.path === 'title');
    expect(titleChange).toBeDefined();
    expect(titleChange.previousValue).toBe('Initial Visit');
    expect(titleChange.newValue).toBe('Follow-up Consultation');
    
    const descChange = updateLog.changes.find(c => c.path === 'description');
    expect(descChange).toBeDefined();
    expect(descChange.previousValue).toBe('First consultation');
    expect(descChange.newValue).toContain('Updated');
  });
  
  test('debe rechazar fechas futuras en Medical Record (validación clínica)', async () => {
    const user = await createTestUser(User);
    const doctor = await createTestDoctor(Doctor);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    
    try {
      await MedicalRecord.create({
        user: user._id,
        createdBy: doctor._id,
        type: 'consultation',
        title: 'Future Consultation',
        date: futureDate,
      });
      expect(true).toBe(false); // Should fail
    } catch (error) {
      expect(error.message).toContain('cannot be in the future');
    }
  });
  
  test('debe implementar soft delete con legalHold', async () => {
    const user = await createTestUser(User);
    const doctor = await createTestDoctor(Doctor);
    
    const record = await MedicalRecord.create({
      user: user._id,
      createdBy: doctor._id,
      type: 'lab',
      title: 'Lab Results',
      description: 'Complete blood work',
    });
    
    // Soft delete
    const actor = { userId: doctor._id, role: 'Doctor', email: doctor.email, ip: '127.0.0.1' };
    await record.softDelete(actor, 'Patient requested deletion per ARCO');
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Verificar que el documento está marcado como eliminado pero sigue en DB
    const softDeleted = await MedicalRecord.findById(record._id).setOptions({ includeDeleted: true });
    expect(softDeleted).toBeDefined();
    expect(softDeleted.isDeleted).toBe(true);
    expect(softDeleted.deletedAt).toBeDefined();
    expect(softDeleted.retentionExpiresAt).toBeDefined();
    
    // Verificar que no aparece en búsquedas normales
    const normalFind = await MedicalRecord.findById(record._id);
    expect(normalFind).toBeNull();
    
    // Verificar auditoría de borrado
    const deleteLog = await ClinicalAuditLog.findOne({
      'resource.entityId': record._id,
      action: 'DELETE',
    });
    expect(deleteLog).toBeDefined();
    expect(deleteLog.context.reason || deleteLog.actor.email).toBeDefined();
  });
  
  test('debe rechazar borrado permanente (hard delete) en registros clínicos', async () => {
    const user = await createTestUser(User);
    const doctor = await createTestDoctor(Doctor);
    
    const record = await MedicalRecord.create({
      user: user._id,
      createdBy: doctor._id,
      type: 'lab',
      title: 'Lab Results',
      description: 'Complete blood work',
    });
    
    try {
      await MedicalRecord.deleteOne({ _id: record._id });
      expect(true).toBe(false); // Should fail
    } catch (error) {
      expect(error.message).toContain('soft delete');
    }
  });
  
  test('debe permitir hard delete solo con política documentada', async () => {
    const user = await createTestUser(User);
    const doctor = await createTestDoctor(Doctor);
    
    const record = await MedicalRecord.create({
      user: user._id,
      createdBy: doctor._id,
      type: 'lab',
      title: 'Lab Results',
    });
    
    // Hard delete con override explícito (solo para pruebas/admin)
    const result = await MedicalRecord.deleteOne({ _id: record._id }, { hardDelete: true });
    expect(result.deletedCount).toBe(1);
  });
  
  test('debe proteger registros bajo legal hold', async () => {
    const user = await createTestUser(User);
    const doctor = await createTestDoctor(Doctor);
    
    const record = await MedicalRecord.create({
      user: user._id,
      createdBy: doctor._id,
      type: 'lab',
      title: 'Lab Results',
    });
    
    // Aplicar legal hold (por orden judicial)
    record.legalHold = true;
    record.legalHoldReason = 'Court order for ongoing litigation';
    await record.save();
    
    // Intentar soft delete debe fallar
    const actor = { userId: doctor._id, role: 'Doctor' };
    try {
      await record.softDelete(actor, 'Delete attempt');
      expect(true).toBe(false); // Should fail
    } catch (error) {
      expect(error.message).toContain('legal hold');
    }
  });
  
  test('debe crear auditoría de ciclo de vida completo en Treatment Plan', async () => {
    const patient = await createTestUser(User, { name: 'Test Patient' });
    const psychologist = await createTestDoctor(Doctor, { email: 'psycho@test.com' });
    
    const plan = await TreatmentPlan.create({
      patient: patient._id,
      psychologist: psychologist._id,
      currentPhase: 'INTAKE',
      status: 'ACTIVE',
      theoreticalOrientation: 'CBT',
      targetDiagnoses: ['F41.1'],
    });
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Crear log
    const createLog = await ClinicalAuditLog.findOne({
      'resource.entity': 'TreatmentPlan',
      'resource.entityId': plan._id,
      action: 'CREATE',
    });
    expect(createLog).toBeDefined();
    
    // Actualizar fase
    plan.currentPhase = 'ASSESSMENT';
    plan.phaseHistory.push({
      phase: 'ASSESSMENT',
      enteredAt: new Date(),
    });
    await plan.save();
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const updateLog = await ClinicalAuditLog.findOne({
      'resource.entity': 'TreatmentPlan',
      'resource.entityId': plan._id,
      action: 'UPDATE',
    });
    expect(updateLog).toBeDefined();
    expect(updateLog.changes.some(c => c.path === 'currentPhase')).toBe(true);
  });
  
  test('debe validar que Treatment Plan status sea enum válido', async () => {
    const patient = await createTestUser(User);
    const psychologist = await createTestDoctor(Doctor);
    
    try {
      await TreatmentPlan.create({
        patient: patient._id,
        psychologist: psychologist._id,
        currentPhase: 'INTAKE',
        status: 'INVALID_STATUS', // Debe fallar
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain('valid enum value');
    }
  });
  
  test('debe validar que Psychological History tiene fechas coherentes', async () => {
    const patient = await createTestUser(User);
    const psychologist = await createTestDoctor(Doctor);
    
    // Fecha de inicio futura debe fallar
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    
    try {
      await PsychologicalClinicalHistory.create({
        patient: patient._id,
        psychologist: psychologist._id,
        intake: {
          chiefComplaint: 'Symptoms of depression and anxiety',
          onsetDate: futureDate, // Fecha futura - INVÁLIDA
        },
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain('future');
    }
  });
  
  test('debe permitir queries rápidas sin recuperar registros eliminados', async () => {
    const patient = await createTestUser(User);
    const doctor = await createTestDoctor(Doctor);
    
    // Crear varios registros
    const rec1 = await MedicalRecord.create({
      user: patient._id,
      createdBy: doctor._id,
      type: 'consultation',
      title: 'Record 1',
    });
    
    const rec2 = await MedicalRecord.create({
      user: patient._id,
      createdBy: doctor._id,
      type: 'lab',
      title: 'Record 2',
    });
    
    const rec3 = await MedicalRecord.create({
      user: patient._id,
      createdBy: doctor._id,
      type: 'prescription',
      title: 'Record 3',
    });
    
    // Borrar uno
    await rec2.softDelete({ userId: doctor._id, role: 'Doctor' });
    
    // Query normal debe traer solo 2
    const allRecords = await MedicalRecord.find({ user: patient._id }).sort({ date: -1 });
    expect(allRecords).toHaveLength(2);
    expect(allRecords.map(r => r._id.toString())).not.toContain(rec2._id.toString());
    
    // Query con includeDeleted debe traer 3
    const includingDeleted = await MedicalRecord.find({ user: patient._id })
      .setOptions({ includeDeleted: true })
      .sort({ date: -1 });
    expect(includingDeleted).toHaveLength(3);
  });
});
