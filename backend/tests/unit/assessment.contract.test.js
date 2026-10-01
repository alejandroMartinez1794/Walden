import { createAssessmentSchema } from '../../validators/schemas/psychology.schemas.js';

describe('Assessment contract', () => {
  const base = {
    patient: '507f1f77bcf86cd799439011',
    testType: 'PHQ-9',
    testDate: new Date().toISOString(),
    responses: Array.from({ length: 9 }, (_, index) => ({
      itemNumber: index + 1,
      question: `Question ${index + 1}`,
      response: index === 8 ? 1 : 0,
    })),
    scores: { total: 1 },
    interpretation: { severity: 'minimal', notes: 'Screening completed.' },
  };

  test('accepts the canonical frontend payload', () => {
    const { error, value } = createAssessmentSchema.validate(base);
    expect(error).toBeUndefined();
    expect(value.interpretation.severity).toBe('minimal');
    expect(value.interpretation.clinicalNotes).toBe('Screening completed.');
    expect(value.responses[0].itemText).toBe('Question 1');
  });

  test('normalizes Spanish severity to the persisted enum', () => {
    const { error, value } = createAssessmentSchema.validate({
      ...base,
      testType: 'BAI',
      scores: { total: 26 },
      interpretation: { severity: 'Severa' },
      responses: base.responses.map((item, index) => ({
        ...item,
        response: index === 0 ? 26 : 0,
      })),
    });

    expect(error).toBeUndefined();
    expect(value.interpretation.severity).toBe('severe');
  });

  test('rejects a score that disagrees with numeric responses', () => {
    const { error } = createAssessmentSchema.validate({
      ...base,
      scores: { total: 9 },
    });

    expect(error).toBeDefined();
    expect(error.message).toContain('no coincide');
  });

  test('accepts legacy totalScore plus scalar interpretation', () => {
    const { error, value } = createAssessmentSchema.validate({
      patient: base.patient,
      testType: 'PHQ-9',
      totalScore: 1,
      interpretation: 'minimal',
      responses: base.responses,
    });

    expect(error).toBeUndefined();
    expect(value.interpretation).toEqual({ severity: 'minimal' });
  });

  test('accepts assessment types currently emitted by the frontend', () => {
    for (const testType of ['K6', 'K10', 'WHO-5', 'PHQ-15', 'PC-PTSD-5']) {
      const { error } = createAssessmentSchema.validate({
        ...base,
        testType,
      });
      expect(error).toBeUndefined();
    }
  });
});
