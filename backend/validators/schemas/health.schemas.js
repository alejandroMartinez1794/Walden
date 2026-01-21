/**
 * 🏥 HEALTH METRICS VALIDATION SCHEMAS
 * 
 * Esquemas de validación para métricas de salud
 * 
 * ¿Para qué sirven las métricas de salud?
 * - Seguimiento de signos vitales (presión, ritmo cardíaco)
 * - Monitoreo de actividad física (pasos, ejercicio)
 * - Control de peso y nutrición (calorías, agua)
 * - Historial médico para doctores
 * 
 * Consideraciones:
 * - Valores dentro de rangos médicos realistas
 * - Prevenir datos falsos o peligrosos
 * - Alertas automáticas para valores críticos
 * - Privacidad (datos sensibles HIPAA)
 */

import Joi from 'joi';
import { mongoIdSchema, dateISOSchema } from './common.schemas.js';

/**
 * Schema para crear métrica de salud
 * 
 * Todos los campos son opcionales excepto date
 * (usuarios pueden registrar solo algunos valores)
 * 
 * ¿Por qué todos opcionales?
 * - Usuario puede registrar solo presión arterial
 * - O solo peso
 * - O solo pasos del día
 * - Más flexible = mejor adopción
 */
export const createHealthMetricSchema = Joi.object({
  /**
   * Fecha de la medición
   * 
   * Por defecto: Ahora
   * Permite: Registrar mediciones históricas
   * 
   * Límite: No futuro (no puedes medir presión del futuro)
   */
  date: dateISOSchema
    .max('now')
    .default(() => new Date())
    .messages({
      'date.max': 'No se pueden registrar mediciones futuras'
    }),

  /**
   * Presión arterial (sistólica/diastólica)
   * 
   * Rangos normales:
   * - Sistólica: 90-180 mmHg (más bajo = hipotensión, más alto = emergencia)
   * - Diastólica: 60-120 mmHg
   * 
   * Validación:
   * - Ambos deben proporcionarse juntos
   * - Sistólica siempre > diastólica (física básica)
   * 
   * Alertas automáticas (TODO):
   * - < 90/60: Hipotensión (revisar con doctor)
   * - > 140/90: Hipertensión (consulta necesaria)
   * - > 180/120: Crisis hipertensiva (emergencia)
   */
  bloodPressure: Joi.object({
    systolic: Joi.number()
      .integer()
      .min(50)
      .max(250)
      .required()
      .messages({
        'any.required': 'La presión sistólica es obligatoria si registra presión arterial',
        'number.min': 'La presión sistólica mínima es 50 mmHg',
        'number.max': 'La presión sistólica máxima es 250 mmHg'
      }),

    diastolic: Joi.number()
      .integer()
      .min(30)
      .max(150)
      .less(Joi.ref('systolic'))
      .required()
      .messages({
        'any.required': 'La presión diastólica es obligatoria si registra presión arterial',
        'number.min': 'La presión diastólica mínima es 30 mmHg',
        'number.max': 'La presión diastólica máxima es 150 mmHg',
        'number.less': 'La presión diastólica debe ser menor que la sistólica'
      })
  }).optional(),

  /**
   * Ritmo cardíaco (latidos por minuto)
   * 
   * Rangos:
   * - Reposo normal: 60-100 bpm
   * - Atletas: 40-60 bpm (bradicardia atlética)
   * - Taquicardia: > 100 bpm
   * 
   * Límites validación:
   * - Mínimo: 30 bpm (bradicardia severa)
   * - Máximo: 220 bpm (máximo teórico durante ejercicio)
   */
  heartRate: Joi.number()
    .integer()
    .min(30)
    .max(220)
    .messages({
      'number.min': 'El ritmo cardíaco mínimo es 30 bpm',
      'number.max': 'El ritmo cardíaco máximo es 220 bpm'
    }),

  /**
   * Temperatura corporal (Celsius)
   * 
   * Rangos:
   * - Normal: 36.1-37.2°C
   * - Hipotermia: < 35°C
   * - Fiebre: > 38°C
   * - Fiebre alta: > 39.5°C
   * 
   * Límites validación:
   * - Mínimo: 35°C (hipotermia)
   * - Máximo: 42°C (hipertermia crítica)
   */
  temperature: Joi.number()
    .precision(1) // 36.5°C (un decimal)
    .min(35)
    .max(42)
    .messages({
      'number.min': 'La temperatura mínima es 35°C',
      'number.max': 'La temperatura máxima es 42°C',
      'number.precision': 'La temperatura solo puede tener 1 decimal'
    }),

  /**
   * Peso (kilogramos)
   * 
   * Límites:
   * - Mínimo: 30 kg (niños pequeños)
   * - Máximo: 300 kg (casos extremos)
   * 
   * Precisión: 1 decimal (70.5 kg)
   */
  weight: Joi.number()
    .precision(1)
    .min(30)
    .max(300)
    .messages({
      'number.min': 'El peso mínimo es 30 kg',
      'number.max': 'El peso máximo es 300 kg',
      'number.precision': 'El peso solo puede tener 1 decimal'
    }),

  /**
   * IMC (Índice de Masa Corporal)
   * 
   * Normalmente se calcula: peso / altura²
   * Pero permitimos registro manual
   * 
   * Rangos:
   * - < 18.5: Bajo peso
   * - 18.5-24.9: Normal
   * - 25-29.9: Sobrepeso
   * - 30+: Obesidad
   * 
   * Límites: 10-60 (realista para humanos)
   */
  bmi: Joi.number()
    .precision(1)
    .min(10)
    .max(60)
    .messages({
      'number.min': 'El IMC mínimo es 10',
      'number.max': 'El IMC máximo es 60',
      'number.precision': 'El IMC solo puede tener 1 decimal'
    }),

  /**
   * Glucosa (mg/dL)
   * 
   * Rangos:
   * - Normal (ayuno): 70-100 mg/dL
   * - Pre-diabetes: 100-125 mg/dL
   * - Diabetes: > 126 mg/dL
   * 
   * Límites validación:
   * - Mínimo: 40 mg/dL (hipoglucemia)
   * - Máximo: 600 mg/dL (cetoacidosis diabética)
   */
  glucose: Joi.number()
    .integer()
    .min(40)
    .max(600)
    .messages({
      'number.min': 'La glucosa mínima es 40 mg/dL',
      'number.max': 'La glucosa máxima es 600 mg/dL'
    }),

  /**
   * Saturación de oxígeno (%)
   * 
   * Rangos:
   * - Normal: 95-100%
   * - Hipoxia leve: 90-94%
   * - Hipoxia severa: < 90%
   * 
   * Límites: 70-100% (menos de 70 es emergencia médica)
   */
  oxygen: Joi.number()
    .integer()
    .min(70)
    .max(100)
    .messages({
      'number.min': 'La saturación de oxígeno mínima es 70%',
      'number.max': 'La saturación de oxígeno máxima es 100%'
    }),

  /**
   * Pasos diarios
   * 
   * Recomendación OMS: 10,000 pasos/día
   * 
   * Límites:
   * - Mínimo: 0 (día sedentario)
   * - Máximo: 50,000 (maratón = ~50k pasos)
   */
  steps: Joi.number()
    .integer()
    .min(0)
    .max(50000)
    .messages({
      'number.min': 'Los pasos no pueden ser negativos',
      'number.max': 'Los pasos máximos son 50,000'
    }),

  /**
   * Agua consumida (litros)
   * 
   * Recomendación: 2-3 litros/día
   * 
   * Límites:
   * - Mínimo: 0
   * - Máximo: 10 litros (más es peligroso = hiponatremia)
   */
  water: Joi.number()
    .precision(1) // 2.5 litros
    .min(0)
    .max(10)
    .messages({
      'number.min': 'El agua no puede ser negativa',
      'number.max': 'El agua máxima es 10 litros',
      'number.precision': 'El agua solo puede tener 1 decimal'
    }),

  /**
   * Horas de sueño
   * 
   * Recomendación: 7-9 horas/noche
   * 
   * Límites:
   * - Mínimo: 0 (insomnio total)
   * - Máximo: 16 (hipersomnia)
   */
  sleep: Joi.number()
    .precision(1) // 7.5 horas
    .min(0)
    .max(16)
    .messages({
      'number.min': 'Las horas de sueño no pueden ser negativas',
      'number.max': 'Las horas de sueño máximas son 16',
      'number.precision': 'Las horas de sueño solo pueden tener 1 decimal'
    }),

  /**
   * Calorías consumidas
   * 
   * Promedio: 2000-2500 kcal/día
   * 
   * Límites:
   * - Mínimo: 0 (ayuno)
   * - Máximo: 10,000 (atracón)
   */
  calories: Joi.number()
    .integer()
    .min(0)
    .max(10000)
    .messages({
      'number.min': 'Las calorías no pueden ser negativas',
      'number.max': 'Las calorías máximas son 10,000'
    }),

  /**
   * Minutos de ejercicio
   * 
   * Recomendación OMS: 150 min/semana (30 min/día)
   * 
   * Límites:
   * - Mínimo: 0 (sedentario)
   * - Máximo: 300 (5 horas = ejercicio extremo)
   */
  exercise: Joi.number()
    .integer()
    .min(0)
    .max(300)
    .messages({
      'number.min': 'Los minutos de ejercicio no pueden ser negativos',
      'number.max': 'Los minutos de ejercicio máximos son 300'
    })
}).min(2) // Al menos fecha + 1 métrica
  .messages({
    'object.min': 'Debe proporcionar al menos una métrica de salud'
  });

