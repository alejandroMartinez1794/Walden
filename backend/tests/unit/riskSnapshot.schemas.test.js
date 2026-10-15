import { updateRiskSnapshotSchema } from '../../validators/schemas/riskSnapshot.schemas.js';

describe('updateRiskSnapshotSchema', () => {
  test.each(['LOW', 'MODERATE'])('accepts %s risk without forcing a high-risk intervention flag', (riskLevel) => {
    expect(updateRiskSnapshotSchema.validate({ riskLevel }).error).toBeUndefined();
  });

  test.each(['HIGH', 'IMMINENT'])('requires an explicit intervention flag for %s risk', (riskLevel) => {
    expect(updateRiskSnapshotSchema.validate({ riskLevel }).error).toBeDefined();
    expect(updateRiskSnapshotSchema.validate({ riskLevel, interventionRequired: true }).error).toBeUndefined();
  });

  test('rejects unknown risk levels and invalid Columbia score ranges', () => {
    expect(updateRiskSnapshotSchema.validate({ riskLevel: 'SEVERE' }).error).toBeDefined();
    expect(updateRiskSnapshotSchema.validate({ riskLevel: 'LOW', columbiaScore: 6 }).error).toBeDefined();
    expect(updateRiskSnapshotSchema.validate({ riskLevel: 'LOW', columbiaScore: -1 }).error).toBeDefined();
  });

  test('rejects malformed, duplicate-shape, or oversized risk factor payloads', () => {
    expect(updateRiskSnapshotSchema.validate({
      riskLevel: 'LOW',
      riskFactors: [{ factor: '', severity: 'HIGH' }],
    }).error).toBeDefined();
    expect(updateRiskSnapshotSchema.validate({
      riskLevel: 'LOW',
      riskFactors: [{ factor: 'Isolation', severity: 'CRITICAL' }],
    }).error).toBeDefined();
    expect(updateRiskSnapshotSchema.validate({
      riskLevel: 'LOW',
      riskFactors: [{ factor: 'Isolation', severity: 'HIGH', unexpected: true }],
    }).error).toBeDefined();
  });

  test('rejects non-boolean intervention flags and unknown top-level fields', () => {
    expect(updateRiskSnapshotSchema.validate({
      riskLevel: 'LOW',
      interventionRequired: 'yes',
    }).error).toBeDefined();
    expect(updateRiskSnapshotSchema.validate({ riskLevel: 'LOW', patientId: 'client-controlled' }).error).toBeDefined();
  });
});
