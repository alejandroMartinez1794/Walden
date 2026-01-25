/**
 * 💳 PAYMENT VALIDATION SCHEMAS
 * 
 * Esquemas de validación para pagos (Wompi)
 * 
 * Seguridad crítica:
 * - Validar montos antes de firmar
 * - Prevenir manipulación de referencias
 * - Verificar integridad de datos
 */

import Joi from 'joi';
import { mongoIdSchema } from './common.schemas.js';

/**
 * Schema para generar firma de pago
 * 
 * Campos:
 * - amount: Monto en pesos colombianos (COP)
 * - bookingId: ID de la cita a pagar
 * 
 * Validación:
 * - Monto positivo y realista
 * - Booking ID válido
 */
export const generatePaymentSignatureSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .min(1000) // Mínimo 1000 COP (~$0.25 USD)
    .max(10000000) // Máximo 10 millones COP (~$2500 USD)
    .precision(2)
    .required()
    .messages({
      'any.required': 'El monto es requerido',
      'number.positive': 'El monto debe ser positivo',
      'number.min': 'El monto mínimo es 1000 COP',
      'number.max': 'El monto máximo es 10,000,000 COP',
      'number.precision': 'El monto solo puede tener 2 decimales'
    }),

  bookingId: mongoIdSchema
    .required()
    .messages({
      'any.required': 'El ID de la cita es requerido'
    }),

  // Campos opcionales para metadata
  currency: Joi.string()
    .valid('COP', 'USD', 'EUR')
    .default('COP')
    .messages({
      'any.only': 'Moneda inválida. Use COP, USD o EUR'
    }),

  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'La descripción no puede exceder 500 caracteres'
    })
});

/**
 * Schema para validar webhook de Wompi (más relajado)
 * 
 * Wompi envía estructura específica, validamos lo básico
 * La validación real es la firma SHA256
 */
export const wompiWebhookSchema = Joi.object({
  event: Joi.string()
    .valid('transaction.updated')
    .required(),

  data: Joi.object({
    transaction: Joi.object({
      id: Joi.string().required(),
      status: Joi.string()
        .valid('APPROVED', 'DECLINED', 'VOIDED', 'ERROR', 'PENDING')
        .required(),
      reference: Joi.string().required(),
      amount_in_cents: Joi.number().integer().positive().required(),
      payment_method_type: Joi.string().optional()
    }).required()
  }).required(),

  signature: Joi.object({
    checksum: Joi.string().length(64).required() // SHA256 = 64 caracteres hex
  }).required(),

  timestamp: Joi.number().integer().positive().required(),

  environment: Joi.string()
    .valid('production', 'test')
    .required()
}).unknown(true); // Permitir campos adicionales de Wompi
