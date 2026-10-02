import { createAssessmentSchema } from '../../validators/schemas/psychology.schemas.js';

describe('Psychology Schemas - createAssessmentSchema', () => {
  const validAssessment = {
    patient: '507f1f77bcf86cd799439011',
    testType: 'PHQ-9',
    testDate: '2026-09-30',
    responses: Array.from({ length: 9 }, (_, index) => ({
      itemNumber: index + 1,
      question: `Pregunta ${index + 1}`,
      response: 0,
    })),
    scores: { total: 0 },
    interpretation: {
      severity: 'minimal',
      notes: 'Evaluación de tamizaje registrada desde el formulario clínico.',
    },
  };

  test('acepta el contrato que realmente envían los formularios clínicos', () => {
    const { error, value } = createAssessmentSchema.validate(validAssessment);
    expect(error).toBeUndefined();
    expect(value.responses).toHaveLength(9);
    expect(value.scores.total).toBe(0);
    expect(value.interpretation.notes).toBeDefined();
  });

  test('permite instrumentos con categorías de severidad específicas del instrumento', () => {
    const { error } = createAssessmentSchema.validate({
      ...validAssessment,
      testType: 'AUDIT',
      responses: Array.from({ length: 10 }, (_, index) => ({
        itemNumber: index + 1,
        question: `Pregunta ${index + 1}`,
        response: 'Nunca',
        score: 0,
      })),
      scores: { total: 0 },
      interpretation: {
        severity: 'Consumo de bajo riesgo',
      },
    });

    expect(error).toBeUndefined();
  });

  test('acepta los instrumentos que existen en el frontend pero faltaban en el contrato del backend', () => {
    for (const testType of ['K6', 'K10', 'WHO-5', 'PHQ-15', 'PC-PTSD-5']) {
      const { error } = createAssessmentSchema.validate({
        ...validAssessment,
        testType,
      });
      expect(error).toBeUndefined();
    }
  });

  test('requiere al menos una respuesta y su identificador de ítem', () => {
    const missingResponses = createAssessmentSchema.validate({
      ...validAssessment,
      responses: [],
    });
    expect(missingResponses.error).toBeDefined();

    const missingItemNumber = createAssessmentSchema.validate({
      ...validAssessment,
      responses: [{ question: 'Pregunta', response: 1 }],
    });
    expect(missingItemNumber.error).toBeDefined();
  });

  test('no usa el contrato legado plano totalScore/interpretation como fuente de validación', () => {
    const legacyPayload = {
      patient: validAssessment.patient,
      testType: validAssessment.testType,
      totalScore: 10,
      interpretation: 'moderate',
    };

    const { error } = createAssessmentSchema.validate(legacyPayload);
    expect(error).toBeDefined();
  });

  test('elimina campos no permitidos del request', () => {
    const { error, value } = createAssessmentSchema.validate({
      ...validAssessment,
      psychologist: '507f1f77bcf86cd799439012',
      riskLevel: 'critical',
    });

    expect(error).toBeUndefined();
    expect(value.psychologist).toBeUndefined();
    expect(value.riskLevel).toBeUndefined();
  });
});
