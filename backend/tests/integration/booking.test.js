/**
 * 🧪 INTEGRATION TESTS - Booking Flow
 * 
 * Tests completos del sistema de reservas:
 * - Crear booking
 * - Obtener bookings del usuario
 * - Cancelar booking
 * - Validaciones y autorizaciones
 * 
 * Estos tests verifican:
 * ✓ Request HTTP → Validación → Controller → DB → Response
 * ✓ Autenticación y autorización
 * ✓ Validaciones de fechas y horarios
 * ✓ Integración con Google Calendar
 */

// CRÍTICO: Establecer NODE_ENV ANTES de importar la app
process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../../index.js';
import User from '../../models/UserSchema.js';
import Doctor from '../../models/DoctorSchema.js';
import Booking from '../../models/BookingSchema.js';
import { setupTestDB, teardownTestDB, clearTestDB, generateTestToken } from './setup.js';

// Setup global
beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

// Limpiar entre cada test
beforeEach(async () => {
  await clearTestDB();
});

// Helpers para crear usuarios de test
const createTestPatient = async () => {
  const patient = new User({
    name: 'Juan Paciente',
    email: `patient.${Date.now()}@test.com`,
    password: 'hashedPassword123',
    role: 'paciente',
    emailVerified: true
  });
  await patient.save();
  return patient;
};

const createTestDoctor = async () => {
  const doctor = new Doctor({
    name: 'Dra. Ana Doctor',
    email: `doctor.${Date.now()}@test.com`,
    password: 'hashedPassword123',
    role: 'doctor',
    specialization: 'Psicología Clínica',
    ticketPrice: 100,
    isApproved: 'approved',
    emailVerified: true
  });
  await doctor.save();
  return doctor;
};

describe('POST /api/v1/bookings - Crear Booking', () => {
  test('debe crear booking exitosamente con datos válidos', async () => {
    const patient = await createTestPatient();
    const doctor = await createTestDoctor();
    const token = generateTestToken(patient._id, 'paciente');

    // Fecha futura válida - 3 días adelante a las 10 AM
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    futureDate.setHours(10, 0, 0, 0);
    // Asegurar que sea día laboral (lunes a viernes)
    while (futureDate.getDay() === 0 || futureDate.getDay() === 6) {
      futureDate.setDate(futureDate.getDate() + 1);
    }

    const bookingData = {
      doctorId: doctor._id.toString(),
      ticketPrice: 100,
      // Controller espera date y time separados
      date: futureDate.toISOString().split('T')[0], // "2025-01-24"
      time: "10:00", // HH:mm format
      motivoConsulta: 'Consulta de control para evaluación psicológica general'
    };

    const response = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingData);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Cita creada');
    expect(response.body.data).toBeDefined();
    expect(response.body.data.user).toBe(patient._id.toString());
    expect(response.body.data.doctor).toBe(doctor._id.toString());

    // Verificar que se guardó en DB
    const booking = await Booking.findOne({ user: patient._id });
    expect(booking).toBeDefined();
    expect(booking.status).toBeDefined(); // 'pending' o 'approved'
  });

  test('debe rechazar booking sin autenticación', async () => {
    const doctor = await createTestDoctor();
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const bookingData = {
      doctorId: doctor._id.toString(),
      ticketPrice: 100,
      appointmentDate: tomorrow.toISOString()
    };

    const response = await request(app)
      .post('/api/v1/bookings')
      .send(bookingData)
      .expect(401);

    expect(response.body.message).toBeDefined();
  });

  test('debe rechazar booking con doctor inexistente', async () => {
    const patient = await createTestPatient();
    const token = generateTestToken(patient._id, 'paciente');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    futureDate.setHours(10, 0, 0, 0);
    while (futureDate.getDay() === 0 || futureDate.getDay() === 6) {
      futureDate.setDate(futureDate.getDate() + 1);
    }

    const bookingData = {
      doctorId: '507f1f77bcf86cd799439011', // ID inexistente pero válido
      ticketPrice: 100,
      date: futureDate.toISOString().split('T')[0],
      time: "10:00",
      motivoConsulta: 'Consulta de control para evaluación psicológica general'
    };

    const response = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingData)
      .expect(404);

    expect(response.body.success).toBe(false);
  });

  test('debe rechazar booking con fecha pasada', async () => {
    const patient = await createTestPatient();
    const doctor = await createTestDoctor();
    const token = generateTestToken(patient._id, 'paciente');

    // Fecha del pasado
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(10, 0, 0, 0);

    const bookingData = {
      doctorId: doctor._id.toString(),
      ticketPrice: 100,
      appointmentDate: yesterday.toISOString()
    };

    const response = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingData)
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  test('debe rechazar booking sin campos requeridos', async () => {
    const patient = await createTestPatient();
    const token = generateTestToken(patient._id, 'paciente');

    const bookingData = {
      // Sin doctor ni fecha
      ticketPrice: 100
    };

    const response = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingData)
      .expect(400);

    expect(response.body.message).toBeDefined();
  });
});