/**
 * Schema para actualizar métrica de salud
 * 
 * Igual que crear pero todos opcionales
 * No se puede cambiar la fecha (usar delete + create)
 */
export const updateHealthMetricSchema = createHealthMetricSchema
  .fork(['date'], (schema) => schema.optional())
  .min(1)
  .messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar'
  });

/**
 * Schema para obtener métricas de salud (filtros)
 * 
 * Filtros:
 * - dateFrom, dateTo: Rango de fechas
 * - metricType: Tipo específico de métrica
 * - page, limit: Paginación
 */
export const getHealthMetricsQuerySchema = Joi.object({
  // Rango de fechas
  dateFrom: dateISOSchema
    .messages({
      'date.format': 'dateFrom debe ser formato ISO 8601'
    }),

  dateTo: dateISOSchema
    .when('dateFrom', {
      is: Joi.exist(),
      then: Joi.date().greater(Joi.ref('dateFrom'))
    })
    .messages({
      'date.format': 'dateTo debe ser formato ISO 8601',
      'date.greater': 'dateTo debe ser posterior a dateFrom'
    }),

  // Filtro por tipo de métrica
  metricType: Joi.string()
    .valid(
      'bloodPressure',
      'heartRate',
      'temperature',
      'weight',
      'bmi',
      'glucose',
      'oxygen',
      'steps',
      'water',
      'sleep',
      'calories',
      'exercise'
    )
    .messages({
      'any.only': 'Tipo de métrica inválido'
    }),

  // Paginación
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

/**
 * Schema para eliminar métrica
 */
export const deleteHealthMetricSchema = Joi.object({
  id: mongoIdSchema.required()
    .messages({
      'any.required': 'El ID de la métrica es obligatorio'
    })
});
