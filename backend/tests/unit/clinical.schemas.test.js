import { createMeasureSchema, createRiskAssessmentSchema } from '../../validators/schemas/clinical.schemas.js';

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


describe('Clinical Schemas - createRiskAssessmentSchema', () => {
  const validRiskAssessment = {
    treatmentPlanId: '507f1f77bcf86cd799439011',
    assessmentType: 'ROUTINE_SCREENING',
    assessmentContext: 'Evaluación formal de riesgo realizada durante seguimiento clínico.',
    columbiaScale: {
      screening: {
        wishToBeDead: { lifetime: false, recent: false },
        suicidalThoughts: { lifetime: false, recent: false },
        thoughtsOfMethod: { lifetime: false, recent: false },
        suicidalIntent: { lifetime: false, recent: false },
        suicidalIntentWithPlan: { lifetime: false, recent: false },
      },
      behavior: {},
    },
    clinicalImpression: {
      overallRiskLevel: 'LOW',
      riskLevelJustification: 'No se identifican indicadores actuales de riesgo elevado.',
    },
    legalDocumentation: {
      dutyToProtectConsidered: true,
      informedConsentObtained: true,
    },
  };

  test('debe aceptar evaluación formal sin ideación reciente', () => {
    const { error } = createRiskAssessmentSchema.validate(validRiskAssessment);
    expect(error).toBeUndefined();
  });

  test('debe exigir intensidad completa cuando existe ideación reciente', () => {
    const { error } = createRiskAssessmentSchema.validate({
      ...validRiskAssessment,
      columbiaScale: {
        ...validRiskAssessment.columbiaScale,
        screening: {
          ...validRiskAssessment.columbiaScale.screening,
          suicidalThoughts: { lifetime: false, recent: true },
        },
      },
    });
    expect(error).toBeDefined();
  });

  test('debe aceptar ideación reciente con las cinco dimensiones completas', () => {
    const { error } = createRiskAssessmentSchema.validate({
      ...validRiskAssessment,
      columbiaScale: {
        ...validRiskAssessment.columbiaScale,
        screening: {
          ...validRiskAssessment.columbiaScale.screening,
          suicidalThoughts: { lifetime: false, recent: true },
        },
        intensityOfIdeation: {
          frequency: 2,
          duration: 1,
          controllability: 2,
          deterrents: 1,
          reasonsForIdeation: 2,
        },
      },
      clinicalImpression: {
        overallRiskLevel: 'MODERATE',
        riskLevelJustification: 'Se requiere seguimiento clínico reforzado por ideación reciente.',
      },
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar nivel de riesgo clínico inválido', () => {
    const { error } = createRiskAssessmentSchema.validate({
      ...validRiskAssessment,
      clinicalImpression: {
        ...validRiskAssessment.clinicalImpression,
        overallRiskLevel: 'CRITICAL',
      },
    });
    expect(error).toBeDefined();
  });
});
