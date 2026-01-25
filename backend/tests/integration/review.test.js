/**
 * 🧪 INTEGRATION TESTS - REVIEWS MODULE
 * 
 * Tests de integración para el sistema de reseñas:
 * - Crear reseña
 * - Obtener reseñas de un doctor
 * - Validaciones (rating 1-5, texto mínimo)
 * - Autorización (solo pacientes)
 * 
 * Arquitectura:
 * - Rutas anidadas: /api/v1/doctors/:doctorId/reviews
 * - Validación con Joi
 * - Autenticación con JWT
 */

import request from 'supertest';
import app from '../../index.js';
import { setupTestDB, teardownTestDB, clearTestDB, generateTestToken } from './setup.js';
import Review from '../../models/ReviewSchema.js';
import Doctor from '../../models/DoctorSchema.js';
import User from '../../models/UserSchema.js'; // Necesario para crear usuarios

// Helpers definidos localmente para evitar problemas de exportación
const createTestPatient = async () => {
    const patient = new User({
        name: 'Review Patient',
        email: `review.patient.${Date.now()}@test.com`,
        password: 'hashedPassword123',
        role: 'paciente',
        emailVerified: true
    });
    await patient.save();
    return patient;
};

const createTestDoctor = async () => {
    const doctor = new Doctor({
        name: 'Review Doctor',
        email: `review.doctor.${Date.now()}@test.com`,
        password: 'hashedPassword123',
        role: 'doctor',
        specialization: 'Psiquiatría',
        ticketPrice: 150,
        isApproved: 'approved',
        emailVerified: true
    });
    await doctor.save();
    return doctor;
};

