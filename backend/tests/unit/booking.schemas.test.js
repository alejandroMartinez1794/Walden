/**
 * 🧪 TESTS UNITARIOS - Booking Schemas
 * 
 * Tests para esquemas de sistema de citas
 * 
 * Esquemas testeados:
 * - createBookingSchema (reglas de negocio complejas)
 * - updateBookingSchema
 * - cancelBookingSchema
 * - getBookingsQuerySchema
 * - rateBookingSchema
 */

import {
  createBookingSchema,
  updateBookingSchema,
  cancelBookingSchema,
  getBookingsQuerySchema,
  rateBookingSchema
} from '../../validators/schemas/booking.schemas.js';

describe('Booking Schemas - createBookingSchema', () => {
  // Fecha válida: Lunes a las 10am, 2 días en el futuro
  const getTomorrowAt10AM = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    date.setHours(10, 0, 0, 0);
    // Asegurar que sea día de semana (lunes a viernes)
    const day = date.getDay();
    if (day === 0) date.setDate(date.getDate() + 1); // Si es domingo, mover a lunes
    if (day === 6) date.setDate(date.getDate() + 2); // Si es sábado, mover a lunes
    return date.toISOString();
  };

  const validBookingData = {
    doctorId: '507f1f77bcf86cd799439011',
    appointmentDate: getTomorrowAt10AM(),
    reason: 'Consulta general por dolor de cabeza recurrente',
    duration: 60
  };

  test('debe aceptar cita válida', () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    
    const { error } = createBookingSchema.validate(validBookingData, {
      context: { maxDate: maxDate.toISOString() }
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar cita sin doctor', () => {
    const data = { ...validBookingData };
    delete data.doctorId;
    const { error } = createBookingSchema.validate(data);
    expect(error).toBeDefined();
    expect(error.message).toContain('ID');
  });

  test('debe rechazar doctor con ID inválido', () => {
    const data = { ...validBookingData, doctorId: 'invalid-id' };
    const { error } = createBookingSchema.validate(data);
    expect(error).toBeDefined();
  });

  test('debe rechazar fecha en el pasado', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    const data = { ...validBookingData, appointmentDate: pastDate.toISOString() };
    const { error } = createBookingSchema.validate(data);
    expect(error).toBeDefined();
  });

  test('debe rechazar cita muy adelante (> 3 meses)', () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 4);
    
    const data = { ...validBookingData, appointmentDate: futureDate.toISOString() };
    const { error } = createBookingSchema.validate(data);
    expect(error).toBeDefined();
  });

  // NOTA: Validaciones de horario específico (8am-8pm, fin de semana) no implementadas en schema
  // Estas validaciones se manejan en el controlador o en lógica de negocio

  test('debe rechazar duración muy larga (> 4hrs)', () => {
    const data = { ...validBookingData, duration: 300 };
    const { error } = createBookingSchema.validate(data);
    expect(error).toBeDefined();
  });

  test('debe rechazar precio negativo', () => {
    const data = { ...validBookingData, ticketPrice: -10 };
    const { error } = createBookingSchema.validate(data);
    expect(error).toBeDefined();
  });

  test('debe rechazar precio muy alto (> 1000)', () => {
    const data = { ...validBookingData, ticketPrice: 1500 };
    const { error } = createBookingSchema.validate(data);
    expect(error).toBeDefined();
  });
});

describe('Booking Schemas - updateBookingSchema', () => {
  test('debe aceptar actualización parcial', () => {
    const { error } = updateBookingSchema.validate({
      status: 'confirmed'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar status inválido', () => {
    const { error } = updateBookingSchema.validate({
      status: 'invalid-status'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar actualización sin campos', () => {
    const { error } = updateBookingSchema.validate({});
    expect(error).toBeDefined();
    expect(error.message).toContain('al menos un campo');
  });

  test('debe aceptar múltiples campos', () => {
    const getTomorrow = () => {
      const date = new Date();
      date.setDate(date.getDate() + 2);
      date.setHours(10, 0, 0, 0);
      return date.toISOString();
    };

    const { error } = updateBookingSchema.validate({
      status: 'confirmed',
      appointmentDate: getTomorrow(),
      duration: 90
    });
    expect(error).toBeUndefined();
  });
});

describe('Booking Schemas - cancelBookingSchema', () => {
  test('debe aceptar cancelación con razón válida', () => {
    const { error } = cancelBookingSchema.validate({
      cancellationReason: 'Surgió una emergencia familiar'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar razón muy corta (< 10 caracteres)', () => {
    const { error } = cancelBookingSchema.validate({
      cancellationReason: 'Ocupado'
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('10');
  });

  test('debe rechazar razón muy larga (> 500 caracteres)', () => {
    const longReason = 'a'.repeat(501);
    const { error } = cancelBookingSchema.validate({
      cancellationReason: longReason
    });
    expect(error).toBeDefined();
  });

  test('debe permitir cancelación sin razón (opcional)', () => {
    const { error } = cancelBookingSchema.validate({});
    expect(error).toBeUndefined(); // cancelReason es opcional
  });
});

describe('Booking Schemas - getBookingsQuerySchema', () => {
  test('debe usar valores por defecto para paginación', () => {
    const { value } = getBookingsQuerySchema.validate({});
    expect(value.page).toBe(1);
    expect(value.limit).toBe(20);
  });

  test('debe aceptar filtros válidos', () => {
    const { error } = getBookingsQuerySchema.validate({
      status: 'confirmed',
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
      doctorId: '507f1f77bcf86cd799439011',
      page: 2,
      limit: 50
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar status inválido', () => {
    // TODO: Verificar valores exactos de status en schema
    const { error } = getBookingsQuerySchema.validate({
      status: 'invalid-status'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar dateTo < dateFrom', () => {
    const { error } = getBookingsQuerySchema.validate({
      dateFrom: '2024-12-31',
      dateTo: '2024-01-01'
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('posterior');
  });

  test('debe rechazar doctorId inválido', () => {
    const { error } = getBookingsQuerySchema.validate({
      doctorId: 'invalid-id'
    });
    expect(error).toBeDefined();
  });
});

describe('Booking Schemas - rateBookingSchema', () => {
  test('debe aceptar calificación válida', () => {
    const { error } = rateBookingSchema.validate({
      rating: 5,
      comment: 'Excelente doctor, muy profesional'
    });
    expect(error).toBeUndefined();
  });

  test('debe aceptar calificación sin comentario', () => {
    const { error } = rateBookingSchema.validate({
      rating: 4
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar rating < 1', () => {
    const { error } = rateBookingSchema.validate({
      rating: 0
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('1');
  });

  test('debe rechazar rating > 5', () => {
    const { error } = rateBookingSchema.validate({
      rating: 6
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('5');
  });

  test('debe rechazar rating decimal', () => {
    const { error } = rateBookingSchema.validate({
      rating: 4.5
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar comentario muy corto', () => {
    const { error } = rateBookingSchema.validate({
      rating: 5,
      comment: 'OK'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar comentario muy largo', () => {
    const longComment = 'a'.repeat(1001);
    const { error } = rateBookingSchema.validate({
      rating: 5,
      comment: longComment
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('1000');
  });
});
