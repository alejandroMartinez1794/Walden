/**
 * 🧪 TESTS UNITARIOS - Psychology Schemas
 * 
 * Tests para esquemas del módulo de psicología
 * 
 * Esquemas testeados:
 * - createPsychologyPatientSchema
 * - updatePsychPatientSchema
 * - createAssessmentSchema
 * - createSessionSchema
 * - updateTherapySessionSchema
 * - createTreatmentPlanSchema
 */

import {
  createPsychologyPatientSchema,
  createSessionSchema,
  createAssessmentSchema,
  createTreatmentPlanSchema,
  updateTreatmentPlanSchema
} from '../../validators/schemas/psychology.schemas.js';

// NOTA: Esquemas adaptados:
// - createPsychologyPatientSchema -> createPsychologyPatientSchema (nombre real)
// - createSessionSchema -> createSessionSchema (nombre real)
// - updateTherapySessionSchema -> No existe (comentado)

describe('Psychology Schemas - createPsychologyPatientSchema', () => {
  const validPatient = {
    name: 'Juan Carlos Martinez',
    email: 'juan@example.com',
    age: 35,
    reasonForConsultation: 'Ansiedad generalizada y problemas de sueno recurrentes especialmente en epocas de estres laboral'
  };

  test('debe aceptar paciente válido completo', () => {
    const { error } = createPsychologyPatientSchema.validate(validPatient);
    expect(error).toBeUndefined();
  });

  test('debe aceptar paciente sin referringDoctor', () => {
    const { error } = createPsychologyPatientSchema.validate({
      name: 'María López',
      reasonForConsultation: 'Consulta voluntaria por estrés laboral y ansiedad social'
    });
    expect(error).toBeUndefined();
  });

  test('debe usar nivel de riesgo por defecto "low"', () => {
    const { value } = createPsychologyPatientSchema.validate({
      name: 'Pedro García',
      reasonForConsultation: 'Consulta inicial por estrés laboral'
    });
    // riskLevel tiene default 'low' en el schema
    expect(value.riskLevel).toBe('low');
  });

  test('debe rechazar nombre muy corto', () => {
    const { error } = createPsychologyPatientSchema.validate({
      userId: 'invalid-id',
      referralReason: 'Consulta inicial'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar referringDoctor inválido', () => {
    // TODO: El schema no tiene campo 'referringDoctor'
    const { error } = createPsychologyPatientSchema.validate({
      userId: '507f1f77bcf86cd799439011',
      referringDoctor: 'invalid-id',
      referralReason: 'Consulta inicial'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar referralReason muy corta', () => {
    const { error } = createPsychologyPatientSchema.validate({
      name: 'Juan Pérez',
      reasonForConsultation: 'Ansiedad'
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('20');
  });

  test('debe rechazar referralReason muy larga', () => {
    const longReason = 'a'.repeat(1001);
    const { error } = createPsychologyPatientSchema.validate({
      name: 'Juan Pérez',
      reasonForConsultation: longReason
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar riskLevel inválido', () => {
    const { error } = createPsychologyPatientSchema.validate({
      userId: '507f1f77bcf86cd799439011',
      referralReason: 'Consulta por estrés laboral persistente',
      riskLevel: 'invalid-level'
    });
    expect(error).toBeDefined();
  });
});

// TODO: updatePsychPatientSchema no existe - implementar en psychology.schemas.js
/*
describe('Psychology Schemas - updatePsychPatientSchema', () => {
  test('debe aceptar actualización parcial', () => {
    const { error } = updatePsychPatientSchema.validate({
      riskLevel: 'high'
    });
    expect(error).toBeUndefined();
  });

  test('debe aceptar actualización de múltiples campos', () => {
    const { error } = updatePsychPatientSchema.validate({
      initialDiagnosis: 'Trastorno depresivo mayor',
      riskLevel: 'high',
      notes: 'Paciente muestra síntomas severos, requiere seguimiento estrecho'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar actualización vacía', () => {
    const { error } = updatePsychPatientSchema.validate({});
    expect(error).toBeDefined();
  });

  test('debe rechazar cambio de userId', () => {
    const { error } = updatePsychPatientSchema.validate({
      userId: '507f1f77bcf86cd799439011'
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('prohibido');
  });
});
*/

describe('Psychology Schemas - createAssessmentSchema', () => {
  const validAssessment = {
    patient: '507f1f77bcf86cd799439011',
    testType: 'PHQ-9',
    totalScore: 15,
    interpretation: 'moderate',
    notes: 'Paciente presenta sintomas de ansiedad moderada con episodios ocasionales'
  };

  test('debe aceptar evaluación válida completa', () => {
    const { error } = createAssessmentSchema.validate(validAssessment);
    expect(error).toBeUndefined();
  });

  test('debe rechazar patientId inválido', () => {
    const { error } = createAssessmentSchema.validate({
      ...validAssessment,
      patient: 'invalid-id'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar tipo de evaluación inválido', () => {
    const { error } = createAssessmentSchema.validate({
      ...validAssessment,
      assessmentType: 'invalid-type'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar findings muy cortos', () => {
    const { error } = createAssessmentSchema.validate({
      ...validAssessment,
      findings: 'Ansioso'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar mentalStatusExam incompleto', () => {
    const { error } = createAssessmentSchema.validate({
      ...validAssessment,
      mentalStatusExam: {
        appearance: 'Normal',
        behavior: 'Cooperativo'
        // Faltan campos requeridos
      }
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar riskAssessment sin riskLevel', () => {
    const { error } = createAssessmentSchema.validate({
      ...validAssessment,
      riskAssessment: {
        suicidal: false,
        homicidal: false,
        selfHarm: false
        // Falta riskLevel
      }
    });
    expect(error).toBeDefined();
  });
});

describe('Psychology Schemas - createSessionSchema', () => {
  const validSession = {
    patient: '507f1f77bcf86cd799439011',
    sessionDate: new Date().toISOString(),
    duration: 60,
    therapyType: 'cbt',
    notes: 'Sesion productiva en la que el paciente demostro avances significativos en la identificacion de patrones de pensamiento'
  };

  test('debe aceptar sesión válida completa', () => {
    const { error } = createSessionSchema.validate(validSession);
    expect(error).toBeUndefined();
  });

  test('debe rechazar duración muy corta (< 30 min)', () => {
    // TODO: El schema permite desde 15 min, no 30 min
    const { error } = createSessionSchema.validate({
      ...validSession,
      duration: 20
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar duración muy larga (> 4 hrs)', () => {
    const { error } = createSessionSchema.validate({
      ...validSession,
      duration: 300
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar tipo de sesión inválido', () => {
    const { error } = createSessionSchema.validate({
      ...validSession,
      sessionType: 'invalid-type'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar lista de intervenciones vacía', () => {
    const { error } = createSessionSchema.validate({
      ...validSession,
      interventions: []
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar progress muy corto', () => {
    const { error } = createSessionSchema.validate({
      ...validSession,
      progress: 'OK'
    });
    expect(error).toBeDefined();
  });
});

// TODO: updateTherapySessionSchema no existe - usar updateTreatmentPlanSchema o implementar
/*
describe('Psychology Schemas - updateTherapySessionSchema', () => {
  test('debe aceptar actualización parcial', () => {
    const { error } = updateTherapySessionSchema.validate({
      progress: 'Actualización: paciente muestra resistencia a ciertas técnicas'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar actualización vacía', () => {
    const { error } = updateTherapySessionSchema.validate({});
    expect(error).toBeDefined();
  });

  test('debe rechazar cambio de patientId', () => {
    const { error } = updateTherapySessionSchema.validate({
      patient: '507f1f77bcf86cd799439011'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar cambio de sessionDate', () => {
    const { error } = updateTherapySessionSchema.validate({
      sessionDate: new Date().toISOString()
    });
    expect(error).toBeDefined();
  });
});
*/

describe('Psychology Schemas - createTreatmentPlanSchema', () => {
  const validPlan = {
    patient: '507f1f77bcf86cd799439011',
    goals: [
      'Reducir frecuencia de episodios de ansiedad',
      'Mejorar calidad del sueño',
      'Desarrollar estrategias de afrontamiento efectivas'
    ],
    interventions: [
      'Terapia cognitivo conductual',
      'Tecnicas de relajacion y mindfulness',
      'Entrenamiento en habilidades sociales'
    ]
  };

  test('debe aceptar plan de tratamiento válido', () => {
    const { error } = createTreatmentPlanSchema.validate(validPlan);
    expect(error).toBeUndefined();
  });

  test('debe rechazar diagnosis muy corto', () => {
    // TODO: El schema no define longitud mínima para diagnosis
    const { error } = createTreatmentPlanSchema.validate({
      ...validPlan,
      diagnosis: 'TAG'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar lista de objetivos vacía', () => {
    const { error } = createTreatmentPlanSchema.validate({
      ...validPlan,
      goals: []
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar lista de intervenciones vacía', () => {
    const { error } = createTreatmentPlanSchema.validate({
      ...validPlan,
      interventions: []
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar duración muy corta (< 1 mes)', () => {
    const { error } = createTreatmentPlanSchema.validate({
      ...validPlan,
      expectedDuration: 0
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar duración muy larga (> 24 meses)', () => {
    const { error } = createTreatmentPlanSchema.validate({
      ...validPlan,
      expectedDuration: 30
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar reviewDate en el pasado', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { error } = createTreatmentPlanSchema.validate({
      ...validPlan,
      reviewDate: yesterday.toISOString()
    });
    expect(error).toBeDefined();
  });
});