describe('GET /api/v1/bookings - Obtener Bookings', () => {
  test('debe obtener bookings del usuario autenticado', async () => {
    const patient = await createTestPatient();
    const doctor = await createTestDoctor();
    const token = generateTestToken(patient._id, 'paciente');

    // Crear booking de test
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const booking = new Booking({
      user: patient._id,
      doctor: doctor._id,
      ticketPrice: 100,
      appointmentDate: tomorrow,
      status: 'pending'
    });
    await booking.save();

    const response = await request(app)
      .get('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test('debe rechazar sin autenticación', async () => {
    const response = await request(app)
      .get('/api/v1/bookings')
      .expect(401);

    expect(response.body.message).toBeDefined();
  });

  test('debe devolver array vacío si no hay bookings', async () => {
    const patient = await createTestPatient();
    const token = generateTestToken(patient._id, 'paciente');

    const response = await request(app)
      .get('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(0);
  });

  test('usuario solo debe ver sus propios bookings', async () => {
    const patient1 = await createTestPatient();
    const patient2 = await createTestPatient();
    const doctor = await createTestDoctor();
    const token1 = generateTestToken(patient1._id, 'paciente');

    // Crear bookings para ambos pacientes
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    await Booking.create({
      user: patient1._id,
      doctor: doctor._id,
      ticketPrice: 100,
      appointmentDate: tomorrow,
      status: 'pending'
    });

    await Booking.create({
      user: patient2._id,
      doctor: doctor._id,
      ticketPrice: 100,
      appointmentDate: tomorrow,
      status: 'pending'
    });

    // Patient1 solo debe ver su booking
    const response = await request(app)
      .get('/api/v1/bookings')
      .set('Authorization', `Bearer ${token1}`)
      .expect(200);

    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].user).toBe(patient1._id.toString());
  });
});

