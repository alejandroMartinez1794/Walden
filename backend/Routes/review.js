import express from 'express';
import {
    getAllReviews,
    createReview,
}   from "../Controllers/reviewController.js";

import { authenticate, restrict } from "./../auth/verifyToken.js";

// ✅ IMPORTAR VALIDACIÓN
import { validate } from '../validators/middleware/validate.js';
import { 
    createReviewSchema,
    getDoctorReviewsQuerySchema 
} from '../validators/schemas/review.schemas.js';

const router = express.Router({ mergeParams: true });

/**
 * ⭐ RUTAS DE RESEÑAS
 * 
 * Anidadas bajo /api/v1/doctors/:doctorId/reviews
 * 
 * ¿Por qué validar reseñas?
 * - Prevenir spam (reviews sin texto útil)
 * - Rating de 1-5 estrellas (estándar)
 * - Proteger reputación de doctores
 * - Calidad de feedback
 * 
 * Restricciones:
 * - Solo pacientes pueden crear reseñas
 * - Solo después de cita completada (validar en controller)
 * - Una reseña por cita
 */

router
    .route("/")
    /**
     * GET /api/v1/doctors/:doctorId/reviews
     * 
     * Obtener todas las reseñas de un doctor
     * 
     * Filtros opcionales (query params):
     * - rating: Filtrar por calificación (1-5)
     * - minRating: Calificación mínima
     * - sortBy: Ordenar (recent, oldest, highest, lowest)
     * - page, limit: Paginación
     */
    .get(validate(getDoctorReviewsQuerySchema, 'query'), getAllReviews)
    
    /**
     * POST /api/v1/doctors/:doctorId/reviews
     * 
     * Crear nueva reseña
     * 
     * Validación:
     * - doctor: MongoDB ObjectId (de params :doctorId)
     * - rating: 1-5 estrellas (obligatorio)
     * - reviewText: Mínimo 10 caracteres (obligatorio)
     * 
     * Seguridad:
     * - Solo pacientes autenticados
     * - Usuario debe haber tenido cita con el doctor
     * - No múltiples reseñas por cita
     */
    .post(authenticate, restrict(["paciente"]), validate(createReviewSchema), createReview);

export default router;