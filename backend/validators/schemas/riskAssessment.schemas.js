import Joi from 'joi';
import { mongoIdSchema, textLongSchema, textShortSchema } from './common.schemas.js';

const boolPair = Joi.object({
  lifetime: Joi.boolean().default(false),
  recent: Joi.boolean().default(false),
});

const columbiaScaleSchema = Joi.object({
  screening: Joi.object({
    wishToBeDead: Joi.object({ lifetime: Joi.boolean(), recent: Joi.boolean() }),
    suicidalThoughts: Joi.object({ lifetime: Joi.boolean(), recent: Joi.boolean() }),
    thoughtsOfMethod: Joi.object({ lifetime: Joi.boolean(), recent: Joi.boolean() }),
    suicidalIntent: Joi.object({ lifetime: Joi.boolean(), recent: Joi.boolean() }),
    suicidalIntentWithPlan: Joi.object({ lifetime: Joi.boolean(), recent: Joi.boolean() }),
  }),
  intensityOfIdeation: Joi.object({
    frequency: Joi.number().integer().min(1).max(5),
    duration: Joi.number().integer().min(1).max(5),
    controllability: Joi.number().integer().min(1).max(5),
    deterrents: Joi.number().integer().min(1).max(5),
    reasonsForIdeation: Joi.number().integer().min(1).max(5),
  }),
  behavior: Joi.object({
    actualAttempt: Joi.object({
      lifetime: Joi.boolean(),
      recent: Joi.boolean(),
      numberOfAttempts: Joi.number().integer().min(0),
      mostRecentDate: Joi.date().max('now'),
      mostRecentMethod: textShortSchema.max(500),
      medicalDamage: Joi.number().integer().min(0).max(5),
    }),
    interruptedAttempt: boolPair,
    abortedAttempt: boolPair,
    preparatoryBehavior: Joi.object({
      lifetime: Joi.boolean(),
      recent: Joi.boolean(),
      description: textLongSchema.max(2000),
    }),
  }),
  suicidalIdeationScore: Joi.number().integer().min(0).max(5).required(),
  intensityScore: Joi.number().integer().min(0).max(25).required(),
  behaviorScore: Joi.number().integer().min(0).max(5).required(),
}).required();

export const createRiskAssessmentSchema = Joi.object({
  sessionId: mongoIdSchema,
  sourceAssessmentId: mongoIdSchema,
  sourceMeasureId: mongoIdSchema,

  assessmentDate: Joi.date().max('now').default(() => new Date()),
  assessmentType: Joi.string().valid(
    'ROUTINE_SCREENING',
    'INTAKE',
    'CRISIS',
    'PROTOCOL_MANDATED',
    'SYMPTOM_WORSENING',
    'POST_DISCHARGE'
  ).required(),
  assessmentContext: textLongSchema.min(10).max(4000).required(),

  columbiaScale: columbiaScaleSchema,

  riskFactors: Joi.object().unknown(true),
  protectiveFactors: Joi.object().unknown(true),

  clinicalImpression: Joi.object({
    overallRiskLevel: Joi.string().valid('LOW', 'MODERATE', 'HIGH', 'IMMINENT').required(),
    riskLevelJustification: textLongSchema.min(20).max(4000).required(),
    timeFrame: Joi.string().valid('CHRONIC', 'ACUTE', 'IMMEDIATE').required(),
    clinicianConcernLevel: Joi.number().integer().min(0).max(10),
  }).required(),

  interventionPlan: Joi.object().unknown(true),
  legalDocumentation: Joi.object({
    dutyToProtectConsidered: Joi.boolean().required(),
    dutyToProtectAction: textLongSchema.max(2000),
    informedConsentObtained: Joi.boolean().required(),
    consultationSought: Joi.object().unknown(true),
    supervisorNotified: Joi.object().unknown(true),
  }).required(),

  signature: Joi.object({
    licenseNumber: textShortSchema.max(100).required(),
  }).required(),
}).required();
