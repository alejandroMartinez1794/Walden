import Joi from 'joi';
import { mongoIdSchema, dateISOSchema, textLongSchema } from './common.schemas.js';

const booleanSchema = Joi.boolean();
const boundedText = (max = 500) => Joi.string().trim().min(1).max(max);
const objectIdOptional = mongoIdSchema.optional();

const yesNoPeriod = Joi.object({
  lifetime: booleanSchema.optional(),
  recent: booleanSchema.optional(),
}).unknown(false);

const columbiaScaleSchema = Joi.object({
  screening: Joi.object({
    wishToBeDead: yesNoPeriod.optional(),
    suicidalThoughts: yesNoPeriod.optional(),
    thoughtsOfMethod: yesNoPeriod.optional(),
    suicidalIntent: yesNoPeriod.optional(),
    suicidalIntentWithPlan: yesNoPeriod.optional(),
  }).optional(),
  intensityOfIdeation: Joi.object({
    frequency: Joi.number().integer().min(1).max(5).optional(),
    duration: Joi.number().integer().min(1).max(5).optional(),
    controllability: Joi.number().integer().min(1).max(5).optional(),
    deterrents: Joi.number().integer().min(1).max(5).optional(),
    reasonsForIdeation: Joi.number().integer().min(1).max(5).optional(),
  }).optional(),
  behavior: Joi.object({
    actualAttempt: Joi.object({
      lifetime: booleanSchema.optional(),
      recent: booleanSchema.optional(),
      numberOfAttempts: Joi.number().integer().min(0).max(1000).optional(),
      mostRecentDate: dateISOSchema.optional(),
      mostRecentMethod: boundedText(500).optional(),
      medicalDamage: Joi.number().min(0).max(5).optional(),
    }).optional(),
    interruptedAttempt: yesNoPeriod.optional(),
    abortedAttempt: yesNoPeriod.optional(),
    preparatoryBehavior: Joi.object({
      lifetime: booleanSchema.optional(),
      recent: booleanSchema.optional(),
      description: boundedText(2000).optional(),
    }).optional(),
  }).optional(),
  suicidalIdeationScore: Joi.number().integer().min(0).max(5).required(),
  intensityScore: Joi.number().min(0).max(25).optional(),
  behaviorScore: Joi.number().min(0).max(5).optional(),
}).required().unknown(false);

const riskFactorsSchema = Joi.object({
  demographic: Joi.object({
    age: Joi.string().valid('YOUTH', 'YOUNG_ADULT', 'MIDDLE_AGE', 'ELDERLY').optional(),
    gender: Joi.string().valid('MALE', 'FEMALE', 'NON_BINARY', 'OTHER').optional(),
  }).optional(),
  clinical: Joi.object({
    priorAttempts: booleanSchema.optional(),
    psychiatricDiagnosis: Joi.array().items(boundedText(100)).max(50).optional(),
    substanceUse: booleanSchema.optional(),
    chronicPain: booleanSchema.optional(),
    insomnia: booleanSchema.optional(),
    recentPsychiatricHospitalization: booleanSchema.optional(),
    commandHallucinations: booleanSchema.optional(),
  }).optional(),
  psychosocial: Joi.object({
    recentLoss: booleanSchema.optional(),
    socialIsolation: booleanSchema.optional(),
    financialStress: booleanSchema.optional(),
    legalProblems: booleanSchema.optional(),
    victimOfAbuse: booleanSchema.optional(),
    homelessness: booleanSchema.optional(),
  }).optional(),
  access: Joi.object({
    accessToLethalMeans: booleanSchema.optional(),
    specificMethod: boundedText(500).optional(),
    meansRestrictionDiscussed: booleanSchema.optional(),
  }).optional(),
  warning: Joi.object({
    recentDischarge: booleanSchema.optional(),
    expressedIntent: booleanSchema.optional(),
    sayingGoodbyes: booleanSchema.optional(),
    givingAwayPossessions: booleanSchema.optional(),
    increasedSubstanceUse: booleanSchema.optional(),
    withdrawalFromSocial: booleanSchema.optional(),
  }).optional(),
}).optional().unknown(false);

const protectiveFactorsSchema = Joi.object({
  internal: Joi.object({
    reasonsForLiving: Joi.array().items(boundedText(300)).max(50).optional(),
    copingSkills: booleanSchema.optional(),
    problemSolvingAbility: booleanSchema.optional(),
    engagedInTreatment: booleanSchema.optional(),
  }).optional(),
  external: Joi.object({
    socialSupport: booleanSchema.optional(),
    supportiveFamily: booleanSchema.optional(),
    religiousCommunity: booleanSchema.optional(),
    employed: booleanSchema.optional(),
    responsibilities: Joi.array().items(boundedText(300)).max(50).optional(),
  }).optional(),
  clinical: Joi.object({
    therapeuticAlliance: Joi.string().valid('STRONG', 'MODERATE', 'WEAK').optional(),
    treatmentAdherence: Joi.string().valid('HIGH', 'MODERATE', 'LOW').optional(),
    previousSuccessfulCoping: booleanSchema.optional(),
  }).optional(),
}).optional().unknown(false);

