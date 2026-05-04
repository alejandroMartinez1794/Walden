import Joi from 'joi';
import { mongoIdSchema, paginationSchema, textLongSchema } from './common.schemas.js';

export const createARCORequestSchema = Joi.object({
  subjectUserId: mongoIdSchema.optional(),
  reason: textLongSchema.min(10).max(1000).required(),
  details: textLongSchema.max(2000).optional(),
  requestedFields: Joi.array()
    .items(Joi.string().trim().min(2).max(120))
    .max(50)
    .default([]),
  requestedChanges: Joi.object().unknown(true).default({}),
});

export const listARCORequestsQuerySchema = paginationSchema.keys({
  status: Joi.string().valid('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'FULFILLED', 'PARTIALLY_FULFILLED').optional(),
  requestType: Joi.string().valid('ACCESS', 'RECTIFICATION', 'CANCELLATION', 'OPPOSITION').optional(),
  subjectUserId: mongoIdSchema.optional(),
});

export const reviewARCORequestSchema = Joi.object({
  reviewNotes: textLongSchema.max(2000).optional(),
});