// Setup/teardown de la base de datos de prueba
beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('POST /api/v1/doctors/:doctorId/reviews - Crear Reseña', () => {
  test('debe crear reseña válida de un paciente', async () => {
    const patient = await createTestPatient();
    const doctor = await createTestDoctor();
    const token = generateTestToken(patient._id, 'paciente');

    const reviewData = {
      rating: 5,
      reviewText: 'Excelente atención, muy profesional y empático. Lo recomiendo ampliamente.'
    };

    const response = await request(app)
      .post(`/api/v1/doctors/${doctor._id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send(reviewData);
    
    // Imprimir error si falla
    if (response.status !== 200) {
        console.log('❌ Review creation failed:', response.status, JSON.stringify(response.body, null, 2));
    }

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Review created');
    expect(response.body.data).toBeDefined();
    expect(response.body.data.rating).toBe(5);
    expect(response.body.data.reviewText).toBe(reviewData.reviewText);
    expect(response.body.data.user.toString()).toBe(patient._id.toString());
    expect(response.body.data.doctor.toString()).toBe(doctor._id.toString());

    // Verificar que se guardó en DB
    const review = await Review.findOne({ user: patient._id });
    expect(review).toBeDefined();
    expect(review.rating).toBe(5);

    // Verificar que se agregó al array de reviews del doctor
    const updatedDoctor = await Doctor.findById(doctor._id);
    expect(updatedDoctor.reviews).toHaveLength(1);
    expect(updatedDoctor.reviews[0].toString()).toBe(review._id.toString());
  });

  test('debe rechazar reseña sin autenticación', async () => {
    const doctor = await createTestDoctor();

    const response = await request(app)
      .post(`/api/v1/doctors/${doctor._id}/reviews`)
      .send({
        rating: 5,
        reviewText: 'Test review sin autenticación'
      })
      .expect(401);

    expect(response.body.message).toBeDefined();
  });

  test('debe rechazar rating fuera de rango (0)', async () => {
    const patient = await createTestPatient();
    const doctor = await createTestDoctor();
    const token = generateTestToken(patient._id, 'paciente');

    const response = await request(app)
      .post(`/api/v1/doctors/${doctor._id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        rating: 0, // Inválido
        reviewText: 'Rating debe ser 1-5'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('validación');
  });

  test('debe rechazar rating fuera de rango (6)', async () => {
    const patient = await createTestPatient();
    const doctor = await createTestDoctor();
    const token = generateTestToken(patient._id, 'paciente');

    const response = await request(app)
      .post(`/api/v1/doctors/${doctor._id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        rating: 6, // Inválido
        reviewText: 'Rating debe ser 1-5'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  test('debe rechazar texto demasiado corto', async () => {
    const patient = await createTestPatient();
    const doctor = await createTestDoctor();
    const token = generateTestToken(patient._id, 'paciente');

    const response = await request(app)
      .post(`/api/v1/doctors/${doctor._id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        rating: 5,
        reviewText: 'Corto' // < 10 caracteres
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });

  test('debe rechazar sin campos requeridos', async () => {
    const patient = await createTestPatient();
    const doctor = await createTestDoctor();
    const token = generateTestToken(patient._id, 'paciente');

    const response = await request(app)
      .post(`/api/v1/doctors/${doctor._id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  test('debe rechazar doctor inexistente', async () => {
    const patient = await createTestPatient();
    const token = generateTestToken(patient._id, 'paciente');
    const fakeId = '507f1f77bcf86cd799439011';

    const response = await request(app)
      .post(`/api/v1/doctors/${fakeId}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        rating: 5,
        reviewText: 'Review para doctor inexistente'
      })
      .expect(404);

    expect(response.body.success).toBe(false);
  });

  test('debe permitir ratings de 1 a 5', async () => {
    const patient = await createTestPatient();
    const doctor = await createTestDoctor();
    const token = generateTestToken(patient._id, 'paciente');

    // Test rating = 1
    const response1 = await request(app)
      .post(`/api/v1/doctors/${doctor._id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        rating: 1,
        reviewText: 'Muy mala experiencia, no lo recomiendo para nada.'
      })
      .expect(200);

    expect(response1.body.data.rating).toBe(1);

    // Limpiar para siguiente test
    await Review.deleteMany({});

    // Test rating = 3
    const response3 = await request(app)
      .post(`/api/v1/doctors/${doctor._id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        rating: 3,
        reviewText: 'Experiencia regular, hay aspectos a mejorar.'
      })
      .expect(200);

    expect(response3.body.data.rating).toBe(3);
  });
});

describe('GET /api/v1/doctors/:doctorId/reviews - Obtener Reseñas', () => {
  test('debe obtener todas las reseñas de un doctor', async () => {
    const patient1 = await createTestPatient();
    const patient2 = await createTestPatient();
    const doctor = await createTestDoctor();

    // Crear 2 reseñas
    await Review.create({
      user: patient1._id,
      doctor: doctor._id,
      rating: 5,
      reviewText: 'Excelente doctor, muy recomendado.'
    });

    await Review.create({
      user: patient2._id,
      doctor: doctor._id,
      rating: 4,
      reviewText: 'Buena atención, aunque la espera fue larga.'
    });

    const response = await request(app)
      .get(`/api/v1/doctors/${doctor._id}/reviews`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBeGreaterThanOrEqual(2);
  });

  test('debe funcionar sin autenticación (reseñas públicas)', async () => {
    const doctor = await createTestDoctor();
    const patient = await createTestPatient();

    await Review.create({
      user: patient._id,
      doctor: doctor._id,
      rating: 5,
      reviewText: 'Muy buen profesional, excelente trato.'
    });

    const response = await request(app)
      .get(`/api/v1/doctors/${doctor._id}/reviews`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  test('debe devolver array vacío si no hay reseñas', async () => {
    const doctor = await createTestDoctor();

    const response = await request(app)
      .get(`/api/v1/doctors/${doctor._id}/reviews`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

describe('Flujo Completo de Reseñas', () => {
  test('debe completar ciclo: crear reseña → obtener reseñas → verificar en doctor', async () => {
    const patient = await createTestPatient();
    const doctor = await createTestDoctor();
    const token = generateTestToken(patient._id, 'paciente');

    // 1. Crear reseña
    const createResponse = await request(app)
      .post(`/api/v1/doctors/${doctor._id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        rating: 5,
        reviewText: 'Atención excelente, muy profesional y atento.'
      })
      .expect(200);

    expect(createResponse.body.success).toBe(true);
    const reviewId = createResponse.body.data._id;

    // 2. Obtener reseñas del doctor
    const getResponse = await request(app)
      .get(`/api/v1/doctors/${doctor._id}/reviews`)
      .expect(200);

    expect(getResponse.body.data.length).toBeGreaterThanOrEqual(1);

    // 3. Verificar que el doctor tiene la reseña en su array
    const updatedDoctor = await Doctor.findById(doctor._id);
    expect(updatedDoctor.reviews).toHaveLength(1);
    expect(updatedDoctor.reviews[0].toString()).toBe(reviewId);
  });

  test('múltiples pacientes pueden reseñar al mismo doctor', async () => {
    const patient1 = await createTestPatient();
    const patient2 = await createTestPatient();
    const patient3 = await createTestPatient();
    const doctor = await createTestDoctor();

    const token1 = generateTestToken(patient1._id, 'paciente');
    const token2 = generateTestToken(patient2._id, 'paciente');
    const token3 = generateTestToken(patient3._id, 'paciente');

    // Crear 3 reseñas de diferentes pacientes
    await request(app)
      .post(`/api/v1/doctors/${doctor._id}/reviews`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ rating: 5, reviewText: 'Excelente profesional, muy recomendado.' })
      .expect(200);

    await request(app)
      .post(`/api/v1/doctors/${doctor._id}/reviews`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ rating: 4, reviewText: 'Buena atención, aunque un poco apresurado.' })
      .expect(200);

    await request(app)
      .post(`/api/v1/doctors/${doctor._id}/reviews`)
      .set('Authorization', `Bearer ${token3}`)
      .send({ rating: 5, reviewText: 'Me ayudó muchísimo, lo recomiendo ampliamente.' })
      .expect(200);

    // Verificar que el doctor tiene 3 reseñas
    const updatedDoctor = await Doctor.findById(doctor._id);
    expect(updatedDoctor.reviews).toHaveLength(3);

    // Verificar via GET
    const response = await request(app)
      .get(`/api/v1/doctors/${doctor._id}/reviews`)
      .expect(200);

    expect(response.body.data.length).toBeGreaterThanOrEqual(3);
  });
});
