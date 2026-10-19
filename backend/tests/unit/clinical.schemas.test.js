import { createMeasureSchema } from '../../validators/schemas/clinical.schemas.js';

const objectId = '507f1f77bcf86cd799439011';

describe('Clinical Schemas - createMeasureSchema', () => {
  test('acepta Measure con provenance de Assessment y TreatmentPlan', () => {
    const { error, value } = createMeasureSchema.validate({
      name: 'PHQ-9',
      assessmentId: objectId,
      treatmentPlanId: objectId,
      responses: [
        { itemNumber: 1, itemText: 'Pregunta 1', response: 0 },
        { itemNumber: 9, itemText: 'Pregunta 9', response: 1 },
      ],
    }, { stripUnknown: true });

    expect(error).toBeUndefined();
    expect(value.assessmentId).toBe(objectId);
    expect(value.treatmentPlanId).toBe(objectId);
  });

  test('acepta measureType como alias temporal', () => {
    const { error } = createMeasureSchema.validate({
      measureType: 'phq9',
      responses: [0, 1, 2],
    });
    expect(error).toBeUndefined();
  });

  test('rechaza Measure sin instrumento', () => {
    const { error } = createMeasureSchema.validate({
      responses: [0, 1, 2],
    });
    expect(error).toBeDefined();
  });

  test('acepta una fecha de toma válida', () => {
    const { error } = createMeasureSchema.validate({
      name: 'GAD-7',
      takenAt: new Date().toISOString(),
      responses: [0, 1, 2],
    });
    expect(error).toBeUndefined();
  });
});