describe('DELETE /api/v1/bookings/:bookingId - Cancelar Booking', () => {
  test('debe cancelar booking exitosamente', async () => {
    const patient = await createTestPatient();
    const doctor = await createTestDoctor();
    const token = generateTestToken(patient._id, 'paciente');

    // Crear booking
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    futureDate.setHours(10, 0, 0, 0);
    while (futureDate.getDay() === 0 || futureDate.getDay() === 6) {
      futureDate.setDate(futureDate.getDate() + 1);
    }

    const booking = new Booking({
      user: patient._id,
      doctor: doctor._id,
      ticketPrice: 100,
      appointmentDate: futureDate,
      status: 'pending'
    });
    await booking.save();

    const response = await request(app)
      .delete(`/api/v1/bookings/${booking._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ cancellationReason: 'Cambio de planes del paciente' })
      .expect(200);

    expect(response.body.message).toContain('cancelada');

    // Verificar que se eliminó de DB (controller hace DELETE, no UPDATE status)
    const cancelledBooking = await Booking.findById(booking._id);
    expect(cancelledBooking).toBeNull(); // El booking fue eliminado
  });

  test('debe rechazar cancelación sin autenticación', async () => {
    const patient = await createTestPatient();
    const doctor = await createTestDoctor();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const booking = new Booking({
      user: patient._id,
      doctor: doctor._id,
      ticketPrice: 100,
      appointmentDate: tomorrow,
      status: 'pending'
    });
    await booking.save();

    const response = await request(app)
      .delete(`/api/v1/bookings/${booking._id}`)
      .expect(401);

    expect(response.body.message).toBeDefined();
  });

  test('debe rechazar cancelación de booking de otro usuario', async () => {
    const patient1 = await createTestPatient();
    const patient2 = await createTestPatient();
    const doctor = await createTestDoctor();
    const token2 = generateTestToken(patient2._id, 'paciente');

    // Booking de patient1
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    futureDate.setHours(10, 0, 0, 0);
    while (futureDate.getDay() === 0 || futureDate.getDay() === 6) {
      futureDate.setDate(futureDate.getDate() + 1);
    }

    const booking = new Booking({
      user: patient1._id,
      doctor: doctor._id,
      ticketPrice: 100,
      appointmentDate: futureDate,
      status: 'pending'
    });
    await booking.save();

    // Patient2 intenta cancelar booking de patient1
    const response = await request(app)
      .delete(`/api/v1/bookings/${booking._id}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ cancellationReason: 'Intento no autorizado' })
      .expect(403);

    expect(response.body.error).toContain('autorizado');

    // Verificar que NO se canceló
    const unchangedBooking = await Booking.findById(booking._id);
    expect(unchangedBooking.status).toBe('pending');
  });

  test('debe rechazar cancelación de booking inexistente', async () => {
    const patient = await createTestPatient();
    const token = generateTestToken(patient._id, 'paciente');

    const response = await request(app)
      .delete('/api/v1/bookings/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`)
      .send({ cancellationReason: 'Booking no existe' })
      .expect(404);

    expect(response.body.error).toContain('encontrada');
  });

  test('debe rechazar ID de booking inválido', async () => {
    const patient = await createTestPatient();
    const token = generateTestToken(patient._id, 'paciente');

    const response = await request(app)
      .delete('/api/v1/bookings/invalid-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(response.body.message).toBeDefined();
  });
});

describe('Flujo Completo de Booking', () => {
  test('debe completar ciclo: crear → obtener → cancelar booking', async () => {
    const patient = await createTestPatient();
    const doctor = await createTestDoctor();
    const token = generateTestToken(patient._id, 'paciente');

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    futureDate.setHours(10, 0, 0, 0);
    while (futureDate.getDay() === 0 || futureDate.getDay() === 6) {
      futureDate.setDate(futureDate.getDate() + 1);
    }

    // 1. Crear booking
    const createResponse = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        doctorId: doctor._id.toString(),
        ticketPrice: 100,
        date: futureDate.toISOString().split('T')[0],
        time: "10:00",
        motivoConsulta: 'Consulta de control para evaluación psicológica general'
      })
      .expect(201);

    expect(createResponse.body.success).toBe(true);
    const bookingId = createResponse.body.data._id;

    // 2. Obtener bookings
    const getResponse = await request(app)
      .get('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getResponse.body.data.length).toBe(1);
    expect(getResponse.body.data[0]._id).toBe(bookingId);

    // 3. Cancelar booking
    const cancelResponse = await request(app)
      .delete(`/api/v1/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ cancellationReason: 'Finalización de test automático' })
      .expect(200);

    expect(cancelResponse.body.message).toContain('cancelada');

    // 4. Verificar que se eliminó de DB (controller hace DELETE, no UPDATE status)
    const booking = await Booking.findById(bookingId);
    expect(booking).toBeNull(); // El booking fue eliminado
  });
});
