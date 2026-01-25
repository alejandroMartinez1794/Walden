/**
 * 🧪 TESTS UNITARIOS - Health Schemas
 * 
 * Tests para esquemas de métricas de salud
 * 
 * Esquemas testeados:
 * - createHealthMetricSchema
 * - updateHealthMetricSchema
 * - getHealthMetricsQuerySchema
 * - createMedicationSchema
 * - updateMedicationSchema
 * - createActivityLogSchema
 */

import {
  createHealthMetricSchema,
  updateHealthMetricSchema,
  getHealthMetricsQuerySchema
} from '../../validators/schemas/health.schemas.js';

// NOTA: Esquemas no implementados (comentados en tests):
// - createMedicationSchema
// - updateMedicationSchema  
// - createActivityLogSchema

describe('Health Schemas - createHealthMetricSchema', () => {
  const validMetric = {
    type: 'heartRate',
    value: 72,
    unit: 'bpm',
    recordedAt: new Date().toISOString()
  };

  test('debe aceptar métrica válida completa', () => {
    const { error } = createHealthMetricSchema.validate(validMetric);
    expect(error).toBeUndefined();
  });

  test('debe aceptar métrica sin notas', () => {
    const { error } = createHealthMetricSchema.validate({
      type: 'heartRate',
      value: 72,
      unit: 'bpm',
      recordedAt: new Date().toISOString()
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar tipo inválido', () => {
    const { error } = createHealthMetricSchema.validate({
      type: 'invalidType',
      value: 100,
      unit: 'unit'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar valor negativo', () => {
    const { error } = createHealthMetricSchema.validate({
      type: 'weight',
      value: -10,
      unit: 'kg'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar valor muy alto (> 10000)', () => {
    const { error } = createHealthMetricSchema.validate({
      type: 'steps',
      value: 100000,
      unit: 'steps'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar unidad muy larga', () => {
    const { error } = createHealthMetricSchema.validate({
      type: 'weight',
      value: 70,
      unit: 'a'.repeat(51)
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar fecha futura', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    
    const { error } = createHealthMetricSchema.validate({
      type: 'weight',
      value: 70,
      unit: 'kg',
      recordedAt: futureDate.toISOString()
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar notas muy largas', () => {
    const longNotes = 'a'.repeat(501);
    const { error } = createHealthMetricSchema.validate({
      type: 'weight',
      value: 70,
      unit: 'kg',
      notes: longNotes
    });
    expect(error).toBeDefined();
  });
});

describe('Health Schemas - updateHealthMetricSchema', () => {
  test('debe aceptar actualización de valor', () => {
    // TODO: El schema no tiene campo 'value' genérico, usa heartRate, weight, etc.
    const { error } = updateHealthMetricSchema.validate({
      value: 125
    });
    expect(error).toBeUndefined();
  });

  test('debe aceptar actualización de notas', () => {
    // TODO: Verificar si campo 'notes' existe en schema
    const { error } = updateHealthMetricSchema.validate({
      notes: 'Corrección: medición después del ejercicio'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar actualización vacía', () => {
    // TODO: updateHealthMetricSchema hereda de createHealthMetricSchema y todos los campos son opcionales
    const { error } = updateHealthMetricSchema.validate({});
    expect(error).toBeDefined();
    expect(error.message).toContain('al menos un campo');
  });

  test('debe rechazar cambio de tipo', () => {
    // TODO: El schema no tiene campo 'type'
    const { error } = updateHealthMetricSchema.validate({
      type: 'heartRate'
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('tipo no puede');
  });
});

describe('Health Schemas - getHealthMetricsQuerySchema', () => {
  test('debe usar valores por defecto', () => {
    const { value } = getHealthMetricsQuerySchema.validate({});
    expect(value.page).toBe(1);
    expect(value.limit).toBe(20);
  });

  test('debe aceptar filtro por tipo', () => {
    // TODO: getHealthMetricsQuerySchema no tiene campo 'type'
    const { error } = getHealthMetricsQuerySchema.validate({
      type: 'bloodPressure'
    });
    expect(error).toBeUndefined();
  });

  test('debe aceptar filtro por rango de fechas', () => {
    const { error } = getHealthMetricsQuerySchema.validate({
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar dateTo < dateFrom', () => {
    const { error } = getHealthMetricsQuerySchema.validate({
      dateFrom: '2024-12-31',
      dateTo: '2024-01-01'
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('posterior');
  });

  test('debe aceptar ordenamiento por fecha', () => {
    // TODO: getHealthMetricsQuerySchema no tiene campo 'sortBy'
    const { error } = getHealthMetricsQuerySchema.validate({
      sortBy: 'recordedAt',
      sortOrder: 'desc'
    });
    expect(error).toBeUndefined();
  });
});

// TODO: createMedicationSchema no existe - implementar en health.schemas.js
/*
describe('Health Schemas - createMedicationSchema', () => {
  const validMedication = {
    name: 'Paracetamol',
    dosage: '500mg',
    frequency: 'Cada 8 horas',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    prescribedBy: '507f1f77bcf86cd799439011',
    notes: 'Tomar después de las comidas'
  };

  test('debe aceptar medicación válida completa', () => {
    const { error } = createMedicationSchema.validate(validMedication);
    expect(error).toBeUndefined();
  });

  test('debe aceptar medicación sin fecha de fin (tratamiento continuo)', () => {
    const { error } = createMedicationSchema.validate({
      name: 'Losartan',
      dosage: '50mg',
      frequency: 'Una vez al día',
      startDate: new Date().toISOString(),
      prescribedBy: '507f1f77bcf86cd799439011'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar nombre muy corto', () => {
    const { error } = createMedicationSchema.validate({
      name: 'A',
      dosage: '500mg',
      frequency: 'Diario'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar endDate < startDate', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const { error } = createMedicationSchema.validate({
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: 'Cada 8 horas',
      startDate: now.toISOString(),
      endDate: yesterday.toISOString()
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar prescribedBy inválido', () => {
    const { error } = createMedicationSchema.validate({
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: 'Cada 8 horas',
      prescribedBy: 'invalid-id'
    });
    expect(error).toBeDefined();
  });
});
*/

// TODO: updateMedicationSchema no existe - implementar en health.schemas.js
/*
describe('Health Schemas - updateMedicationSchema', () => {
  test('debe aceptar actualización parcial', () => {
    const { error } = updateMedicationSchema.validate({
      dosage: '750mg'
    });
    expect(error).toBeUndefined();
  });

  test('debe aceptar marcar como activa/inactiva', () => {
    const { error } = updateMedicationSchema.validate({
      isActive: false
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar actualización vacía', () => {
    const { error } = updateMedicationSchema.validate({});
    expect(error).toBeDefined();
  });
});
*/

// TODO: createActivityLogSchema no existe - implementar en health.schemas.js
/*
describe('Health Schemas - createActivityLogSchema', () => {
  const validActivity = {
    activityType: 'running',
    duration: 45,
    intensity: 'moderate',
    caloriesBurned: 350,
    distance: 5.2,
    notes: 'Corrida matutina en el parque'
  };

  test('debe aceptar actividad válida completa', () => {
    const { error } = createActivityLogSchema.validate(validActivity);
    expect(error).toBeUndefined();
  });

  test('debe aceptar actividad sin notas', () => {
    const { error } = createActivityLogSchema.validate({
      activityType: 'walking',
      duration: 30,
      intensity: 'low'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar tipo de actividad inválido', () => {
    const { error } = createActivityLogSchema.validate({
      activityType: 'invalid-activity',
      duration: 30,
      intensity: 'moderate'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar duración muy corta (< 1 min)', () => {
    const { error } = createActivityLogSchema.validate({
      activityType: 'walking',
      duration: 0,
      intensity: 'low'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar duración muy larga (> 24 hrs)', () => {
    const { error } = createActivityLogSchema.validate({
      activityType: 'walking',
      duration: 1500,
      intensity: 'low'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar intensidad inválida', () => {
    const { error } = createActivityLogSchema.validate({
      activityType: 'running',
      duration: 30,
      intensity: 'invalid-intensity'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar calorías negativas', () => {
    const { error } = createActivityLogSchema.validate({
      activityType: 'running',
      duration: 30,
      intensity: 'moderate',
      caloriesBurned: -100
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar distancia negativa', () => {
    const { error } = createActivityLogSchema.validate({
      activityType: 'running',
      duration: 30,
      intensity: 'moderate',
      distance: -5
    });
    expect(error).toBeDefined();
  });
});
*/
