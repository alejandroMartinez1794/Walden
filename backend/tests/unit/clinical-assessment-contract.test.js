import { createAssessmentSchema } from '../../validators/schemas/psychology.schemas.js';
import { createMeasureSchema } from '../../validators/schemas/clinical.schemas.js';
import { scorePHQ9 } from '../../utils/clinicalRules.js';

const patientId = '507f1f77bcf86cd799439011';

describe('Clinical assessment/measure contract', () => {
  test('accepts canonical assessment payload used by Clinical Core', () => {
    const { error, value } = createAssessmentSchema.validate({
      patient: patientId,
      testType: 'PHQ-9',
      testDate: new Date().toISOString(),
      responses: Array.from({ length: 9 }, (_, index) => ({
        itemNumber: index + 1,
        response: index === 8 ? 1 : 0,
      })),
      scores: { total: 1 },
      interpretation: { severity: 'minimal' },
    });

    expect(error).toBeUndefined();
    expect(value.scores.total).toBe(1);
    expect(value.responses).toHaveLength(9);
  });

  test('keeps legacy assessment payload valid during migration', () => {
    const { error, value } = createAssessmentSchema.validate({
      patient: patientId,
      testType: 'PHQ-9',
      totalScore: 15,
      interpretation: 'moderate',
      notes: 'Registro histórico conservado durante la migración del contrato.',
    });

    expect(error).toBeUndefined();
    expect(value.totalScore).toBe(15);
  });

  test('accepts the frontend measure payload and normalizes name', () => {
    const { error, value } = createMeasureSchema.validate({
      name: 'PHQ-9',
      responses: [0, 1, 2, 1, 0, 0, 0, 0, 1],
    });

    expect(error).toBeUndefined();
    expect(value.name).toBe('PHQ-9');
  });

  test('normalizes the legacy measureType alias', () => {
    const { error, value } = createMeasureSchema.validate({
      measureType: 'phq9',
      responses: [0, 1, 0, 0, 0, 0, 0, 0, 0],
    });

    expect(error).toBeUndefined();
    expect(value.name).toBe('PHQ-9');
    expect(value.measureType).toBeUndefined();
  });

  test('PHQ-9 scoring respects explicit itemNumber 9', () => {
    const result = scorePHQ9([
      { itemNumber: 1, response: 0 },
      { itemNumber: 9, response: 2 },
      { itemNumber: 2, response: 0 },
    ]);

    expect(result.item9).toBe(2);
    expect(result.total).toBe(2);
  });

  test('rejects an assessment without score or responses', () => {
    const { error } = createAssessmentSchema.validate({
      patient: patientId,
      testType: 'PHQ-9',
    });

    expect(error).toBeDefined();
  });
});
