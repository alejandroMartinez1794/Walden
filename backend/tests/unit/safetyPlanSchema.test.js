import mongoose from 'mongoose';
import SafetyPlan from '../../models/SafetyPlanSchema.js';

describe('SafetyPlan mutation safety', () => {
  test('updatePlan allowlists mutable clinical fields', async () => {
    const clinicianId = new mongoose.Types.ObjectId();
    const patientId = new mongoose.Types.ObjectId();
    const treatmentPlanId = new mongoose.Types.ObjectId();

    const plan = new SafetyPlan({
      patientId,
      treatmentPlanId,
      createdBy: clinicianId,
      versionNumber: 3,
      status: 'ACTIVE',
      warningSignals: [{ signal: 'Insomnio' }],
    });

    plan.save = jest.fn().mockResolvedValue(plan);

    await plan.updatePlan({
      warningSignals: [{ signal: 'Nuevo signo' }],
      patientId: new mongoose.Types.ObjectId(),
      treatmentPlanId: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      status: 'ARCHIVED',
      versionNumber: 99,
      previousVersions: [],
      lastUpdatedBy: new mongoose.Types.ObjectId(),
    }, { _id: clinicianId }, 'Clinical review');

    expect(plan.warningSignals).toEqual([{ signal: 'Nuevo signo' }]);
    expect(plan.patientId.toString()).toBe(patientId.toString());
    expect(plan.treatmentPlanId.toString()).toBe(treatmentPlanId.toString());
    expect(plan.createdBy.toString()).toBe(clinicianId.toString());
    expect(plan.status).toBe('ACTIVE');
    expect(plan.versionNumber).toBe(4);
    expect(plan.previousVersions).toHaveLength(1);
    expect(plan.lastUpdatedBy.toString()).toBe(clinicianId.toString());
    expect(plan.save).toHaveBeenCalledTimes(1);
  });
});
