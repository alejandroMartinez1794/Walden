import { createMeasureSchema } from '../../validators/schemas/clinical.schemas.js';

describe('Clinical Schemas - createMeasureSchema', () => {
  const validMeasure = {
    name: 'PHQ-9',
    responses: Array.from({ length: 9 }, (_, index) => ({
      itemNumber: index + 1,
      response: 1,
    })),
  };

  test('debe aceptar el contrato canónico de Measure', () => {
    const { error, value } = createMeasureSchema.validate(validMeasure);
    expect(error).toBeUndefined();
    expect(value.name).toBe('PHQ-9');
    expect(value.responses).toHaveLength(9);
  });

  test('debe aceptar respuestas numéricas simples', () => {
    const { error } = createMeasureSchema.validate({
      name: 'GAD-7',
      responses: [0, 1, 2, 3],
    });
    expect(error).toBeUndefined();
  });

  test('debe aceptar instrumentos clínicos soportados por Measure', () => {
    for (const name of ['AUDIT', 'PHQ-15', 'WHO-5', 'PC-PTSD-5', 'K10', 'K6']) {
      const { error } = createMeasureSchema.validate({ name, responses: [1, 2, 3] });
      expect(error).toBeUndefined();
    }
  });

  test('debe rechazar respuestas vacías', () => {
    const { error } = createMeasureSchema.validate({
      name: 'PHQ-9',
      responses: [],
    });
    expect(error).toBeDefined();
  });

  test('debe aceptar provenance mediante assessmentId', () => {
    const { error, value } = createMeasureSchema.validate({
      name: 'PHQ-9',
      assessmentId: '507f1f77bcf86cd799439011',
      responses: [0, 1, 2],
    });
    expect(error).toBeUndefined();
    expect(value.assessmentId).toBe('507f1f77bcf86cd799439011');
  });

  test('debe rechazar assessmentId inválido', () => {
    const { error } = createMeasureSchema.validate({
      name: 'PHQ-9',
      assessmentId: 'not-an-object-id',
      responses: [0, 1, 2],
    });
    expect(error).toBeDefined();
  });
});
