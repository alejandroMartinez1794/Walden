import Joi from 'joi';

const riskFactorSchema = Joi.object({
  factor: Joi.string().trim().min(1).max(500).required(),
  severity: Joi.string().valid('LOW', 'MODERATE', 'HIGH').required(),
  mitigationPlan: Joi.string().max(2000).allow('').optional(),
}).unknown(false);

export const updateRiskSnapshotSchema = Joi.object({
  riskLevel: Joi.string().valid('LOW', 'MODERATE', 'HIGH', 'IMMINENT').required(),
  riskFactors: Joi.array().items(riskFactorSchema).max(100).optional(),
  columbiaScore: Joi.number().integer().min(0).max(5).optional(),
  interventionRequired: Joi.boolean().optional(),
}).unknown(false).custom((value, helpers) => {
  if (['HIGH', 'IMMINENT'].includes(value.riskLevel) && value.interventionRequired !== true) {
    return helpers.error('any.custom', { message: 'HIGH or IMMINENT risk requires an explicit intervention flag' });
  }
  return value;
}, 'risk snapshot clinical invariants').messages({
  'any.custom': '{{#message}}',
});