const interventionPlanSchema = Joi.object({
  immediateActions: Joi.array().items(Joi.object({
    action: boundedText(500).required(),
    completed: booleanSchema.optional(),
    completedAt: dateISOSchema.optional(),
  }).unknown(false)).max(100).optional(),
  safetyPlanReviewed: booleanSchema.optional(),
  safetyPlanUpdated: booleanSchema.optional(),
  meansRestrictionImplemented: booleanSchema.optional(),
  emergencyContactNotified: Joi.object({
    notified: booleanSchema.optional(),
    contactName: boundedText(200).optional(),
    notificationDate: dateISOSchema.optional(),
  }).optional().unknown(false),
  hospitalizationRecommended: Joi.object({
    recommended: booleanSchema.optional(),
    type: Joi.string().valid('VOLUNTARY', 'INVOLUNTARY', 'NOT_RECOMMENDED').optional(),
    justification: boundedText(2000).optional(),
    patientAgreement: Joi.string().valid('AGREED', 'REFUSED', 'AMBIVALENT', 'NOT_DISCUSSED').optional(),
  }).optional().unknown(false),
  increasedMonitoring: Joi.object({
    frequency: Joi.string().valid('DAILY', 'EVERY_OTHER_DAY', 'TWICE_WEEKLY', 'WEEKLY').optional(),
    method: Joi.string().valid('IN_PERSON', 'PHONE', 'VIDEO', 'TEXT_CHECK_IN').optional(),
    duration: boundedText(200).optional(),
  }).optional().unknown(false),
  protocolActivation: Joi.object({
    activated: booleanSchema.optional(),
    protocolType: boundedText(200).optional(),
    protocolLogId: objectIdOptional,
  }).optional().unknown(false),
}).optional().unknown(false);

const legalDocumentationSchema = Joi.object({
  dutyToProtectConsidered: booleanSchema.required(),
  dutyToProtectAction: boundedText(2000).optional(),
  informedConsentObtained: booleanSchema.required(),
  consultationSought: Joi.object({
    consulted: booleanSchema.optional(),
    consultedWith: boundedText(200).optional(),
    consultationDate: dateISOSchema.optional(),
    consultationOutcome: boundedText(2000).optional(),
  }).optional().unknown(false),
  supervisorNotified: Joi.object({
    notified: booleanSchema.optional(),
    supervisorName: boundedText(200).optional(),
    notificationDate: dateISOSchema.optional(),
  }).optional().unknown(false),
}).required().unknown(false);

/**
 * Input contract for a clinician-authored formal risk assessment.
 * This validates documented clinical judgment; it does not infer risk from a screening score.
 */
export const createRiskAssessmentSchema = Joi.object({
  sessionId: objectIdOptional,
  sourceAssessmentId: objectIdOptional,
  sourceMeasureId: objectIdOptional,
  assessmentDate: dateISOSchema.max('now').optional(),
  assessmentType: Joi.string().valid(
    'ROUTINE_SCREENING',
    'INTAKE',
    'CRISIS',
    'PROTOCOL_MANDATED',
    'SYMPTOM_WORSENING',
    'POST_DISCHARGE',
  ).required(),
  assessmentContext: textLongSchema.required(),
  columbiaScale: columbiaScaleSchema,
  riskFactors: riskFactorsSchema,
  protectiveFactors: protectiveFactorsSchema,
  clinicalImpression: Joi.object({
    overallRiskLevel: Joi.string().valid('LOW', 'MODERATE', 'HIGH', 'IMMINENT').required(),
    riskLevelJustification: textLongSchema.required(),
    timeFrame: Joi.string().valid('CHRONIC', 'ACUTE', 'IMMEDIATE').optional(),
    clinicianConcernLevel: Joi.number().min(0).max(10).optional(),
  }).required().unknown(false),
  interventionPlan: interventionPlanSchema,
  followUp: Joi.object({
    nextAssessmentDue: dateISOSchema.required(),
    nextAssessmentReason: boundedText(1000).optional(),
    reminderSent: booleanSchema.optional(),
  }).required().unknown(false),
  legalDocumentation: legalDocumentationSchema,
}).unknown(false);
