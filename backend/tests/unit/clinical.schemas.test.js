import { createMeasureSchema } from '../../validators/schemas/clinical.schemas.js';

describe('Clinical Schemas - createMeasureSchema', () => {
  const validMeasure = {
    name: 'PHQ-9',
    responses: [
      { itemNumber: 1, response: 2 },
      { itemNumber: 2, response: 1 },
      { itemNumber: 3, response: 0 },
    ],
    assessmentId: '507f1f77bcf86cd799439011',
    therapySessionId: '507f1f77bcf86cd799439012',
    treatmentPlanId: '507f1f77bcf86cd799439013',
  };

  test('acepta el contrato canónico de Measure con provenance', () => {
    const { error, value } = createMeasureSchema.validate(validMeasure);
    expect(error).toBeUndefined();
    expect(value.name).toBe('PHQ-9');
    expect(value.responses).toHaveLength(3);
    expect(value.assessmentId).toBeDefined();
  });

  test('mantiene compatibilidad con measureType durante la migración', () => {
    const { error, value } = createMeasureSchema.validate({
      measureType: 'phq9',
      responses: [0, 1, 2],
    });

    expect(error).toBeUndefined();
    expect(value.measureType).toBe('phq9');
  });

  test('rechaza una medición sin instrumento', () => {
    const { error } = createMeasureSchema.validate({
      responses: [0, 1, 2],
    });

    expect(error).toBeDefined();
  });

  test('rechaza una medición sin respuestas', () => {
    const { error } = createMeasureSchema.validate({
      name: 'PHQ-9',
      responses: [],
    });

    expect(error).toBeDefined();
  });

  test('acepta provenance parcial durante la migración histórica', () => {
    const { error } = createMeasureSchema.validate({
      name: 'GAD-7',
      responses: [{ itemNumber: 1, response: 2 }],
      assessmentId: '507f1f77bcf86cd799439011',
    });

    expect(error).toBeUndefined();
  });
});
