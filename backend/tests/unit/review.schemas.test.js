/**
 * 🧪 TESTS UNITARIOS - Review Schemas
 * 
 * Tests para esquemas de sistema de reseñas/valoraciones
 * 
 * Esquemas testeados:
 * - createReviewSchema
 * - updateReviewSchema
 * - getDoctorReviewsQuerySchema
 */

import {
  createReviewSchema,
  updateReviewSchema,
  getDoctorReviewsQuerySchema
} from '../../validators/schemas/review.schemas.js';

describe('Review Schemas - createReviewSchema', () => {
  const validReview = {
    doctor: '507f1f77bcf86cd799439011',
    rating: 5,
    reviewText: 'Excelente profesional, muy atento y empático. Recomendado al 100%.'
  };

  test('debe aceptar reseña válida completa', () => {
    const { error } = createReviewSchema.validate(validReview);
    expect(error).toBeUndefined();
  });

  // NOTA: reviewText es obligatorio según el schema (min 10 chars)
  test('debe rechazar reseña sin texto (solo rating)', () => {
    const { error } = createReviewSchema.validate({
      doctor: '507f1f77bcf86cd799439011',
      rating: 4
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('obligatorio');
  });

  test('debe permitir reseña sin doctor (viene de params)', () => {
    const { error } = createReviewSchema.validate({
      rating: 5,
      reviewText: 'Muy buen doctor'
    });
    expect(error).toBeUndefined(); // Doctor es opcional porque viene de req.params
  });

  test('debe rechazar doctorId inválido', () => {
    const { error } = createReviewSchema.validate({
      doctor: 'invalid-id',
      rating: 5
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar reseña sin rating', () => {
    const { error } = createReviewSchema.validate({
      doctor: '507f1f77bcf86cd799439011',
      reviewText: 'Buen doctor'
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('obligatoria');
  });

  test('debe rechazar rating < 1', () => {
    const { error } = createReviewSchema.validate({
      doctor: '507f1f77bcf86cd799439011',
      rating: 0
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('1');
  });

  test('debe rechazar rating > 5', () => {
    const { error } = createReviewSchema.validate({
      doctor: '507f1f77bcf86cd799439011',
      rating: 6
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('5');
  });

  test('debe rechazar rating decimal', () => {
    const { error } = createReviewSchema.validate({
      doctor: '507f1f77bcf86cd799439011',
      rating: 4.5
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('entero');
  });

  test('debe rechazar texto muy corto (< 10 caracteres)', () => {
    const { error } = createReviewSchema.validate({
      doctor: '507f1f77bcf86cd799439011',
      rating: 5,
      reviewText: 'Bien'
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('10');
  });

  test('debe rechazar texto muy largo (> 1000 caracteres)', () => {
    const longText = 'a'.repeat(1001);
    const { error } = createReviewSchema.validate({
      doctor: '507f1f77bcf86cd799439011',
      rating: 5,
      reviewText: longText
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('1000');
  });

  test('debe limpiar espacios del texto', () => {
    const { value } = createReviewSchema.validate({
      doctor: '507f1f77bcf86cd799439011',
      rating: 5,
      reviewText: '   Muy buen doctor   '
    });
    expect(value.reviewText).toBe('Muy buen doctor');
  });
});

describe('Review Schemas - updateReviewSchema', () => {
  test('debe aceptar actualización de rating', () => {
    const { error } = updateReviewSchema.validate({
      rating: 4
    });
    expect(error).toBeUndefined();
  });

  test('debe aceptar actualización de texto', () => {
    const { error } = updateReviewSchema.validate({
      reviewText: 'Actualizo mi opinión: excelente profesional'
    });
    expect(error).toBeUndefined();
  });

  test('debe aceptar actualización de ambos campos', () => {
    const { error } = updateReviewSchema.validate({
      rating: 5,
      reviewText: 'Actualización completa de mi reseña anterior'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar actualización vacía', () => {
    const { error } = updateReviewSchema.validate({});
    expect(error).toBeDefined();
    expect(error.message).toContain('al menos un campo');
  });

  test('debe rechazar rating inválido', () => {
    const { error } = updateReviewSchema.validate({
      rating: 7
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar texto muy corto', () => {
    const { error } = updateReviewSchema.validate({
      reviewText: 'OK'
    });
    expect(error).toBeDefined();
  });

  test('debe limpiar espacios del texto', () => {
    const { value } = updateReviewSchema.validate({
      reviewText: '   Texto actualizado   '
    });
    expect(value.reviewText).toBe('Texto actualizado');
  });
});

describe('Review Schemas - getDoctorReviewsQuerySchema', () => {
  test('debe usar valores por defecto para paginación', () => {
    const { value } = getDoctorReviewsQuerySchema.validate({});
    expect(value.page).toBe(1);
    expect(value.limit).toBe(10);
  });

  // NOTA: doctor y userId no están en getDoctorReviewsQuerySchema
  // doctor viene de req.params, userId se obtiene del token

  test('debe aceptar filtro por rating mínimo', () => {
    const { error } = getDoctorReviewsQuerySchema.validate({
      minRating: 4
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar minRating < 1', () => {
    const { error } = getDoctorReviewsQuerySchema.validate({
      minRating: 0
    });
    expect(error).toBeDefined();
  });

  // NOTA: maxRating no está implementado en getDoctorReviewsQuerySchema

  test('debe aceptar ordenamiento por fecha', () => {
    const { error } = getDoctorReviewsQuerySchema.validate({
      sortBy: 'recent'
    });
    expect(error).toBeUndefined();
  });

  test('debe aceptar ordenamiento por rating', () => {
    const { error } = getDoctorReviewsQuerySchema.validate({
      sortBy: 'highest'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar sortBy inválido', () => {
    const { error } = getDoctorReviewsQuerySchema.validate({
      sortBy: 'invalid-field'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar sortOrder inválido', () => {
    const { error } = getDoctorReviewsQuerySchema.validate({
      sortOrder: 'random'
    });
    expect(error).toBeDefined();
  });

  test('debe convertir strings a números en paginación', () => {
    const { value } = getDoctorReviewsQuerySchema.validate({
      page: '3',
      limit: '50'
    });
    expect(value.page).toBe(3);
    expect(value.limit).toBe(50);
  });

  test('debe rechazar limit > 100 (protección DoS)', () => {
    const { error } = getDoctorReviewsQuerySchema.validate({
      limit: 200
    });
    expect(error).toBeDefined();
  });
});
