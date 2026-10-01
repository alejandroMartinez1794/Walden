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

  test('debe rechazar un instrumento no soportado por Measure', () => {
    const { error } = createMeasureSchema.validate({
      name: 'AUDIT',
      responses: [1, 2, 3],
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar respuestas vacías', () => {
    const { error } = createMeasureSchema.validate({
      name: 'PHQ-9',
      responses: [],
    });
    expect(error).toBeDefined();
  });
});
