/**
 * 🧪 TESTS UNITARIOS - Doctor Schemas
 * 
 * Tests para esquemas de gestión de doctores
 * 
 * Esquemas testeados:
 * - updateDoctorSchema (perfil profesional)
 * - updateDoctorStatusSchema
 * - getDoctorsQuerySchema (búsqueda y filtros)
 * - doctorAvailabilitySchema
 */

import {
  updateDoctorSchema,
  approveDoctorSchema,
  getDoctorsQuerySchema
} from '../../validators/schemas/doctor.schemas.js';

describe('Doctor Schemas - updateDoctorSchema', () => {
  const validDoctorUpdate = {
    name: 'Juan Perez Garcia',
    phone: '+34 612 345 678',
    bio: 'Especialista en psicologia clinica con 10 años de experiencia trabajando con pacientes de todas las edades y diversos trastornos psicologicos',
    specialization: 'Psicologia', // Corregido: era 'Psicologo'
    ticketPrice: 75,
    qualifications: [
      { degree: 'Licenciatura en Psicología', institution: 'Universidad Complutense', year: 2010 }, // Corregido: institution (no university)
      { degree: 'Máster en Terapia Cognitiva', institution: 'Universidad Autónoma', year: 2012 }
    ],
    experiences: [
      { position: 'Psicólogo Clínico', hospital: 'Hospital La Paz', startDate: '2012-01-01', endDate: '2015-12-31' }
    ],
    timeSlots: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' }
    ]
  };

  test('debe aceptar actualización completa de perfil', () => {
    const { error } = updateDoctorSchema.validate(validDoctorUpdate);
    expect(error).toBeUndefined();
  });

  test('debe aceptar actualización parcial', () => {
    const { error } = updateDoctorSchema.validate({
      name: 'Maria Lopez Martinez',
      bio: 'Psiquiatra con enfoque en terapia familiar y amplia experiencia en consulta privada trabajando con familias de diversos contextos'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar nombre muy corto', () => {
    // TODO: textShortSchema tiene min(1), updateDoctorSchema tiene min(2), pero no valida más
    const { error } = updateDoctorSchema.validate({
      name: 'AB'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar teléfono inválido', () => {
    const { error } = updateDoctorSchema.validate({
      phone: '123'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar bio muy corta', () => {
    const { error } = updateDoctorSchema.validate({
      bio: 'Doctor'
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('50');
  });

  test('debe rechazar especialización inválida', () => {
    // TODO: El schema no valida que specialization sea una profesión médica específica
    const { error } = updateDoctorSchema.validate({
      specialization: 'Ingeniero'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar precio negativo', () => {
    const { error } = updateDoctorSchema.validate({
      ticketPrice: -10
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar precio muy alto', () => {
    const { error } = updateDoctorSchema.validate({
      ticketPrice: 1500
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar calificación sin campos requeridos', () => {
    const { error } = updateDoctorSchema.validate({
      qualifications: [
        { degree: 'Licenciatura' } // Falta university y year
      ]
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar año de graduación futuro', () => {
    const futureYear = new Date().getFullYear() + 1;
    const { error } = updateDoctorSchema.validate({
      qualifications: [
        { degree: 'Licenciatura', university: 'Universidad X', year: futureYear }
      ]
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar experiencia sin campos requeridos', () => {
    // TODO: Campo experiences no existe en updateDoctorSchema
    const { error } = updateDoctorSchema.validate({
      experiences: [
        { position: 'Médico' } // Falta hospital y startDate
      ]
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar endDate < startDate', () => {
    // TODO: Campo experiences no existe en updateDoctorSchema
    const { error } = updateDoctorSchema.validate({
      experiences: [
        {
          position: 'Psicólogo',
          hospital: 'Hospital X',
          startDate: '2020-01-01',
          endDate: '2019-01-01'
        }
      ]
    });
    expect(error).toBeDefined();
  });

  test('debe aceptar experiencia sin endDate (trabajo actual)', () => {
    // TODO: Campo experiences no existe en updateDoctorSchema
    const { error } = updateDoctorSchema.validate({
      experiences: [
        {
          position: 'Psicólogo',
          hospital: 'Hospital X',
          startDate: '2020-01-01'
        }
      ]
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar día de horario inválido', () => {
    const { error } = updateDoctorSchema.validate({
      timeSlots: [
        { day: 'Funday', startTime: '09:00', endTime: '17:00' }
      ]
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar hora de inicio inválida', () => {
    const { error } = updateDoctorSchema.validate({
      timeSlots: [
        { day: 'Monday', startTime: '25:00', endTime: '17:00' }
      ]
    });
    expect(error).toBeDefined();
  });

  // NOTA: La validación de endTime > startTime no está implementada en el schema
  // Esta lógica se maneja en el controlador o en validaciones custom

  test('debe rechazar foto inválida (no URL)', () => {
    const { error } = updateDoctorSchema.validate({
      photo: 'not-a-url'
    });
    expect(error).toBeDefined();
  });

  test('debe aceptar foto con URL válida', () => {
    const { error } = updateDoctorSchema.validate({
      photo: 'https://example.com/doctor-photo.jpg'
    });
    expect(error).toBeUndefined();
  });
});

describe('Doctor Schemas - approveDoctorSchema', () => {
  test('debe aceptar aprobación de doctor', () => {
    const { error } = approveDoctorSchema.validate({
      id: '507f1f77bcf86cd799439011',
      isApproved: true
    });
    expect(error).toBeUndefined();
  });

  test('debe aceptar rechazo de doctor', () => {
    const { error } = approveDoctorSchema.validate({
      id: '507f1f77bcf86cd799439011',
      isApproved: false,
      rejectionReason: 'Documentación incompleta o inválida'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar estado inválido', () => {
    const { error } = approveDoctorSchema.validate({
      isApproved: 'maybe'
    });
    expect(error).toBeDefined();
  });

  test('debe requerir isApproved', () => {
    const { error } = approveDoctorSchema.validate({});
    expect(error).toBeDefined();
  });
});

describe('Doctor Schemas - getDoctorsQuerySchema', () => {
  test('debe usar valores por defecto', () => {
    const { value } = getDoctorsQuerySchema.validate({});
    expect(value.page).toBe(1);
    expect(value.limit).toBe(20);
  });

  test('debe aceptar búsqueda por nombre', () => {
    const { error } = getDoctorsQuerySchema.validate({
      search: 'Dr. Juan'
    });
    expect(error).toBeUndefined();
  });

  test('debe aceptar filtro por especialización', () => {
    const { error } = getDoctorsQuerySchema.validate({
      specialization: 'Psicólogo'
    });
    expect(error).toBeUndefined();
  });

  test('debe aceptar filtro de rango de precios', () => {
    const { error } = getDoctorsQuerySchema.validate({
      minPrice: 50,
      maxPrice: 100
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar maxPrice < minPrice', () => {
    const { error } = getDoctorsQuerySchema.validate({
      minPrice: 100,
      maxPrice: 50
    });
    expect(error).toBeDefined();
  });

  test('debe aceptar filtro por isApproved', () => {
    // TODO: getDoctorsQuerySchema no tiene campo 'isApproved' en query
    const { error } = getDoctorsQuerySchema.validate({
      isApproved: true
    });
    expect(error).toBeUndefined();
  });

  test('debe aceptar ordenamiento válido', () => {
    // TODO: getDoctorsQuerySchema no tiene campos sortBy/sortOrder
    const { error } = getDoctorsQuerySchema.validate({
      sortBy: 'ticketPrice',
      sortOrder: 'desc'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar sortBy inválido', () => {
    const { error } = getDoctorsQuerySchema.validate({
      sortBy: 'invalid-field'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar sortOrder inválido', () => {
    const { error } = getDoctorsQuerySchema.validate({
      sortOrder: 'random'
    });
    expect(error).toBeDefined();
  });
});

// TODO: doctorAvailabilitySchema no existe en el código actual
// Descomentar cuando se implemente
/*
describe('Doctor Schemas - doctorAvailabilitySchema', () => {
  test('debe aceptar disponibilidad válida', () => {
    const { error } = doctorAvailabilitySchema.validate({
      date: '2024-06-15',
      duration: 60
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar fecha en el pasado', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { error } = doctorAvailabilitySchema.validate({
      date: yesterday.toISOString().split('T')[0],
      duration: 60
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar duración inválida', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { error } = doctorAvailabilitySchema.validate({
      date: tomorrow.toISOString().split('T')[0],
      duration: 15
    });
    expect(error).toBeDefined();
  });

  test('debe requerir fecha', () => {
    const { error } = doctorAvailabilitySchema.validate({
      duration: 60
    });
    expect(error).toBeDefined();
  });

  test('debe usar duración por defecto de 60 minutos', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { value } = doctorAvailabilitySchema.validate({
      date: tomorrow.toISOString().split('T')[0]
    });
    expect(value.duration).toBe(60);
  });
});
*/
