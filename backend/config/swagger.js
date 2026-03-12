/**
 * Swagger/OpenAPI Documentation Configuration
 * 
 * Access documentation at: http://localhost:8000/api-docs
 * Production: https://api.basileias.app/api-docs
 * 
 * Benefits:
 * - Interactive API testing
 * - Auto-generated client SDKs
 * - Clear endpoint documentation
 * - Request/response examples
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import logger from '../utils/logger.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'basileias API Documentation',
      version: '1.0.0',
      description: `
        **basileias** - Plataforma de Telemedicina y Psicología en Colombia
        
        API RESTful para gestión de citas médicas, historias clínicas, y servicios de psicología.
        
        ### Características:
        - 🔐 Autenticación JWT con 2FA
        - 📅 Integración con Google Calendar
        - 💳 Pagos con Wompi (Colombia)
        - 🇨🇴 Cumplimiento Ley 1581/2012 y Resolución 2654/2019
        - 🔒 Encriptación AES-256 para datos sensibles
        - 📊 Monitoreo con New Relic y Sentry
        
        ### Compliance Colombia:
        - Habeas Data (Ley 1581/2012)
        - Telemedicina (Resolución 2654/2019)
        - Historias clínicas electrónicas (Resolución 1995/1999)
      `,
      contact: {
        name: 'basileias Support',
        email: 'soporte@basileias.app',
        url: 'https://basileias.app',
      },
      license: {
        name: 'Proprietary',
      },
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
      {
        url: 'https://api.basileias.app',
        description: 'Production server (Heroku)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtenido del endpoint /api/v1/auth/login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'Juan Pérez',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'juan@example.com',
            },
            phone: {
              type: 'string',
              example: '+573001234567',
            },
            role: {
              type: 'string',
              enum: ['paciente', 'doctor', 'admin'],
              example: 'paciente',
            },
            photo: {
              type: 'string',
              format: 'uri',
              example: 'https://cloudinary.com/photo.jpg',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              example: 'male',
            },
            bloodType: {
              type: 'string',
              enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
              example: 'O+',
            },
          },
        },
        Doctor: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            phone: {
              type: 'string',
            },
            specialization: {
              type: 'string',
              example: 'Psicología Clínica',
            },
            ticketPrice: {
              type: 'number',
              example: 150000,
              description: 'Precio en COP',
            },
            bio: {
              type: 'string',
            },
            averageRating: {
              type: 'number',
              example: 4.5,
            },
            totalRating: {
              type: 'number',
              example: 50,
            },
            isApproved: {
              type: 'string',
              enum: ['pending', 'approved', 'cancelled'],
              example: 'approved',
            },
            appointments: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Booking',
              },
            },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            doctor: {
              type: 'string',
              description: 'Doctor ID',
            },
            user: {
              type: 'string',
              description: 'Patient ID',
            },
            appointmentDate: {
              type: 'string',
              format: 'date-time',
              example: '2026-02-15T10:00:00.000Z',
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'cancelled'],
              example: 'approved',
            },
            ticketPrice: {
              type: 'number',
              example: 150000,
            },
            isPaid: {
              type: 'boolean',
              example: false,
            },
            calendarEventId: {
              type: 'string',
              description: 'Google Calendar Event ID',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Not authorized, token failed',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Validation error: email is required',
              },
            },
          },
        },
        RateLimitError: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Too many requests. Please try again later.',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User registration, login, and password management',
      },
      {
        name: 'Users',
        description: 'Patient profile management',
      },
      {
        name: 'Doctors',
        description: 'Doctor profiles and availability',
      },
      {
        name: 'Bookings',
        description: 'Appointment booking and management',
      },
      {
        name: 'Reviews',
        description: 'Doctor reviews and ratings',
      },
      {
        name: 'Calendar',
        description: 'Google Calendar integration',
      },
      {
        name: 'Psychology',
        description: 'Psychology-specific features',
      },
      {
        name: 'Health',
        description: 'Patient health metrics',
      },
      {
        name: 'Payments',
        description: 'Payment processing with Wompi',
      },
    ],
  },
  apis: [
    './Routes/*.js',
    './Controllers/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Setup Swagger UI
 * @param {import('express').Application} app - Express app
 */
export function setupSwagger(app) {
  // Swagger UI options
  const swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'basileias API Docs',
    customfavIcon: '/favicon.ico',
  };

  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // Serve Swagger JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  logger.info('📚 Swagger docs available at /api-docs');
}

export default swaggerSpec;

/**
 * HOW TO DOCUMENT ENDPOINTS:
 * 
 * Add JSDoc comments above controller functions or route definitions:
 * 
 * @example
 * /**
 *  * @swagger
 *  * /api/v1/auth/login:
 *  *   post:
 *  *     summary: Login user
 *  *     tags: [Authentication]
 *  *     requestBody:
 *  *       required: true
 *  *       content:
 *  *         application/json:
 *  *           schema:
 *  *             type: object
 *  *             required:
 *  *               - email
 *  *               - password
 *  *             properties:
 *  *               email:
 *  *                 type: string
 *  *                 format: email
 *  *               password:
 *  *                 type: string
 *  *                 format: password
 *  *     responses:
 *  *       200:
 *  *         description: Login successful
 *  *         content:
 *  *           application/json:
 *  *             schema:
 *  *               type: object
 *  *               properties:
 *  *                 success:
 *  *                   type: boolean
 *  *                 message:
 *  *                   type: string
 *  *                 token:
 *  *                   type: string
 *  *                 data:
 *  *                   $ref: '#/components/schemas/User'
 *  *       401:
 *  *         $ref: '#/components/responses/UnauthorizedError'
 *  *       429:
 *  *         $ref: '#/components/responses/RateLimitError'
 *  * /
 * export const login = async (req, res) => { ... };
 */
