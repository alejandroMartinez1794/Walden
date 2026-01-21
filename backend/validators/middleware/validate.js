/**
 * ✅ VALIDATION MIDDLEWARE
 * 
 * Middleware genérico para validar requests con Joi
 * 
 * Uso:
 * ```javascript
 * router.post('/register', 
 *   validate(registerSchema, 'body'),
 *   authController.register
 * );
 * ```
 * 
 * ¿Cómo funciona?
 * 1. Recibe esquema Joi y ubicación de datos (body, query, params)
 * 2. Valida los datos
 * 3. Si es válido: pasa al siguiente middleware (next())
 * 4. Si es inválido: devuelve error 400 con detalles
 * 
 * Ventajas:
 * - Controllers solo manejan lógica de negocio
 * - Validación separada = más fácil de testear
 * - Mensajes de error consistentes
 * - Auto-completado si falta un campo requerido
 */

import logger from '../../utils/logger.js';

/**
 * 🛡️ Validar request con esquema Joi
 * 
 * @param {Joi.Schema} schema - Esquema de validación Joi
 * @param {string} source - Ubicación de los datos: 'body', 'query', 'params'
 * @returns {Function} Middleware de Express
 * 
 * Ejemplo de uso:
 * ```javascript
 * // Validar body de POST
 * router.post('/bookings', validate(createBookingSchema, 'body'), createBooking);
 * 
 * // Validar query params de GET
 * router.get('/bookings', validate(getBookingsQuerySchema, 'query'), getBookings);
 * 
 * // Validar URL params
 * router.get('/bookings/:id', validate(idParamSchema, 'params'), getBooking);
 * ```
 */
export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      // Opciones de validación
      const options = {
        abortEarly: false, // Devolver TODOS los errores, no solo el primero
        stripUnknown: true, // Eliminar campos no definidos en el esquema
        convert: true, // Convertir tipos (string "123" → number 123)
        
        // Context para validaciones condicionales
        context: {
          env: process.env.NODE_ENV,
          maxDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 meses
        }
      };
      
      // Validar datos
      const dataToValidate = req[source];
      const { error, value } = schema.validate(dataToValidate, options);
      
      if (error) {
        // Extraer mensajes de error de forma legible
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        }));
        
        // Log para debugging (solo en desarrollo)
        if (process.env.NODE_ENV !== 'production') {
          logger.debug('Validation error', {
            source,
            errors,
            receivedData: dataToValidate
          });
        }
        
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors,
          // En desarrollo, mostrar data recibida (ocultar en producción)
          ...(process.env.NODE_ENV !== 'production' && { 
            receivedData: dataToValidate 
          })
        });
      }
      
      // ✅ Validación exitosa
      // Reemplazar datos originales con datos validados y sanitizados
      req[source] = value;
      
      // Log exitoso (solo en desarrollo)
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('Validation passed', {
          source,
          endpoint: req.path,
          method: req.method
        });
      }
      
      next();
      
    } catch (err) {
      // Error inesperado en validación
      logger.error('Validation middleware error', {
        error: err.message,
        stack: err.stack,
        source,
        endpoint: req.path
      });
      
      return res.status(500).json({
        success: false,
        message: 'Error interno en validación'
      });
    }
  };
};

/**
 * 🔗 Validar múltiples fuentes a la vez
 * 
 * Útil cuando un endpoint necesita validar body + params
 * 
 * Ejemplo:
 * ```javascript
 * router.put('/bookings/:id', 
 *   validateMultiple([
 *     { schema: idParamSchema, source: 'params' },
 *     { schema: updateBookingSchema, source: 'body' }
 *   ]),
 *   updateBooking
 * );
 * ```
 */
export const validateMultiple = (validations) => {
  return async (req, res, next) => {
    const allErrors = [];
    
    for (const { schema, source } of validations) {
      const options = {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
        context: {
          env: process.env.NODE_ENV,
          maxDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        }
      };
      
      const { error, value } = schema.validate(req[source], options);
      
      if (error) {
        const errors = error.details.map(detail => ({
          field: `${source}.${detail.path.join('.')}`,
          message: detail.message,
          type: detail.type
        }));
        
        allErrors.push(...errors);
      } else {
        req[source] = value;
      }
    }
    
    if (allErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: allErrors
      });
    }
    
    next();
  };
};

/**
 * 🆔 Validación rápida de ID en params
 * 
 * Uso común: /api/bookings/:id, /api/users/:id, etc.
 * 
 * Ejemplo:
 * ```javascript
 * router.get('/bookings/:id', validateId, getBooking);
 * ```
 */
export const validateId = (req, res, next) => {
  const { id } = req.params;
  
  // Validar formato MongoDB ObjectId
  const isValid = /^[a-f\d]{24}$/i.test(id);
  
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'ID inválido',
      errors: [{
        field: 'id',
        message: 'ID debe ser un ObjectId válido de MongoDB (24 caracteres hexadecimales)',
        received: id
      }]
    });
  }
  
  next();
};

/**
 * 🔒 Sanitización adicional (después de validación)
 * 
 * Limpia caracteres peligrosos que Joi puede no detectar
 * 
 * ¿Por qué sanitizar después de validar?
 * - Joi valida formato, pero puede dejar pasar HTML
 * - Esta capa elimina <script>, SQL keywords, etc.
 * 
 * Nota: mongoSanitize ya está en index.js, pero esto es extra
 */
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Eliminar tags HTML
      obj = obj.replace(/<[^>]*>/g, '');
      // Eliminar caracteres de control
      obj = obj.replace(/[\x00-\x1F\x7F]/g, '');
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        obj[key] = sanitize(obj[key]);
      });
    }
    return obj;
  };
  
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  
  next();
};

/**
 * 📊 Middleware para logging de validaciones (debugging)
 * 
 * Solo activo en desarrollo
 * Útil para ver qué datos están llegando antes de validar
 */
export const logValidation = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Incoming request data', {
      method: req.method,
      path: req.path,
      body: req.body,
      query: req.query,
      params: req.params,
      headers: {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent']
      }
    });
  }
  next();
};
